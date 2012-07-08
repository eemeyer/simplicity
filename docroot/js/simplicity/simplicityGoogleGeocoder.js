/**
 * @name $.ui.simplicityGoogleGeocoder
 * @namespace A Google geocoder.
 * <p>
 * Google geocoder widget. Also provides a jQueri UI autocomplete source.
 * <p>
 * See the Google Maps JavaScript API v3 <a href="http://code.google.com/apis/maps/documentation/javascript/services.html#Geocoding">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleGeocoder", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>debug</dt>
     *   <dd>
     *     Enable logging of key events to console.log. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleGeocoder.options
     */
    options : {
      debug: false
    },
    _create: function () {
      this._addClass('ui-simplicity-google-geocoder');
      this._geocoder = new google.maps.Geocoder();
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
     * @name $.ui.simplicityGoogleGeocoder.geocode
     * @function
     */
    geocode: function (geocodeRequest, callback) {
      this._trigger('request', {}, geocodeRequest);
      if (this.options.debug) {
        console.log('simplicityGoogleGeocoder: request', geocodeRequest);
      }
      this._geocoder.geocode(geocodeRequest, $.proxy(function (results, status) {
        var items = this.normalizeResults(results, status);
        var response = {
          vendor: results,
          status: status,
          items: items
        };
        this._trigger('response', {}, response);
        if (this.options.debug) {
          console.log('simplicityGoogleGeocoder: response', response);
        }
        callback(response);
      }, this));
    },
    /**
     * Create an autocomplete source function that returns normalized
     * geocoded addresses.
     *
     * @name $.ui.simplicityGoogleGeocoder.autocompleteSource
     * @function
     */
    autocompleteSource: function () {
      return $.proxy(function (request, responseCallback) {
        this.geocode({address: request.term}, function (response) {
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
     * @name $.ui.simplicityGoogleGeocoder.normalizeResults
     * @function
     * @private
     */
    normalizeResults: function (results, status) {
      var items = [];
      if (status === google.maps.GeocoderStatus.OK && $.isArray(results)) {
        $.each(results, $.proxy(function (i, result) {
          var value = this.normalizeAddress(result);
          if (Boolean(value)) {
            var item = {
              value: value,
              vendor: result
            };
            if (typeof result.geometry !== 'undefined' &&
              typeof result.geometry.location !== 'undefined') {
              $.extend(item, {
                latitude: result.geometry.location.lat(),
                longitude: result.geometry.location.lng()
              });
            }
            if (typeof result.geometry.bounds !== 'undefined') {
              item.bounds = {
                vendor: result.geometry.bounds,
                south: result.geometry.bounds.getSouthWest().lat(),
                west: result.geometry.bounds.getSouthWest().lng(),
                north: result.geometry.bounds.getNorthEast().lat(),
                east: result.geometry.bounds.getNorthEast().lng()
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
     * @name $.ui.simplicityGoogleGeocoder.normalizeAddress
     * @function
     * @private
     */
    normalizeAddress: function (result) {
      var output = '';
      if (typeof result !== 'undefined') {
        output = result.formatted_address;
      }
      return output;
    }
  });
}(jQuery));
