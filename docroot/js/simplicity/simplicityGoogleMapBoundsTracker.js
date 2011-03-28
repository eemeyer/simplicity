/**
 * @name $.ui.simplicityGoogleMapBoundsTracker
 * @namespace A Google map.
 * <p>
 * Google Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMapBoundsTracker();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="http://code.google.com/apis/maps/documentation/javascript/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMapBoundsTracker", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be looked up. Defaults to <code>''</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleMapBoundsTracker.options
     */
    options: {
      map: '',
      mapMoveEvents: 'idle'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-google-map-bounds-tracker');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityGoogleMap('map');
      this._boundsShapes = [];
      this._boundsChangeListeners = {};
      $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
        eventName = $.trim(eventName);
        if (eventName !== '') {
          var listener = google.maps.event.addListener(this._map, eventName, $.proxy(this._mapBoundsChangeHandler, this));
          this._boundsChangeListeners[eventName] = listener;
        }
      }, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityGoogleMapBoundsTracker.map
     * @function
     */
    map: function () {
      return this._map;
    },
    _mapBoundsChangeHandler: function () {
      var bounds = this.bounds();
      if (this.options.debug) {
        console.log('simplicityGoogleMapBoundsTracker: Bounds changed', bounds);
      }
      this._trigger('bounds', {}, bounds);
    },
    /**
     * Returns the normalized bounds for this map.
     *
     * @name $.ui.simplicityGoogleMapBoundsTracker.bounds
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
     * @name $.ui.simplicityGoogleMapBoundsTracker.normalizeBounds
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
     * @name $.ui.simplicityGoogleMapBoundsTracker.hideBounds
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
     * @name $.ui.simplicityGoogleMapBoundsTracker.showBounds
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
      this.element.removeClass('ui-simplicity-google-map-bounds-tracker');
      $.each(this._boundsChangeListeners, $.proxy(function (eventName, listener) {
        google.maps.event.removeListener(listener);
      }, this));
      this._boundsChangeListeners = {};
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
