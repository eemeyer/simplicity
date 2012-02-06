/**
 * @name $.ui.simplicityNokiaGeocoder
 * @namespace A Nokia geocoder.
 * <p>
 * Nokia geocoder widget. Also provides a jQueri UI autocomplete source.
 * <p>
 * @see Nokia Maps - JavaScript API <a href="http://api.maps.nokia.com/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityNokiaGeocoder", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>maxResults</dt>
     *   <dd>
     *     Maximum number of results to request. Defaults to <code>5</code>.
     *   </dd>
     *   <dt>debug</dt>
     *   <dd>
     *     Enable logging of key events to console.log. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityNokiaGeocoder.options
     */
    options : {
      maxResults: 5,
      debug: false
    },
    _create: function () {
      this._addClass('ui-simplicity-nokia-geocoder');
      this._searchManager = new nokia.maps.search.Manager();
      this._searchManager.maxResults = this.options.maxResults;
      this._searchManagerCallback = null;
      this._searchManager.addObserver('state', this._searchManagerObserver, this);
    },
    destroy: function () {
      if ('undefined' !== typeof this._searchManager) {
        this._searchManager.removeObserver('state', this._searchManagerObserver, this);
        delete this._searchManager;
      }
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    },
    _searchManagerObserver: function (observedManager, key, value, oldValue) {
      if (key === 'state' && (value === 'finished' || value === 'failed')) {
        var items = this.normalizeResults(observedManager);
        var response = {
          vendor: observedManager,
          items: items
        };
        this._trigger('response', {}, response);
        if (this.options.debug) {
          console.log('simplicityNokiaGeocoder: response', response);
        }
        if ($.isFunction(this._searchManagerCallback)) {
          var callback = this._searchManagerCallback;
          this._searchManagerCallback = null;
          callback(response);
        }
      }
    },
    /**
     * Perform geocoding of the <code>geocodeRequest</code> calling the
     * <code>callback</code> on completion.
     * <p>
     * Triggers two events.
     * <dl>
     *   <dt><code>request</code></dt>
     *   <dd>
     *     Final step before sending the geocode request, it is passed
     *     as the custom object to this event to allow for manipulation.
     *   </dd>
     *   <dt><code>response</code></dt>
     *   <dd>
     *     Final step before calling the <code>callback</code> with the
     *     geocode response to allow for manipulation.
     *     Triggered after any normalization phase.
     *     <p>
     *     The custom object passed to this event looks like so:
     *     <pre>
     *     {
     *       vendor: {
     *         // Original vendor response
     *       },
     *       items: [
     *         // Array of normalized items, see <code>normalizeResults</code>.
     *       ]
     *     }
     *     </pre>
     *   </dd>
     * </dl>
     *
     * @param geocodeRequest
     *   The request as expected by the upstream geocode vendor.
     * @param callback
     *   The callback triggered at geocode completion. Is given one
     *   argument which is the same as custom <code>Object</code>
     *   passed to the <code>response</code> event.
     *
     * @name $.ui.simplicityNokiaGeocoder.geocode
     * @function
     */
    geocode: function (geocodeRequest, callback) {
      this._trigger('request', {}, geocodeRequest);
      if (this.options.debug) {
        console.log('simplicityNokiaGeocoder: request', geocodeRequest);
      }
      var searchText = geocodeRequest.searchText;
      var spatialFilter = geocodeRequest.spatialFilter;
      this._searchManagerCallback = callback;
      if ('undefined' === typeof spatialFilter) {
        this._searchManager.search(searchText);
      } else {
        this._searchManager.search(searchText, spatialFilter);
      }
    },
    /**
     * Create an autocomplete source function that returns normalized
     * geocoded addresses.
     *
     * @name $.ui.simplicityNokiaGeocoder.autocompleteSource
     * @function
     */
    autocompleteSource: function (spatialFilter) {
      return $.proxy(function (request, responseCallback) {
        var geocodeRequest = {
          searchText: request.term
        };
        if ('undefined' !== typeof spatialFitler) {
          geocodeRequest.spatialFilter = spatialFilter;
        }
        this.geocode(geocodeRequest, function (response) {
          responseCallback(response.items);
        });
      }, this);
    },
    /**
     * Normalize the geocoder response. Returns an array of items.
     * <pre>
     *   Example output
     *   [
     *     {
     *       value: 'Statue of Liberty, New York, NY 11231, USA',
     *       latitude: 40.6892437,
     *       longitude: -74.0445142,
     *       vendor: {
     *         // Upstream vendor response for this single location
     *       }
     *     }
     *   ]
     * </pre>
     *
     * @name $.ui.simplicityNokiaGeocoder.normalizeResults
     * @function
     * @private
     */
    normalizeResults: function (response) {
      var items = [];
      if ($.isArray(response.locations)) {
        $.each(response.locations, $.proxy(function (idx, location) {
          var value = this.normalizeAddress(location);
          if (Boolean(value)) {
            var item = {
              value: value,
              vendor: location
            };
            if ('undefined' !== typeof location.displayPosition) {
              item.latitude = location.displayPosition.latitude;
              item.longitude = location.displayPosition.longitude;
            }
            if (typeof location.mapView !== 'undefined') {
              var mapView = location.mapView;
              item.bounds = {
                vendor: mapView,
                south: mapView.bottomRight.latitude,
                west: mapView.topLeft.longitude,
                north: mapView.topLeft.latitude,
                east: mapView.bottomRight.longitude
              };
            }
            items.push(item);
          }
        }, this));
      }
      return items;
    },
    /**
     * Normalize a single geocoded address. This gets injected
     * as the <code>value</code> of the <code>item</code> object.
     *
     * @name $.ui.simplicityNokiaGeocoder.normalizeAddress
     * @function
     * @private
     */
    normalizeAddress: function (location) {
      var output = '';
      if ('undefined' !== typeof location && 'undefined' !== typeof location.label) {
        output = location.label;
      }
      return output;
    }
  });
}(jQuery));
