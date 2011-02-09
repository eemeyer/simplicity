/**
 * @name $.ui.simplicityMapQuestGeocoder
 * @namespace A MapQuest geocoder.
 * <p>
 * Google geocoder widget. Also provides a jQueri UI autocomplete source.
 * <p>
 * See the MapQuest JavaScript SDK v6 Geocoding <a href="http://platform.beta.mapquest.com/sdk/js/v6.0.0/geocoding.html">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityMapQuestGeocoder", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>geocodeOptions</dt>
     *   <dd>
     *     Options passed to the MapQuest geocode function.
     *     Defaults to <code>{thumbMaps: false}</code>.
     *   </dd>
     *   <dt>disambiguateResults</dt>
     *   <dd>
     *     When <code>true</code> post-processes the normalized items to look for
     *     any duplicates and alter their <code>value</code>s to allow for
     *     disambiguation. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>debug</dt>
     *   <dd>
     *     Enable logging of key events to console.log. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityMapQuestGeocoder.options
     */
    options : {
      geocodeOptions: {
        thumbMaps: false
      },
      disambiguateResults: true,
      debug: false
    },
    _create: function () {
      this.element.addClass('ui-simplicity-mapquest-geocoder');
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
     *     geocode response to allow for manipulaton.
     *     Triggered after any normalization phase.
     *     <p>
     *     The custom object passed to this event looks like so:
     *     <pre>
     *     {
     *       response: {
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
     *   The callback triggered at geocode completion. Is give one
     *   argument which is the same as custom <code>Object</code>
     *   passed to the <code>response</code> event.
     *
     * @name $.ui.simplicityMapQuestGeocoder.geocode
     * @function
     */
    geocode: function (locations, callback) {
      var geocodeRequest = {
        locations: locations,
        options: $.extend({}, this.options.geocodeOptions)
      };
      this._trigger('request', {}, geocodeRequest);
      if (this.options.debug) {
        console.log('simplicityMapQuestGeocoder: request', geocodeRequest);
      }
      MQA.Geocoder.geocode(geocodeRequest.locations, geocodeRequest.options, null, $.proxy(function (geocodeResponse) {
        var items = this.normalizeResults(geocodeResponse);
        var response = {
          response: geocodeResponse,
          items: items
        };
        this._trigger('response', {}, response);
        if (this.options.debug) {
          console.log('simplicityMapQuestGeocoder: response', response);
        }
        callback(response);
      }, this));
    },
    /**
     * Create an autocomplete source function that returns normalized
     * geocoded addresses.
     *
     * @name $.ui.simplicityMapQuestGeocoder.autocompleteSource
     * @function
     */
    autocompleteSource: function () {
      return $.proxy(function (request, responseCallback) {
        this.geocode(request.term, function (response) {
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
     *       response: {
     *         // Upstream vendor response for this single location
     *       }
     *     }
     *   ]
     * </pre>
     *
     * @name $.ui.simplicityMapQuestGeocoder.normalizeResults
     * @function
     * @private
     */
    normalizeResults: function (response) {
      var items = [];
      if (response.info.statuscode === 0) {
        $.each(response.results, $.proxy(function (i, result) {
          $.each(result.locations, $.proxy(function (i, location) {
            var value = this.normalizeAddress(location);
            if (value !== '') {
              items.push({
                value: value,
                latitude: location.latLng.lat,
                longitude: location.latLng.lng,
                response: location
              });
            }
          }, this));
        }, this));
        if (this.options.disambiguateResults) {
          items = this.disambiguateItems(items);
        }
      }
      return items;
    },
    /**
     * Normalize a single geocoded address. This gets injected
     * as the <code>value</code> of the <code>item</code> object.
     *
     * @name $.ui.simplicityMapQuestGeocoder.normalizeAddress
     * @function
     * @private
     */
    normalizeAddress: function (location) {
      var value = location.street;
      if (location.adminArea5 !== '') {
        if (value !== '') {
          value += ', ';
        }
        value += location.adminArea5;
      }
      if (location.adminArea4 !== '' && location.geocodeQuality === 'COUNTY') {
        if (value !== '') {
          value += ', ';
        }
        value += location.adminArea4;
      }
      if (location.adminArea3 !== '') {
        if (value !== '') {
          value += ', ';
        }
        value += location.adminArea3;
      }
      if (location.postalCode !== '') {
        if (value !== '') {
          value += ' ';
        }
        value += location.postalCode;
      }
      return value;
    },
    disambiguateItems: function (items) {
      labelToItem = {};
      $.each(items, function (i, item) {
        var suggestionLabel = item.value;
        var duplicateItem = labelToItem[suggestionLabel];
        if (typeof duplicateItem === 'undefined') {
          if (item.response.geocodeQuality === 'STATE') {
            if (item.response.adminArea1 === 'US') {
              suggestionLabel = 'State of ' + suggestionLabel;
            }
          }
          labelToItem[suggestionLabel] = item;
        } else {
          // Duplicate label -- disambiguate via County
          suggestionLabel += ' (' + item.response.adminArea4 + ')';
          var labelToDisambiguate = duplicateItem.label;
          labelToDisambiguate += ' (' + duplicateItem.response.adminArea4 + ')';
          duplicateItem.label = labelToDisambiguate;
        }
        item.label = suggestionLabel;
      });
      return items;
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-mapquest-geocoder');
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
