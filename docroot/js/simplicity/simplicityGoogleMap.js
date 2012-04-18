/**
 * @name $.ui.simplicityGoogleMap
 * @namespace A Google map.
 * <p>
 * Google Map widget. Wraps a Google map as a jquery ui widget. Will optionally create a google map, or a map can be
 * passed in using the widget options.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMap();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="https://developers.google.com/maps/documentation/javascript/reference">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMap", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>mapOptions</dt>
     *   <dd>
     *     Options used when creating the map. Defaults to <code>''</code> which is expanded at
     *     runtime to
     *     <pre>
     *     {
     *       center: new google.maps.LatLng(0,0),
     *       zoom: 1,
     *       mapTypeId: google.maps.MapTypeId.ROADMAP
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleMap.options
     */
    options: {
      map: '',
      mapOptions: ''
    },
    _create: function () {
      this._addClass('ui-simplicity-google-map');
      if (this.options.map !== '') {
        this._map = this.options.map;
      } else {
        var defaultMapOptions = {
          center: new google.maps.LatLng(0, 0),
          zoom: 1,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = defaultMapOptions;
        } else if ($.isFunction(this.options.mapOptions)) {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions.call(this));
        } else {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions);
        }
        this._map = new google.maps.Map(this.element[0], mapOptions);
        this._trigger('create', {}, {
          map: this._map
        });
      }
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityGoogleMap.map
     * @function
     */
    map: function () {
      return this._map;
    },
    destroy: function () {
      delete this._map;
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
