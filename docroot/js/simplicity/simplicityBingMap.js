/**
 * @name $.ui.simplicityBingMap
 * @namespace A Bing map.
 * <p>
 * Bing Map widget that creates the map and listens for <code>simplicityResultSet</code> events
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
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'viewchangeend'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityBingMap.options
     */
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      map: '',
      fitOnResultSet: true,
      credentials: '',
      mapOptions: '',
      mapMoveEvents: 'viewchangeend',
      eventThrottleInterval: '',
      // The following options are for internal use only
      mapVersion: '7.0'
    },
    _create : function () {
      this.element.addClass('ui-simplicity-bing-map');
      this._markers = [];
      this._boundsShapes = [];
      this._boundsChangeListeners = {};
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
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
      if (!wasAvailable && isAvailable) {
        $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
          eventName = $.trim(eventName);
          if (eventName !== '') {
            var listener;
            if (this.options.eventThrottleInterval === '') {
              listener = Microsoft.Maps.Events.addHandler(this._map, eventName, $.proxy(this._mapBoundsChangeHandler, this));
            } else {
              listener = Microsoft.Maps.Events.addThrottledHandler(this._map, eventName, $.proxy(this._mapBoundsChangeHandler, this), this.options.eventThrottleInterval);
            }
            this._boundsChangeListeners[eventName] = listener;
          }
        }, this));
      }
      return isAvailable;
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityBingMap.map
     * @function
     */
    map: function () {
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
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityBingMap.refreshMap
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
     * @name $.ui.simplicityBingMap._resultSetHandler
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
     * @name $.ui.simplicityBingMap.removeMarkers
     * @function
     */
    removeMarkers: function () {
      $.each(this._markers, $.proxy(function (idx, marker) {
        this._map.entities.remove(marker);
      }, this));
      this._markers.length = 0;
    },
    /**
     * Adds any markers that can be extracted from the given <code>resultSet</code>.
     *
     * @name $.ui.simplicityBingMap.addMarkers
     * @function
     */
    addMarkers: function (resultSet) {
      if (this._initWhenAvailable()) {
        if (resultSet.rows.length > 0) {
          var locations = this.options.fitOnResultSet ? [] : null;
          $.each(resultSet.rows, $.proxy(function (idx, row) {
            var properties = row.properties;
            if ('undefined' !== typeof properties) {
              var latitude = properties[this.options.latitudeField];
              var longitude = properties[this.options.longitudeField];
              if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
                var point = new Microsoft.Maps.Location(latitude, longitude);
                var pin = new Microsoft.Maps.Pushpin(point);
                var markerEvent = {
                    row: row,
                    map: this._map,
                    marker: pin
                  };
                this._trigger('marker', {}, markerEvent);
                marker = markerEvent.marker;
                if ('undefined' !== typeof marker) {
                  if (locations !== null) {
                    locations.push(point);
                  }
                  this._markers.push(pin);
                  this._map.entities.push(pin);
                }
              }
            }
          }, this));
          if (locations !== null && locations.length > 0) {
            var bounds = Microsoft.Maps.LocationRect.fromLocations(locations);
            this._map.setView({bounds: bounds});
          }
        }
      }
    },
    _mapBoundsChangeHandler: function () {
      var bounds = this.bounds();
      if (this.options.debug) {
        console.log('simplicityBingMap: Bounds changed', bounds);
      }
      this._trigger('bounds', {}, bounds);
    },
    /**
     * Returns the normalized bounds for this map.
     *
     * @name $.ui.simplicityBingMap.bounds
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
     * @name $.ui.simplicityBingMap.normalizeBounds
     * @function
     * @private
     */
    normalizeBounds: function (bounds, center) {
      var result = {
        map: this._map,
        bounds: {
          vendor: bounds,
          north: bounds.getNorth(),
          east: bounds.getEast(),
          south: bounds.getSouth(),
          west: bounds.getWest()
        },
        center: {
          vendor: center,
          latitude: center.latitude,
          longitude: center.longitude
        }
      };
      var radiusMiles1 = $.simplicityHaversineDistanceMiles(
        center.latitude, center.longitude, center.latitude, bounds.getEast());
      var radiusMiles2 = $.simplicityHaversineDistanceMiles(
        center.latitude, center.longitude, bounds.getNorth(), center.longitude);
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
     * @name $.ui.simplicityBingMap.hideBounds
     * @function
     * @private
     */
    hideBounds: function () {
      $.each(this._boundsShapes, $.proxy(function (idx, shape) {
        this._map.entities.remove(shape);
      }, this));
      this._boundsShapes.length = 0;
    },
    /**
     * Adds an overlay for the bounds on the map.
     *
     * @param bounds Optional bounds to display, if missing the current bounds are used.
     * @name $.ui.simplicityBingMap.showBounds
     * @function
     * @private
     */
    showBounds: function (bounds) {
      if ('undefined' === typeof bounds) {
        bounds = this.bounds();
      }
      var boundsRect = new Microsoft.Maps.Polygon([
          new Microsoft.Maps.Location(bounds.bounds.north, bounds.bounds.west),
          new Microsoft.Maps.Location(bounds.bounds.north, bounds.bounds.east),
          new Microsoft.Maps.Location(bounds.bounds.south, bounds.bounds.east),
          new Microsoft.Maps.Location(bounds.bounds.south, bounds.bounds.west),
          new Microsoft.Maps.Location(bounds.bounds.north, bounds.bounds.west)
        ], {
          strokeColor: new Microsoft.Maps.Color(255, 0, 0, 0),
          fillColor: new Microsoft.Maps.Color(0)
        });
      var centerLatitude = new Microsoft.Maps.Polyline([
          new Microsoft.Maps.Location(bounds.center.latitude, bounds.bounds.east),
          new Microsoft.Maps.Location(bounds.center.latitude, bounds.bounds.west)
        ], {
          strokeColor: new Microsoft.Maps.Color(255, 0, 0, 0),
          strokeThickness: 1,
          fillColor: new Microsoft.Maps.Color(0)
        });
      var centerLongitude = new Microsoft.Maps.Polyline([
          new Microsoft.Maps.Location(bounds.bounds.north, bounds.center.longitude),
          new Microsoft.Maps.Location(bounds.bounds.south, bounds.center.longitude)
        ], {
          strokeColor: new Microsoft.Maps.Color(255, 0, 0, 0),
          strokeThickness: 1,
          fillColor: new Microsoft.Maps.Color(0)
        });
      var shapes = {
        boundsRect: boundsRect,
        // minCircle and maxCircle fields are missing due to lack of support for circle entities.
        centerLatutide: centerLatitude,
        centerLongitude: centerLongitude
      };
      this._trigger('boundsshapes', {}, shapes);
      $.each(shapes, $.proxy(function (name, shape) {
        this._map.entities.push(shape);
        this._boundsShapes.push(shape);
      }, this));
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-bing-map');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $.each(this._boundsChangeListeners, $.proxy(function (eventName, listener) {
        Microsoft.Maps.Events.removeHandler(listener);
      }, this));
      this._boundsChangeListeners = {};
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
