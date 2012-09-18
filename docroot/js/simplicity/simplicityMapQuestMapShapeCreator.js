/**
 * @name $.ui.simplicityMapQuestMapShapeCreator
 * @namespace A MapQuest map.
 * <p>
 * Adds the ability to show an point and radius or polygon/line to the map which
 * is persisted in a target input as geoJSON. This is the building block that
 * <code>simplicityMapShapeCreatorUi</code> exposes.
 * </p>
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityMapQuestMap();
 *     $('#map').simplicityMapQuestMapShapeCreator({
 *       input: $('&lt;input name="placemark"/>').simplicityInputs()
 *     });
 *   &lt;/script>
 *
 * @see MapQuest Maps http://developer.mapquest.com/web/documentation/sdk/javascript/v6.0.0/index.html
 */
(function ($) {
  $.widget("ui.simplicityMapQuestMapShapeCreator", $.ui.simplicityMapShapeCreator, {
    /**
     * Widget options.
     * <dl>
     *   <dt><code>polygonOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of polygons. Defaults to
     *     a map implementation specific value. Defaults to <code>{fillColorAlpha: 0.20, borderWidth: 0.0001}</code>.
     *   </dd>
     *   <dt><code>lineStringOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of line strings. Defaults to
     *     <code>{borderWidth: 1, color: '#888888'}</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityMapQuestMapShapeCreator.options
     */
    options: {
      lineStringOptions: '',
      polygonOptions: ''
    },
    _create: function () {
      $.ui.simplicityMapShapeCreator.prototype._create.apply(this, arguments);
      if (this.options.lineStringOptions === '') {
        this.options.lineStringOptions = {borderWidth: 1, color: '#888888'};
      }
      if (this.options.polygonOptions === '') {
        this.options.polygonOptions = {fillColorAlpha: 0.20, borderWidth: 0.0001};
      }
      this._shapeType = 'Point';
      this._currentMapShape = null;
      this._mapClickListener = null;
      this._map = $(this.element).simplicityMapQuestMap('map');
      this._mvcCoords = new MQA.LatLngCollection();
      this.creatingMapCursor = 'crosshair';
      this._mapClick = null;
      this._defaultMouseCursor = this._map._grab_mousecursor;
      this._mapShapes = new MQA.ShapeCollection();
      this._map.addShapeCollection(this._mapShapes);

      this._vertexMarkerImage = this._getMarkerImage(this.options.vertexMarkerOptions);
      this._firstVertexMarkerImage = this._getMarkerImage(this.options.firstVertexMarkerOptions);
      this._addClass('ui-simplicity-mapquest-shape-creator');
    },
    _getMarkerImage: function (markerOptions) {
      var s = markerOptions.size;
      return new MQA.Icon(
          markerOptions.icon,
          s[0], s[1]);
    },
    _setOption: function (key, value) {
      $.ui.simplicityMapShapeCreator.prototype._setOption.apply(this, arguments);
      switch (key) {
      case "firstVertexMarkerOptions":
        if (this.options.editMode && this._markers.length > 2) {
          this._firstVertexMarkerImage = this._getMarkerImage(this.options.firstVertexMarkerOptions);
          this._markers[0].marker.setIcon(this._firstVertexMarkerImage);
        }
        break;
      case "vertexMarkerOptions":
        this._vertexMarkerImage = this._getMarkerImage(this.options.vertexMarkerOptions);
        var minVertexIdx = this.options.editMode && this._markers.length > 2 ? 0 : -1;
        $.each(this._markers, $.proxy(function (idx, m) {
          if (idx > minVertexIdx) { // Skip the first vertex if it uses the firstVertex options
            m.marker.setIcon(this._vertexMarkerImage);
          }
        }, this));
        break;
      }
    },
    _draw: function () {
      if (this.options.editMode) {
        this._defaultSlideHandler = this._map.slideMapToPoint;
        this._defaultDoubleClickHandler = this._map.handleDblClickEvent;
        this._map.handleDblClickEvent = this._map.slideMapToPoint = function () {};
      } else {
        this._map.slideMapToPoint = this._defaultSlideHandler;
        this._map.handleDblClickEvent = this._defaultDoubleClickHandler;
      }
      this._setMapCursor();
    },
    _setMapCursor: function () {
      var mapCursor = this.options.editMode ? this.creatingMapCursor : this._defaultMouseCursor;
      this._map.parent.style.cursor = mapCursor;
      this._map._grab_mousecursor = mapCursor;
    },
    _addLineString: function () {
      this._currentMapShape = new MQA.LineOverlay();
      this._currentMapShape.setShapePoints(this._mvcCoords);
      this._currentMapShape.setValues($.extend({}, this.options.lineStringOptions));
      this._mapShapes.add(this._currentMapShape);
      this._shapeType = 'LineString';
      return this._currentMapShape;
    },
    _addPolygon: function () {
      this._currentMapShape = new MQA.PolygonOverlay();
      this._currentMapShape.setValues($.extend({}, this.options.polygonOptions));
      this._currentMapShape.setShapePoints(this._mvcCoords);
      this._mapShapes.add(this._currentMapShape);
      this._shapeType = 'Polygon';
      return this._currentMapShape;
    },
    _setPolylinePath: function (v) {
      if (this._polylineRadius) {
        this._polylineRadius.setShapePoints(v);
      }
    },
    _bufferShape: function () {
      if (this._geoJson.placemarks.type === 'LineString') {
        this._polylineRadius = new MQA.PolygonOverlay();
        this._polylineRadius.setShapePoints(this._getLineStringBufferPoints());
        this._polylineRadius.setValues($.extend({}, this.options.polygonOptions));
        this._mapShapes.add(this._polylineRadius);
      } else {
        $.each(this._markers, $.proxy(function (idx, m) {
          if (m.radiusCircle) {
            m.radiusCircle.setRadius(this.options.radius);
            this._mapShapes.removeItem(m.radiusCircle);
          } else if (this.options.radius) {
            m.radiusCircle = new MQA.CircleOverlay();
            m.radiusCircle.setRadiusUnit(this.options.distanceUnit);
            m.radiusCircle.setValues($.extend({}, this.options.polygonOptions, this.options.circleOptions));
            m.radiusCircle.setRadius(this.options.radius);
            m.radiusCircle.setShapePoints([m.marker.latLng.lat, m.marker.latLng.lng]);
            this._mapShapes.add(m.radiusCircle);
          }
          if (!this._mapShapes.contains(m.radiusCircle)) {
            this._mapShapes.add(m.radiusCircle);
          }
        }, this));
      }
    },
    _unbufferShape: function () {
      $.each(this._markers, $.proxy(function (idx, m) {
        if (m.radiusCircle) {
          this._mapShapes.removeItem(m.radiusCircle);
          m.radiusCircle = null;
        }
      }, this));
      if (this._polylineRadius) {
        this._removeFromMap(this._polylineRadius);
        this._polylineRadius = null;
      }
    },
    _removeFromMap: function (object) {
      if (object !== null) {
        this._mapShapes.removeItem(object);
      }
    },
    _removeShapeFromMap: function () {
      if (this._currentMapShape !== null) {
        this._removeFromMap(this._currentMapShape);
        this._currentMapShape = null;
      }
      this._shapeType = 'Point';
      if (this._polylineRadius) {
        this._removeFromMap(this._polylineRadius);
        this._polylineRadius = null;
      }
    },
    _getLatLngFromEvent: function (evt) {
      return evt.ll;
    },
    _makeLatLng: function (lat, lng) {
      return new MQA.LatLng(lat, lng);
    },
    _latLngAsArray: function (latLng) {
      return [latLng.lat, latLng.lng];
    },
    updateBounds: function () {
      var ui = {
        locations: []
      };
      this.boundsHandler()({}, ui);
      if ('undefined' !== typeof ui.locations && 0 !== ui.locations.length) {
        var bounds = undefined;
        $.each(ui.locations, function (idx, loc) {
          if (typeof bounds === 'undefined') {
            bounds = new MQA.RectLL(loc, loc);
          } else {
            bounds.extend(loc);
          }
        });
        if (typeof bounds !== 'undefined') {
          this._map.zoomToRect(bounds);
        }
      }
    },
    _getGeocodePrecisionData: function (point, ui) {
      var result = {
          point: point,
          addr: ui.item.value
        };
      var p = ["street", "postalCode", "geocodeQuality"];
      try {
        var v = ui.item.vendor;
        $.each(p, function (idx, f) {
          if ('undefined' !== typeof v[f] && v[f] !== '') {
            result[f] = v[f];
          }
        });
        var i = 1, tk, vk;
        for (i = 1; i < 6; i += 1) {
          vk = "adminArea" + i;
          tk = "adminArea" + i + "Type";
          if ('undefined' !== typeof v[tk] && v[vk]) {
            result[v[tk]] = v[vk];
          }
        }
      } catch (e) {
      }
      return result;
    },
    setMapCenterFromMarker: function (marker) {
      if (marker) {
        this._map.setCenter(marker.latLng);
      }
    },
    getMappingProviderId: function () {
      return "MapQuest";
    },
    // Map Listeners
    _addMapClickListener: function () {
      if (this._mapClick === null) {
        this._mapClick = $.proxy(this._mapClickHandler, this);
        MQA.EventManager.addListener(this._map, 'click', this._mapClick);
      }
    },
    _removeMapClickListener: function () {
      if (this._mapClick) {
        MQA.EventManager.removeListener(this._map, 'click', this._mapClick);
      }
      this._mapClick = null;
    },
    _addMarker: function (idx, latLng) {
      var marker = new MQA.Poi(latLng, this._vertexMarkerImage);
      marker.setValues($.extend({}, this.options.markerOptions));
      this._markers.push({"marker": marker});
      if (this.options.draggableMarkers) {
        marker.setValues({"draggable": true, zIndex: +150});
      }
      this._mapShapes.add(marker);
      return marker;
    },
    _setMarkerStyle: function (idx, style) {
      if (idx < this._markers.length) {
        var marker = this._markers[idx].marker;
        if (style === 'vertex') {
          marker.setValues({"icon": this._vertexMarkerImage, zIndex: +150});
        } else if (style === 'firstVertex') {
          marker.setValues({"icon": this._firstVertexMarkerImage, zIndex: +200});
        }
      }
    },
    _addMarkerClickListener: function (idx, handler) {
      if (idx < this._markers.length) {
        this.firstClickHandler = $.proxy(handler, this);
        MQA.EventManager.addListener(this._markers[idx].marker, 'click', this.firstClickHandler);
      }
    },
    _removeMarkerClickListener: function (idx) {
      if (idx < this._markers.length) {
        MQA.EventManager.removeListener(this._markers[idx].marker, 'click', this.firstClickHandler);
      }
    },
    _addMarkerMoveListener: function (idx, marker, handler) {
      if (idx < this._markers.length) {
        MQA.EventManager.addListener(marker, 'drag', $.proxy(handler, this));
      }
    },
    _removeMarkerMoveListeners: function () {
      $.each(this._markers, function (idx, marker) {
        MQA.EventManager.clearListeners(marker, 'drag');
      });
    },
    _addMarkerDragEndListener: function (idx, marker, handler) {
      if (idx < this._markers.length) {
        MQA.EventManager.addListener(marker, 'dragend', $.proxy(handler, this));
      }
    },
    _removeMarkerDragEndListeners: function () {
      $.each(this._markers, function (idx, marker) {
        MQA.EventManager.clearListeners(marker, 'dragend');
      });
    },
    _getDragPosition: function (marker, evt) {
      return evt.srcObject.latLng;
    },
    _getMarkerPosition: function (marker) {
      return marker.latLng;
    },
    _removeMarkers: function () {
      this._removeMarkerClickListener(0);
      $.each(this._markers, $.proxy(function (idx, o) {
        var marker = o.marker;
        if (o.radiusCircle) {
          this._mapShapes.removeItem(o.radiusCircle);
        }
        this._mapShapes.removeItem(marker);
      }, this));
      this._markers = [];
      this._createCoordsArray();
    },
    _createCoordsArray: function () {
      this._mvcCoords = new MQA.LatLngCollection();
      return this._mvcCoords;
    },
    _newCoordsArray: function (v) {
      var c = new MQA.LatLngCollection();
      $.each(v, function (idx, p) {
        c.add(new MQA.LatLng(p[0], p[1]));
      });
      return c;
    },
    _coordsLength: function () {
      return this._mvcCoords.getSize();
    },
    _coordsPush: function (latLng) {
      var idx = this._mvcCoords.getSize();
      this._mvcCoords.add(latLng);
      return idx;
    },
    _coordsGetAsDArray: function (idx) {
      var p = this._mvcCoords.getAt(idx);
      return [p.lat, p.lng];
    },
    _coordsSetAt: function (idx, latLng) {
      this._mvcCoords.items[idx] = latLng;
      this._coordsObserver(this._mvcCoords, idx);
    },
    _coordsObserver: function (latLngColl, idx) {
      if (this._currentMapShape !== null) {
        this._currentMapShape.setShapePoints(latLngColl);
      }
      if (idx < this._markers.length) {
        var latLng = latLngColl.getAt(idx);
        if (this._markers[idx].radiusCircle) {
          this._markers[idx].radiusCircle.setShapePoints([latLng.lat, latLng.lng]);
        }
      }
    },
    boundsHandler: function () {
      return $.proxy(function (evt, ui) {
        var bounds = ui.locations;
        if ('undefined' !== typeof bounds) {
          var p, np, rMeters;
          if ('undefined' !== typeof this._polylineRadius && this._polylineRadius !== null) {
            rMeters = this._radiusMeters;
            $.each(this._markers, $.proxy(function (idx, m) {
              p = [m.marker.latLng.lat, m.marker.latLng.lng];
              for (var i = 0; i < 360; i = i + 90) {
                np = $.simplicityGeoFn.travel(p, rMeters, i);
                bounds.push(new MQA.LatLng(np[0], np[1]));
              }
            }, this));
          } else {
            rMeters = this._markers.length > 0 && this._markers[0].radiusCircle ?
                this._radiusMeters : 0;
            $.each(this._markers, $.proxy(function (idx, m) {
              if (m.radiusCircle) {
                p = [m.marker.latLng.lat, m.marker.latLng.lng];
                for (var i = 0; i < 360; i = i + 90) {
                  np = $.simplicityGeoFn.travel(p, rMeters, i);
                  bounds.push(new MQA.LatLng(np[0], np[1]));
                }
              } else {
                bounds.push(m.marker.latLng);
              }
            }, this));
          }
        }
      }, this);
    }
  });
}(jQuery));
