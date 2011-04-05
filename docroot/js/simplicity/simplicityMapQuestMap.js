/**
 * @name $.ui.simplicityMapQuestMap
 * @namespace A MapQuest map
 * <p>
 * MapQuest Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityMapQuestMap();
 *   &lt;/script>
 *
 * @see MapQuest JavaScript SDK v6 <a href="http://platform.beta.mapquest.com/sdk/js/v6.0.0/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityMapQuestMap", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The simplicityDiscoverySearch widget that this widget binds it's events to. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>latitudeField</dt>
     *   <dd>
     *     Field to find the latitude of the result item in the <code>simplicityResultSet</code>
     *     item properties. Defaults to <code>'latitude'</code>.
     *   </dd>
     *   <dt>longitudeField</dt>
     *   <dd>
     *     Field to find the longitude of the result item in the <code>simplicityResultSet</code>
     *     item properties. Defaults to <code>'longitude'</code>.
     *   </dd>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>fitOnResultSet<dt>
     *   <dd>
     *     When true the map is panned and zoomed to best fit the search
     *     results that are added as part of the <code>simplicityResultSet</code>
     *     event handler. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>mapOptions</dt>
     *   <dd>
     *     Options used when creating the map. Defaults to <code>''</code> which is expanded at
     *     runtime to
     *     <pre>
     *     {
     *       center: {lat: 0, lng: 0},
     *       zoom: 1,
     *       mapType: 'map'
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'moveend,zoomend'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityMapQuestMap.options
     */
    options : {
      map: '',
      mapOptions: '',
      // The following options are for internal use only
      apiKey: '',
      mapVersion: '6.0.0'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-mapquest-map');
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
     * @name $.ui.simplicityMapQuestMap._initWhenAvailable
     * @function
     * @private
     */
    _initWhenAvailable: function () {
      var wasAvailable = 'undefined' !== typeof this._map;
      if (wasAvailable) {
        // Already available, do nothing
      } else if (this.options.map !== '') {
        this._map = this.options.map;
      } else if ('undefined' !== typeof MQA && 'undefined' !== typeof MQA.TileMap) {
        var defaultMapOptions = {
          center: {lat: 0, lng: 0},
          zoom: 1,
          mapType: 'map'
        };
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = defaultMapOptions;
        } else if ($.isFunction(this.options.mapOptions)) {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions.call(this));
        } else {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions);
        }
        this._map = new MQA.TileMap(this.element[0],
          this.options.zoom, this.options.center, this.options.mapType);
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
     * @name $.ui.simplicityMapQuestMap.map
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
     * @name $.ui.simplicityMapQuestMap.loadMap
     * @function
     * @private
     */
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof MQA || 'undefined' === typeof MQA.TileMap) {
          var src = 'http://mapquestapi.com/sdk/js/v' + this.options.mapVersion + '/mqa.toolkit.js';
          if ('undefined' === typeof $.simplicityLoadJs) {
            src = src + '?key=YOUR_API_KEY';
            alert('Dynamic loading of MapQuest maps is not supported. Enable this widget by adding the following script tag to your page:\n\n' +
              '<script src="http://mapquestapi.com/sdk/js/v6.0.0/mqa.toolkit.js?key=YOUR_KEY"></script>');
          } else {
            if (this.options.apiKey !== '') {
              src = src + '?key=' + this.options.apiKey;
            }
            $.simplicityLoadJs(src, $.proxy(function () {
              MQA.withModule('mapinit', $.proxy(function () {
                this.refreshMap();
              }, this));
            }, this));
          }
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-mapquest-map');
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
