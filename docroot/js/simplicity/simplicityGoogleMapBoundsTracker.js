/**
 * @name $.ui.simplicityGoogleMapBoundsTracker
 * @namespace A Google map.
 * <p>
 * An invisible jquery ui widget which tracks changes in a Google Map's bounds. Whenever the map bound change, a
 * simplicitygooglemapboundstrackerbounds event is triggered with ui.bounds being the normalized map bounds.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMapBoundsTracker();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="https://developers.google.com/maps/documentation/javascript/reference">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMapBoundsTracker", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be looked up. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'dragstart,idle,dragend'</code> when <code>idleWhileDragging</code> is
     *     enabled, otherwise <code>'idle'</code>.
     *   </dd>
     *   <dt>idleWhileDragging</dt>
     *   <dd>
     *     Provided that option <code>mapMoveEvents</code> targets event <code>'idle'</code>, then this option
     *     will enable the <code>idle</code> event to trigger a bounds change even while dragging the map.
     *     Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleMapBoundsTracker.options
     */
    options: {
      map: '',
      mapMoveEvents: '',
      idleWhileDragging: false
    },
    _create: function () {
      this._addClass('ui-simplicity-google-map-bounds-tracker');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityGoogleMap('map');
      this._boundsShapes = [];
      this._boundsChangeListeners = {};
      this._dragging = false;
      if (this.options.mapMoveEvents === '') {
        this.options.mapMoveEvents = this.options.idleWhileDragging ? 'idle' : 'dragstart,idle,dragend';
      }
      $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
        eventName = $.trim(eventName);
        if (eventName !== '') {
          var listener = google.maps.event.addListener(this._map, eventName, $.proxy(this._mapBoundsChangeHandler(eventName), this));
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
    _mapBoundsChangeHandler: function (eventName) {
      return function () {
        if (!this.options.idleWhileDragging) {
          if (eventName === 'dragstart') {
            this._dragging = true;
            return;
          } else if (eventName === 'dragend') {
            this._dragging = false;
          } else if (this._dragging) {
            return;
          }
        }
        var bounds = this.bounds();
        if (!bounds.bounds.vendor.equals(this._lastBounds)) {
          this._lastBounds = bounds.bounds.vendor;
          if (this.options.debug) {
            console.log('simplicityGoogleMapBoundsTracker: Bounds changed', bounds);
          }
          this._trigger('bounds', {}, bounds);
        }
      };
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
        radiusMeters1 = $.simplicityGeoFn.distanceKm(
            center.lat(), center.lng(), center.lat(), bounds.getNorthEast().lng()) * 1000.0;
        radiusMeters2 = $.simplicityGeoFn.distanceKm(
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
      $.each(this._boundsChangeListeners, $.proxy(function (eventName, listener) {
        google.maps.event.removeListener(listener);
      }, this));
      this._boundsChangeListeners = {};
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
