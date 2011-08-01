/**
 * @name $.ui.simplicityYahooMap
 * @namespace A Yahoo! map.
 * <p>
 * Yahho! Map widget that creates the map and listens for <code>simplicitySearchResponse</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityYahooMap();
 *   &lt;/script>
 *
 * @see Yahoo! Maps Web Services - AJAX API <a href="http://developer.yahoo.com/maps/ajax/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityYahooMap", {
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
     *       center: new YGeoPoint(0, 0),
     *       zoom: 16,
     *       mapTypeId: YAHOO_MAP_REG
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityYahooMap.options
     */
    options : {
      map: '',
      mapOptions: '',
      // The following options are for internal use only
      apiKey: '',
      mapVersion: '3.8'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-yahoo-map');
      if (this.options.map !== '') {
        this._map = this.options.map;
      } else {
        this._initWhenAvailable();
      }
    },
    /**
     * Lazy initialization method used to create the map only when the necessary JavaScript
     * is available. Intended to be called from any of this widgets public methods that need to
     * access the this._map.
     *
     * @name $.ui.simplicityYahooMap._initWhenAvailable
     * @function
     * @private
     */
    _initWhenAvailable: function () {
      var wasAvailable = 'undefined' !== typeof this._map;
      if (wasAvailable) {
        // Already available, do nothing
      } else if (this.options.map !== '') {
        this._map = this.options.map;
      } else if ('undefined' !== typeof YMap) {
        var defaultMapOptions = {
          center: new YGeoPoint(0, 0),
          zoom: 16,
          mapType: YAHOO_MAP_REG
        };
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = defaultMapOptions;
        } else if ($.isFunction(this.options.mapOptions)) {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions.call(this));
        } else {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions);
        }
        this._map = new YMap(this.element[0]);
        this._map.setMapType(mapOptions.mapType);
        this._map.drawZoomAndCenter(mapOptions.center, mapOptions.zoom);
        this._trigger('create', {}, {
          map: this._map
        });
      }
      var isAvailable = 'undefined' !== typeof this._map;
      return isAvailable;
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityYahooMap.map
     * @function
     */
    map: function () {
      this._initWhenAvailable();
      return this._map;
    },
    /**
     * Try to dynamically load the necessary JavaScript from the upstream vendor that will
     * allow the map to function.
     *
     * @name $.ui.simplicityYahooMap.loadMap
     * @function
     * @private
     */
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof YMap) {
          var src = 'http://api.maps.yahoo.com/ajaxymap?v=' + this.options.mapVersion;
          if ('undefined' === typeof $.simplicityLoadJs) {
            src = src + '&appid=YOUR_APP_ID';
            alert('Dynamic loading of Yahoo! maps is not supported. Enable this widget by adding the following script tag to your page:\n\n' +
              '<script type="text/javascript" src="' + src + '"></script>');
          } else {
            if (this.options.apiKey !== '') {
              src = src + '&appid=' + this.options.apiKey;
            }
            $.simplicityLoadJs(src, $.proxy(function () {
              this.refreshMap();
            }, this));
          }
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-yahoo-map');
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
