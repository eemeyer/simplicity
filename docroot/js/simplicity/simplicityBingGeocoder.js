/**
 * @name $.ui.simplicityBingGeocoder
 * @namespace A Bing geocoder.
 * <p>
 * Bing geocoder widget. Also provides a jQueri UI autocomplete source.
 * <p>
 * Requires a server side proxy to work around the same-origin policy of the browser.
 * <p>
 * Example PHP proxy:
 * <pre>
 * &lt;?php
 *   $url = 'http://dev.virtualearth.net/REST/v1/Locations?' . $_SERVER['QUERY_STRING'];
 *   $c = curl_init($url);
 *   curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
 *   curl_setopt($c, CURLOPT_FAILONERROR,true);
 *   $response = curl_exec($c);
 *   echo $response;
 * ?>
 * </pre>
 *
 * <p>
 * See the Bing Maps REST Services <a href="http://msdn.microsoft.com/en-us/library/ff701713.aspx">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityBingGeocoder", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>url</dt>
     *   <dd>
     *     Mandatory option, URL of the proxied geocoding service.
     *   </dd>
     *   <dt>requestTemplate</dt>
     *   <dd>
     *     Template that the <code>geocodeRequest</code> is merged with. Used
     *     to supply any credentials that are shared across all requests.
     *     <p>
     *     Example:
     *     <pre>
     *     {
     *       key: 'YOUR_API_KEY_GOES_HERE'
     *     }
     *     </pre>
     *     Defaults to <code>{}</code>.
     *   </dd>
     *   <dt>debug</dt>
     *   <dd>
     *     Enable logging of key events to console.log. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityBingGeocoder.options
     */
    options : {
      url: '',
      requestTemplate: {
      },
      debug: false
    },
    _create: function () {
      this.element.addClass('ui-simplicity-bing-geocoder');
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
     *   The callback triggered at geocode completion. Is give one
     *   argument which is the same as custom <code>Object</code>
     *   passed to the <code>response</code> event.
     *
     * @name $.ui.simplicityBingGeocoder.geocode
     * @function
     */
    geocode: function (geocodeRequest, callback) {
      geocodeRequest = $.extend({}, this.options.requestTemplate, geocodeRequest);
      this._trigger('request', {}, geocodeRequest);
      if (this.options.debug) {
        console.log('simplicityBingGeocoder: request', geocodeRequest);
      }
      var ajaxHandler = $.proxy(function (ajaxResponse) {
        ajaxResponse.items = this.normalizeResults(ajaxResponse);
        this._trigger('response', {}, ajaxResponse);
        if (this.options.debug) {
          console.log('simplicityBingGeocoder: response', ajaxResponse);
        }
        callback(ajaxResponse);
      }, this);
      $.ajax({
        url: this.options.url,
        data: geocodeRequest,
        dataType: 'json',
        error: function (request, textStatus, errorThrown) {
          ajaxHandler({
            error: true,
            statusText: xhr.statusText,
            status: xhr.status
          });
        },
        success: function (data, status, xhr) {
          ajaxHandler({
            vendor: data,
            status: status
          });
        }
      });
    },
    /**
     * Create an autocomplete source function that returns normalized
     * geocoded addresses.
     *
     * @name $.ui.simplicityBingGeocoder.autocompleteSource
     * @function
     */
    autocompleteSource: function () {
      return $.proxy(function (request, responseCallback) {
        this.geocode({query: request.term}, function (response) {
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
     * @name $.ui.simplicityBingGeocoder.normalizeResults
     * @function
     * @private
     */
    normalizeResults: function (response) {
      var items = [];
      if (response && response.vendor && response.vendor.statusCode === 200) {
        $.each(response.vendor.resourceSets, $.proxy(function (i, resourceSet) {
          $.each(resourceSet.resources, $.proxy(function (j, result) {
            var value = this.normalizeAddress(result);
            if (value !== '') {
              items.push({
                value: value,
                latitude: result.point.coordinates[0],
                longitude: result.point.coordinates[1],
                bounds: {
                  vendor: result.bbox,
                  south: result.bbox[0],
                  west: result.bbox[1],
                  north: result.bbox[2],
                  east: result.bbox[3]
                },
                vendor: result
              });
            }
          }, this));
        }, this));
      }
      return items;
    },
    /**
     * Normalize a single geocoded address. This gets injected
     * as the <code>value</code> of the <code>item</code> object.
     *
     * @name $.ui.simplicityBingGeocoder.normalizeAddress
     * @function
     * @private
     */
    normalizeAddress: function (result) {
      return result.address.formattedAddress;
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-bing-geocoder');
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
