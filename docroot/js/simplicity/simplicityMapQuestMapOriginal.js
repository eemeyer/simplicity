/**
 * @name $.ui.simplicityMapQuestMapOriginal
 * @deprecated see simplicityMapQuestMap and its friends
 * @see $.ui.simplicityMapQuestMap
 * @namespace A MapQuest map
 * <p>
 * MapQuest Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityMapQuestMapOriginal();
 *   &lt;/script>
 *
 * @see MapQuest JavaScript SDK v6 <a href="http://platform.beta.mapquest.com/sdk/js/v6.0.0/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityMapQuestMapOriginal", {
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
     * @name $.ui.simplicityMapQuestMapOriginal.options
     */
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      map: '',
      fitOnResultSet: true,
      mapOptions: '',
      mapMoveEvents: 'moveend,zoomend',
      // The following options are for internal use only
      apiKey: '',
      mapVersion: '6.0.0'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-mapquest-map-original');
      this._boundsChangeListeners = {};
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
    },
    /**
     * Lazy initialization method used to create the map only when the necessary JavaScript
     * is available. Intended to be called from any of this widgets public methods that need to
     * access the this._map.
     *
     * @name $.ui.simplicityMapQuestMapOriginal._initWhenAvailable
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
        var mapInit = new MQA.MapInit();
        this._map = new MQA.TileMap(this.element[0],
          this.options.zoom, this.options.center, this.options.mapType, mapInit);
        this._trigger('create', {}, {
          map: this._map
        });
      }
      var isAvailable = 'undefined' !== typeof this._map;
      if (!wasAvailable && isAvailable) {
        $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
          eventName = $.trim(eventName);
          if (eventName !== '') {
            var listener = $.proxy(this._mapBoundsChangeHandler, this);
            MQA.EventManager.addListener(this._map, eventName, listener);
            this._boundsChangeListeners[eventName] = listener;
          }
        }, this));
      }
      return isAvailable;
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityMapQuestMapOriginal.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Try to dynamically load the necessary JavaScript from the upstream vendor that will
     * allow the map to function.
     *
     * @name $.ui.simplicityMapQuestMapOriginal.loadMap
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
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityMapQuestMapOriginal.refreshMap
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
     * @name $.ui.simplicityMapQuestMapOriginal._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, resultSet) {
      if (this._initWhenAvailable()) {
        this.removeMarkers();
        this.addMarkers(resultSet);
      }
    },
    /**
     * Removes any markers that were added to the map by <code>addMarkers</code>.
     *
     * @name $.ui.simplicityMapQuestMapOriginal.removeMarkers
     * @function
     * @private
     */
    removeMarkers: function () {
      if (this._initWhenAvailable()) {
        this._map.removeShapeCollection('simplicity-markers');
      }
    },
    /**
     * Adds any markers that can be extracted from the given <code>resultSet</code>.
     *
     * @name $.ui.simplicityMapQuestMapOriginal.addMarkers
     * @function
     * @private
     */
    addMarkers: function (resultSet) {
      if (this._initWhenAvailable()) {
        if (resultSet.rows.length > 0) {
          var pois = this._map.getShapeCollection('simplicity-markers');
          if ('undefined' === typeof shapeCollection) {
            pois = new MQA.ShapeCollection();
            pois.setName('simplicity-markers');
            this._map.addShapeCollection(pois);
          }
          $.each(resultSet.rows, $.proxy(function (idx, row) {
            var properties = row.properties;
            if ('undefined' !== typeof properties) {
              var latitude = properties[this.options.latitudeField];
              var longitude = properties[this.options.longitudeField];
              if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
                latitude = Number(latitude);
                longitude = Number(longitude);
                var marker = new MQA.Poi({lat: latitude, lng: longitude});
                var markerEvent = {
                  row: row,
                  map: this._map,
                  marker: marker
                };
                this._trigger('marker', {}, markerEvent);
                marker = markerEvent.marker;
                if ('undefined' !== typeof marker) {
                  pois.add(marker);
                }
              }
            }
          }, this));
          if (pois.getSize() !== 0 && this.options.fitOnResultSet) {
            this._map.bestFit();
          }
        }
      }
    },
    _mapBoundsChangeHandler: function () {
      var bounds = this.bounds();
      if (this.options.debug) {
        console.log('simplicityMapQuestMapOriginal: Bounds changed', bounds);
      }
      this._trigger('bounds', {}, bounds);
    },
    /**
     * Returns the normalized bounds for this map.
     *
     * @name $.ui.simplicityMapQuestMapOriginal.bounds
     * @function
     */
    bounds: function () {
      return this.normalizeBounds(this._map.getBounds(), this._map.getCenter());
    },
    /**
     * Normalizes the bounds for this map.
     *
     * @param bounds in vendor supplied format
     * @param center point in vendor supplied format
     * @name $.ui.simplicityMapQuestMapOriginal.normalizeBounds
     * @function
     * @private
     */
    normalizeBounds: function (bounds, center) {
      var result = {
        map: this._map,
        bounds: {
          vendor: bounds,
          north: bounds.ul.lat,
          east: bounds.lr.lng,
          south: bounds.lr.lat,
          west: bounds.ul.lng
        },
        center: {
          vendor: center,
          latitude: center.lat,
          longitude: center.lng
        }
      };
      var radiusMiles1;
      var radiusMiles2;
      if ('undefined' !== MQA.Util) {
        radiusMiles1 = MQA.Util.distanceBetween(
          center, {lat: center.lat, lng: bounds.ul.lng});
        radiusMiles2 = MQA.Util.distanceBetween(
          center, {lat: bounds.ul.lat, lng: center.lng});
      } else {
        radiusMiles1 = $.simplicityHaversineDistanceMiles(
          center.lat, center.lng, center.lat, bounds.ul.lng);
        radiusMiles2 = $.simplicityHaversineDistanceMiles(
          center.lat, center.lng, bounds.ul.lat, center.lng);
      }
      var minMiles = Math.min(radiusMiles1, radiusMiles2);
      var maxMiles = Math.max(radiusMiles1, radiusMiles2);
      $.extend(result, {
        minRadius: {
          meters: minMiles * 1609.344,
          feet: minMiles * 5280,
          miles:  minMiles,
          km: minMiles * 1.609344
        },
        maxRadius: {
          meters: maxMiles * 1609.344,
          feet: maxMiles * 5280,
          miles:  maxMiles,
          km: maxMiles * 1.609344
        }
      });
      return result;
    },
    /**
     * Removes the bounds from the map.
     *
     * @name $.ui.simplicityMapQuestMapOriginal.hideBounds
     * @function
     * @private
     */
    hideBounds: function () {
      this._map.removeShapeCollection('simplicity-bounds');
    },
    /**
     * Adds an overlay for the bounds on the map.
     *
     * @param bounds Optional bounds to display, if missing the current bounds are used.
     * @name $.ui.simplicityMapQuestMapOriginal.showBounds
     * @function
     * @private
     */
    showBounds: function (bounds) {
      if ('undefined' === typeof bounds) {
        bounds = this.bounds();
      }
      var boundsRect = new MQA.RectangleOverlay();
      boundsRect.setShapePoints([
        bounds.bounds.vendor.ul.lat, bounds.bounds.vendor.ul.lng,
        bounds.bounds.vendor.lr.lat, bounds.bounds.vendor.lr.lng
      ]);
      boundsRect.fillColorAlpha = 0;
      var minCircle = new MQA.CircleOverlay();
      minCircle.setShapePoints([bounds.center.vendor.lat, bounds.center.vendor.lng]);
      minCircle.radius = bounds.minRadius.miles;
      minCircle.fillColorAlpha = 0;
      var maxCircle = new MQA.CircleOverlay();
      maxCircle.setShapePoints([bounds.center.vendor.lat, bounds.center.vendor.lng]);
      maxCircle.radius = bounds.maxRadius.miles;
      maxCircle.fillColorAlpha = 0;
      var centerLatitude = new MQA.LineOverlay();
      centerLatitude.setShapePoints([
        bounds.center.latitude, bounds.bounds.east,
        bounds.center.latitude, bounds.bounds.west
      ]);
      centerLatitude.borderWidth = 1;
      var centerLongitude = new MQA.LineOverlay();
      centerLongitude.setShapePoints([
        bounds.bounds.north, bounds.center.longitude,
        bounds.bounds.south, bounds.center.longitude
      ]);
      centerLongitude.borderWidth = 1;
      var shapes = {
        boundsRect: boundsRect,
        minCircle: minCircle,
        maxCircle: maxCircle,
        centerLatitude: centerLatitude,
        centerLongitude: centerLongitude
      };
      this._trigger('boundsshapes', {}, shapes);
      var shapeCollection = this._map.getShapeCollection('simplicity-bounds');
      if ('undefined' === typeof shapeCollection) {
        shapeCollection = new MQA.ShapeCollection();
        shapeCollection.setName('simplicity-bounds');
        this._map.addShapeCollection(shapeCollection);
      }
      $.each(shapes, $.proxy(function (name, shape) {
        shapeCollection.add(shape);
      }, this));
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-mapquest-map-original');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $.each(this._boundsChangeListeners, $.proxy(function (eventName, listener) {
        MQA.EventManager.removeListener(this._map, eventName, listener);
      }, this));
      this._boundsChangeListeners = {};
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
