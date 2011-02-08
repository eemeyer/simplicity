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
     * </dl>
     * @name $.ui.simplicityMapQuestMap.options
     */
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      mapOptions: '',
      // The following options are for internal use only
      apiKey: '',
      mapVersion: '6.0.0'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-mapquest-map');
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
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
      var available = false;
      if ('undefined' !== typeof this._map) {
        available = true;
      } else if ('undefined' !== typeof MQA && 'undefined' !== typeof MQA.TileMap) {
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = {
            center: {lat: 0, lng: 0},
            zoom: 1,
            mapType: 'map'
          };
        } else if ($.isFunction(this.options.mapOptions)) {
          mapOptions = this.options.mapOptions.call(this);
        } else {
          mapOptions = this.options.mapOptions;
        }
        var mapInit = new MQA.MapInit();
        this._map = new MQA.TileMap(this.element[0],
          this.options.zoom, this.options.center, this.options.mapType, mapInit);
        available = true;
      }
      return available;
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityMapQuestMap.map
     * @function
     */
    map: function () {
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
              MQA.withModule('mapinit', $.proxy(function() {
                this.refreshMap();
              }, this));
            }, this));
          }
        }
      }
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityMapQuestMap.refreshMap
     * @function
     */
    refreshMap: function () {
      this._resultSetHandler({}, $(this.options.searchElement).simplicityDiscoverySearch('resultSet'));
    },
    /**
     * Event handler for the <code>simplicityResultSet</code> event. Extracts the coordinates
     * of each result item by using the property fields defined by the
     * <code>latitudeField</code> and <code>longitudeField</code> options of this widget and
     * places a marker on the map for each valid coordinate. The map is then reset to best
     * display the current set of markers.
     *
     * @name $.ui.simplicityMapQuestMap._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, resultSet) {
      if (this._initWhenAvailable()) {
        this._map.removeAllShapes();
        if (resultSet.rows.length > 0) {
          var pois = new MQA.ShapeCollection();
          $.each(resultSet.rows, $.proxy(function (idx, row) {
            var properties = row.properties;
            if ('undefined' !== typeof properties) {
              var latitude = properties[this.options.latitudeField];
              var longitude = properties[this.options.longitudeField];
              if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
                latitude = Number(latitude);
                longitude = Number(longitude);
                var poi = new MQA.Poi({lat: latitude, lng: longitude});
                pois.add(poi);
              }
            }
          }, this));
          this._map.addShapeCollection(pois);
          this._map.bestFit();
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-mapquest-map');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
