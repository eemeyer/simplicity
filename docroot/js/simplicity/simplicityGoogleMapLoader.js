/**
 * @name $.ui.simplicityGoogleMapLoader
 * @namespace A Google map.
 * <p>
 * Google Map widget.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMapLoader();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="http://code.google.com/apis/maps/documentation/javascript/">documentation</a>.
 */
(function ($, window) {
  $.widget("ui.simplicityGoogleMapLoader", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     * </dl>
     * @name $.ui.simplicityGoogleMapLoader.options
     */
    options: {
      apiKey: '',
      mapVersion: '3',
      mapParams: 'sensor=false'
    },
    _create: function () {
      this._addClass('ui-simplicity-google-map-loader');
      this.loadLoader();
      this.loadMapsApi();
    },
    loadLoader: function () {
      if ('undefined' === typeof google || 'undefined' === typeof google.load) {
        // The Google JS loader is missing, get it
        var callbackName = 'simplicityGoogleMapLoaderGoogleLoaderCallback';
        window[callbackName] = $.proxy(this.loadMapsApi, this);
        var src = 'http://www.google.com/jsapi?callback=' + callbackName;
        if (this.options.apiKey !== '') {
          src = src + '&key=' + this.options.apiKey;
        }
        $('head').append($('<script type="text/javascript" src="' + src + '"></script>'));
      }
    },
    loadMapsApi: function () {
      if ('undefined' !== typeof google && 'undefined' !== typeof google.load && 'undefined' === typeof google.maps) {
        // The Google JS loader is available, use it to load the maps API
        google.load('maps', this.options.mapVersion, {
          other_params: this.options.mapParams,
          callback: $.proxy(function () {
            this._trigger('ready', {});
          }, this)
        });
      }
    }
  });
}(jQuery, window));
