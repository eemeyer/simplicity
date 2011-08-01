/**
 * @name $.ui.simplicityBingMap
 * @namespace A Bing map.
 * <p>
 * Bing Map widget that creates the map and listens for <code>simplicitySearchResponse</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="position: absolute; width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityBingMap({
 *       credentials: 'Your credentials go here'
 *     });
 *   &lt;/script>
 *
 * @see Bing Maps AJAX Control v7 <a href="http://msdn.microsoft.com/en-us/library/gg427610.aspx">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityBingMap", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>credentials</dt>
     *   <dd>
     *     Mandatory option that contains your Bing credentials.
     *   </dd>
     *   <dt>mapOptions</dt>
     *   <dd>
     *     Options used when creating the map. Defaults to <code>''</code> which is expanded at
     *     runtime to
     *     <pre>
     *     {
     *       center: new Microsoft.Maps.Location(0, 0),
     *       zoom: 1,
     *       mapTypeId: Microsoft.Maps.MapTypeId.road
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityBingMap.options
     */
    options : {
      credentials: '',
      map: '',
      mapOptions: '',
      // The following options are for internal use only
      mapVersion: '7.0'
    },
    _create : function () {
      this.element.addClass('ui-simplicity-bing-map');
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
     * @name $.ui.simplicityBingMap._initWhenAvailable
     * @function
     * @private
     */
    _initWhenAvailable: function () {
      var wasAvailable = 'undefined' !== typeof this._map;
      if (wasAvailable) {
        // Already available, do nothing
      } else if (this.options.map !== '') {
        this._map = this.options.map;
      } else if ('undefined' !== typeof Microsoft && 'undefined' !== typeof Microsoft.Maps && 'undefined' !== typeof Microsoft.Maps.Map) {
        var defaultMapOptions = {
          credentials: this.options.credentials,
          center: new Microsoft.Maps.Location(0, 0),
          zoom: 1,
          mapTypeId: Microsoft.Maps.MapTypeId.road
        };
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = defaultMapOptions;
        } else if ($.isFunction(this.options.mapOptions)) {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions.call(this));
        } else {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions);
        }
        this._map = new Microsoft.Maps.Map(this.element[0], mapOptions);
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
     * @name $.ui.simplicityBingMap.map
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
     * @name $.ui.simplicityBingMap.loadMap
     * @function
     * @private
     */
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof Microsoft || 'undefined' === typeof Microsoft.Maps || 'undefined' === typeof Microsoft.Maps.Map) {
          var src = 'http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=' + this.options.mapVersion;
          if ('undefined' === typeof $.simplicityLoadJs) {
            alert('Dynamic loading of Bing maps is not supported. Enable this widget by adding the following script tag to your page:\n\n' +
              '<script charset="UTF-8" type="text/javascript" src="' + src + '"></script>');
          } else {
            $.simplicityLoadJs(src, $.proxy(function () {
              this.refreshMap();
            }, this));
          }
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-bing-map');
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
