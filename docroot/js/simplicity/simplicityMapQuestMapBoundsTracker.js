/**
 * @name $.ui.simplicityMapQuestMapBoundsTracker
 * @namespace A MapQuest map
 * <p>
 * An invisible jquery ui widget which tracks changes in a map's bounds. Whenever the map bound change, a
 * simplicitymapquestmapboundstrackerbounds event is triggered with ui.bounds being the normalized map bounds.
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
  $.widget("ui.simplicityMapQuestMapBoundsTracker", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'moveend,zoomend'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityMapQuestMapBoundsTracker.options
     */
    options : {
      map: '',
      mapMoveEvents: 'moveend,zoomend'
    },
    _create: function () {
      this._addClass('ui-simplicity-mapquest-map-bounds-tracker');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityMapQuestMap('map');
      this._boundsChangeListeners = {};
      $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
        eventName = $.trim(eventName);
        if (eventName !== '') {
          var listener = $.proxy(this._mapBoundsChangeHandler, this);
          MQA.EventManager.addListener(this._map, eventName, listener);
          this._boundsChangeListeners[eventName] = listener;
        }
      }, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityMapQuestMapBoundsTracker.map
     * @function
     */
    map: function () {
      return this._map;
    },
    _mapBoundsChangeHandler: function () {
      var bounds = this.bounds();
      if (this.options.debug) {
        console.log('simplicityMapQuestMap: Bounds changed', bounds);
      }
      this._trigger('bounds', {}, bounds);
    },
    /**
     * Returns the normalized bounds for this map.
     *
     * @name $.ui.simplicityMapQuestMapBoundsTracker.bounds
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
     * @name $.ui.simplicityMapQuestMapBoundsTracker.normalizeBounds
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
     * @name $.ui.simplicityMapQuestMapBoundsTracker.hideBounds
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
     * @name $.ui.simplicityMapQuestMapBoundsTracker.showBounds
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
      $.each(this._boundsChangeListeners, $.proxy(function (eventName, listener) {
        MQA.EventManager.removeListener(this._map, eventName, listener);
      }, this));
      delete this._boundsChangeListeners;
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
