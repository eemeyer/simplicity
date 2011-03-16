/**
 * @name $.ui.simplicityGoogleMapOriginal
 * @deprecated See simplicityGoogleMap and its friends
 * @namespace A Google map.
 * <p>
 * Google Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMapOriginal();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="http://code.google.com/apis/maps/documentation/javascript/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMapOriginal", {
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
     *       center: new google.maps.LatLng(0,0),
     *       zoom: 1,
     *       mapTypeId: google.maps.MapTypeId.ROADMAP
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'idle'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleMapOriginal.options
     */
    options: {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      map: '',
      fitOnResultSet: true,
      mapOptions: '',
      mapMoveEvents: 'idle',
      // The following options are for internal use only
      apiKey: '',
      mapVersion: '3',
      mapParams: 'sensor=false'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-google-map-original');
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
     * @name $.ui.simplicityGoogleMapOriginal._initWhenAvailable
     * @function
     * @private
     */
    _initWhenAvailable: function () {
      var wasAvailable = 'undefined' !== typeof this._map;
      if (wasAvailable) {
        // Already available, do nothing
      } else if (this.options.map !== '') {
        this._map = this.options.map;
      } else if ('undefined' !== typeof google && 'undefined' !== typeof google.maps) {
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
      var isAvailable = 'undefined' !== typeof this._map;
      if (!wasAvailable && isAvailable) {
        $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
          eventName = $.trim(eventName);
          if (eventName !== '') {
            var listener = google.maps.event.addListener(this._map, eventName, $.proxy(this._mapBoundsChangeHandler, this));
            this._boundsChangeListeners[eventName] = listener;
          }
        }, this));
      }
      return isAvailable;
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityGoogleMapOriginal.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Try to dynamically load the necessary JavaScript from the upstream vendor that will
     * allow the map to function.
     *
     * @name $.ui.simplicityGoogleMapOriginal.loadMap
     * @function
     * @private
     */
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof google || 'undefined' === typeof google.load) {
          // The Google JS loader is missing, get it
          var callbackName = 'simplicityGoogleMapOriginalGoogleLoaderCallback';
          window[callbackName] = $.proxy(this.loadMap, this);
          var src = 'http://www.google.com/jsapi?callback=' + callbackName;
          if (this.options.apiKey !== '') {
            src = src + '&key=' + this.options.apiKey;
          }
          $('head').append($('<script type="text/javascript" src="' + src + '"></script>'));
        } else {
          // The Google JS loader is available, use it to load the maps API
          google.load('maps', this.options.mapVersion, {
            other_params: this.options.mapParams,
            callback: $.proxy(this.refreshMap, this)
          });
        }
      }
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityGoogleMapOriginal.refreshMap
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
     * @name $.ui.simplicityGoogleMapOriginal._resultSetHandler
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
     * @name $.ui.simplicityGoogleMapOriginal.removeMarkers
     * @function
     * @private
     */
    removeMarkers: function () {
      if (this._initWhenAvailable()) {
        $.each(this._markers, function (idx, marker) {
          marker.setMap(null);
        });
        this._markers.length = 0;
      }
    },
    /**
     * Adds any markers that can be extracted from the given <code>resultSet</code>.
     *
     * @name $.ui.simplicityGoogleMapOriginal.addMarkers
     * @function
     * @private
     */
    addMarkers: function (resultSet) {
      if (this._initWhenAvailable()) {
        if (resultSet.rows.length > 0) {
          var bounds = this.options.fitOnResultSet ? new google.maps.LatLngBounds() : null;
          $.each(resultSet.rows, $.proxy(function (idx, row) {
            var properties = row.properties;
            if ('undefined' !== typeof properties) {
              var latitude = properties[this.options.latitudeField];
              var longitude = properties[this.options.longitudeField];
              if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
                var point = new google.maps.LatLng(latitude, longitude);
                var marker = new google.maps.Marker({
                  position: point
                });
                var markerEvent = {
                  row: row,
                  map: this._map,
                  marker: marker
                };
                this._trigger('marker', {}, markerEvent);
                marker = markerEvent.marker;
                if ('undefined' !== typeof marker) {
                  marker.setMap(this._map);
                  this._markers.push(marker);
                  if (bounds !== null) {
                    bounds.extend(point);
                  }
                }
              }
            }
          }, this));
          if (bounds !== null && !bounds.isEmpty()) {
            this._map.fitBounds(bounds);
          }
        }
      }
    },
    _mapBoundsChangeHandler: function () {
      var bounds = this.bounds();
      if (this.options.debug) {
        console.log('simplicityGoogleMapOriginal: Bounds changed', bounds);
      }
      this._trigger('bounds', {}, bounds);
    },
    /**
     * Returns the normalized bounds for this map.
     *
     * @name $.ui.simplicityGoogleMapOriginal.bounds
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
     * @name $.ui.simplicityGoogleMapOriginal.normalizeBounds
     * @function
     * @private
     */
    normalizeBounds: function (bounds, center) {
      var result = {
        map: this._map,
        bounds: {
          vendor: bounds,
          north: bounds.getNorthEast().lat(),
          east: bounds.getNorthEast().lng(),
          south: bounds.getSouthWest().lat(),
          west: bounds.getSouthWest().lng()
        },
        center: {
          vendor: center,
          latitude: center.lat(),
          longitude: center.lng()
        }
      };
      var radiusMeters1;
      var radiusMeters2;
      if ('undefined' !== typeof google.maps.geometry) {
        radiusMeters1 = google.maps.geometry.spherical.computeDistanceBetween(
            center, new google.maps.LatLng(center.lat(), bounds.getNorthEast().lng()));
        radiusMeters2 = google.maps.geometry.spherical.computeDistanceBetween(
            center, new google.maps.LatLng(bounds.getNorthEast().lat(), center.lng()));
      } else {
        radiusMeters1 = $.simplicityHaversineDistanceKm(
            center.lat(), center.lng(), center.lat(), bounds.getNorthEast().lng()) * 1000.0;
        radiusMeters2 = $.simplicityHaversineDistanceKm(
            center.lat(), center.lng(), bounds.getNorthEast().lat(), center.lng()) * 1000.0;
      }
      var minMeters = Math.min(radiusMeters1, radiusMeters2);
      var maxMeters = Math.max(radiusMeters1, radiusMeters2);
      $.extend(result, {
        minRadius: {
          meters: minMeters,
          feet: minMeters * 3.2808399,
          miles:  minMeters / 1609.344,
          km: minMeters / 1000
        },
        maxRadius: {
          meters: maxMeters,
          feet: maxMeters * 3.2808399,
          miles:  maxMeters / 1609.344,
          km: maxMeters / 1000
        }
      });
      return result;
    },
    /**
     * Removes the bounds from the map.
     *
     * @name $.ui.simplicityGoogleMapOriginal.hideBounds
     * @function
     * @private
     */
    hideBounds: function () {
      $.each(this._boundsShapes, function (idx, shape) {
        shape.setMap(null);
      });
      this._boundsShapes.length = 0;
    },
    /**
     * Adds an overlay for the bounds on the map.
     *
     * @param bounds Optional bounds to display, if missing the current bounds are used.
     * @name $.ui.simplicityGoogleMapOriginal.showBounds
     * @function
     * @private
     */
    showBounds: function (bounds) {
      if ('undefined' === typeof bounds) {
        bounds = this.bounds();
      }
      var shapes = {
        boundsRect: new google.maps.Rectangle({
          bounds: bounds.bounds.vendor,
          fillOpacity: 0
        }),
        minCircle: new google.maps.Circle({
          center: bounds.center.vendor,
          radius: bounds.minRadius.meters,
          fillOpacity: 0
        }),
        maxCircle: new google.maps.Circle({
          center: bounds.center.vendor,
          radius: bounds.maxRadius.meters,
          fillOpacity: 0
        }),
        centerLatitude: centerLat = new google.maps.Polyline({
          path: [
            new google.maps.LatLng(bounds.center.latitude, bounds.bounds.east),
            new google.maps.LatLng(bounds.center.latitude, bounds.bounds.west)
          ],
          strokeWeight: 1
        }),
        centerLongitude: new google.maps.Polyline({
          path: [
            new google.maps.LatLng(bounds.bounds.north, bounds.center.longitude),
            new google.maps.LatLng(bounds.bounds.south, bounds.center.longitude)
          ],
          strokeWeight: 1
        })
      };
      this._trigger('boundsshapes', {}, shapes);
      $.each(shapes, $.proxy(function (name, shape) {
        shape.setMap(this._map);
        this._boundsShapes.push(shape);
      }, this));
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-google-map-original');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $.each(this._boundsChangeListeners, $.proxy(function (eventName, listener) {
        google.maps.event.removeListener(listener);
      }, this));
      this._boundsChangeListeners = {};
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
