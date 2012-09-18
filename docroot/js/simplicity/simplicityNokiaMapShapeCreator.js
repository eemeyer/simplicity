/**
 * @name $.ui.simplicityNokiaMapShapeCreator
 * @namespace A Nokia map.
 * <p>
 * Adds the ability to show an point and radius or polygon/line to the map which
 * is persisted in a target input as geoJSON. This is the building block that
 * <code>simplicityMapShapeCreatorUi</code> exposes.
 * </p>
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityNokiaMap();
 *     $('#map').simplicityNokiaMapShapeCreator({
 *       input: $('&lt;input name="placemark"/>').simplicityInputs()
 *     });
 *   &lt;/script>
 *
 * @see Nokia Maps JavaScript API V2 <a href="http://api.maps.nokia.com/en/index.html">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityNokiaMapShapeCreator", $.ui.simplicityMapShapeCreator, {
    /**
     * Widget options.
     * <dl>
     *   <dt><code>polygonOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of polygons. Defaults to
     *     a map implementation specific value. Defaults to <code>{brush: {color: '#0066cc43'}, width: 0}</code>.
     *   </dd>
     *   <dt><code>lineStringOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of line strings. Defaults to
     *     <code>{width: 1}</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityNokiaMapShapeCreator.options
     */
    options: {
      lineStringOptions: '',
      polygonOptions: ''
    },
    _create: function () {
      $.ui.simplicityMapShapeCreator.prototype._create.apply(this, arguments);
      if (this.options.lineStringOptions === '') {
        this.options.lineStringOptions = {width: 1};
      }
      if (this.options.polygonOptions === '') {
        this.options.polygonOptions = {brush: {color: '#0066cc43'}, width: 0};
      }
      this._shapeType = 'Point';
      this._currentMapShape = null;
      this._mapClickListener = null;
      this._map = $(this.element).simplicityNokiaMap('map');
      this._mvcCoords = new nokia.maps.geo.Strip([]);
      this.creatingMapCursor = 'crosshair';
      this.clickMethod = nokia.maps.dom.Page.browser.touch ? "tap" : "click";
      this.zoomMapComponent = this._map.getComponentById("zoom.DoubleClick");

      this._vertexMarkerImage = this._getMarkerImage(this.options.vertexMarkerOptions);
      this._firstVertexMarkerImage = this._getMarkerImage(this.options.firstVertexMarkerOptions);
      this._mapClick = null;
      this._addClass('ui-simplicity-nokia-shape-creator');
    },
    _getMarkerImage: function (markerOptions) {
      a = markerOptions.anchor;
      return {
        "icon": markerOptions.icon,
        "anchor": new nokia.maps.util.Point(a[0], a[1])
      };
    },
    _setOption: function (key, value) {
      $.ui.simplicityMapShapeCreator.prototype._setOption.apply(this, arguments);
      switch (key) {
      case "markerOptions":
        $.each(this._markers, $.proxy(function (idx, m) {
            m.marker.set(this.options.markerOptions);
          }, this));
        break;
      case "firstVertexMarkerOptions":
        if (this.options.editMode && this._markers.length > 2) {
          this._firstVertexMarkerImage = this._getMarkerImage(this.options.firstVertexMarkerOptions);
          this._markers[0].marker.set(this._firstVertexMarkerImage);
        }
        break;
      case "vertexMarkerOptions":
        this._vertexMarkerImage = this._getMarkerImage(this.options.vertexMarkerOptions);
        var minVertexIdx = this.options.editMode && this._markers.length > 2 ? 0 : -1;
        $.each(this._markers, $.proxy(function (idx, m) {
          if (idx > minVertexIdx) { // Skip the first vertex if it uses the firstVertex options
            m.marker.set(this._vertexMarkerImage);
          }
        }, this));
        break;
      }
    },
    _draw: function () {
      if (this.zoomMapComponent !== null) {
        if (this.options.editMode) {
          this._map.removeComponent(this.zoomMapComponent);
        } else if (this._map.getComponentById("zoom.DoubleClick") === null) {
          this._map.addComponent(this.zoomMapComponent);
        }
      }
      $(this.element).css({cursor: this._mapCursor()});
    },
    _mapCursor: function () {
      return this.options.editMode ? this.creatingMapCursor : 'inherit';
    },
    _addLineString: function () {
      var lineOptions = $.extend({}, this.options.lineStringOptions);
      this._currentMapShape = new nokia.maps.map.Polyline(this._mvcCoords, lineOptions);
      this._map.objects.add(this._currentMapShape);
      this._shapeType = 'LineString';
      return this._currentMapShape;
    },
    _addPolygon: function () {
      this._currentMapShape = new nokia.maps.map.Polygon(this._mvcCoords, $.extend({}, this.options.polygonOptions));
      this._map.objects.add(this._currentMapShape);
      this._shapeType = 'Polygon';
      return this._currentMapShape;
    },
    _setPolylinePath: function (v) {
      if (this._polylineRadius) {
        this._polylineRadius.set('path', v);
      }
    },
    _bufferShape: function () {
      if (this._geoJson.placemarks.type === 'LineString') {
        var polyOptions = $.extend({}, this.options.polygonOptions);
        this._polylineRadius = new nokia.maps.map.Polygon(this._getLineStringBufferPoints(), polyOptions);
        this._map.objects.add(this._polylineRadius);
      } else {
        $.each(this._markers, $.proxy(function (idx, m) {
          if (m.radiusCircle) {
            m.radiusCircle.set($.extend({}, {"radius": this._radiusMeters}));
          } else if (this._radiusMeters) {
            m.radiusCircle = new nokia.maps.map.Circle(
              m.marker.coordinate,
              this._radiusMeters,
              $.extend({}, this.options.polygonOptions, this.options.circleOptions));
            this._map.objects.add(m.radiusCircle);
          }
          if (this._map.objects.indexOf(m.radiusCircle) === -1) {
            this._map.objects.add(m.radiusCircle);
          }
        }, this));
      }
    },
    _unbufferShape: function () {
      $.each(this._markers, $.proxy(function (idx, m) {
        if (m.radiusCircle) {
          this._map.objects.remove(m.radiusCircle);
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
        this._map.objects.remove(object);
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
      var latLng = this._map.pixelToGeo(evt.displayX, evt.displayY);
      return new nokia.maps.geo.Coordinate(latLng.latitude, latLng.longitude, 0, true);
    },
    _makeLatLng: function (lat, lng) {
      // parameters must be numeric
      return new nokia.maps.geo.Coordinate(lat, lng);
    },
    _latLngAsArray: function (latLng) {
      return [latLng.latitude, latLng.longitude];
    },
    updateBounds: function () {
      var ui = {
        coordinates: []
      };
      this.boundsHandler()({}, ui);
      if ($.isArray(ui.coordinates) && ui.coordinates.length > 0) {
        var bounds = nokia.maps.geo.BoundingBox.coverAll(ui.coordinates);
        if (typeof bounds !== 'undefined') {
          this._map.zoomTo(bounds, false);
        }
      }
    },
    _getGeocodePrecisionData: function (point, ui) {
      var p = ["houseNumber", "street", "postalCode", "district", "city", "county", "state", "country"];
      var result = {
        point: point,
        addr: ui.item.value
      };
      try {
        var v = ui.item.vendor.address;
        $.each(p, function (idx, f) {
          if ('undefined' !== typeof v[f]) {
            result[f] = v[f];
          }
        });
      } catch (e) {
      }
      return result;
    },
    setMapCenterFromMarker: function (marker) {
      if (marker) {
        this._map.setCenter(marker.coordinate, 'default');
      }
    },
    getMappingProviderId: function () {
      return "Nokia";
    },
    // Map Listeners
    _addMapClickListener: function () {
      if (this._mapClick === null) {
        this._mapClick = $.proxy(this._mapClickHandler, this);
        this._map.addListener(this.clickMethod, this._mapClick);
      }
    },
    _removeMapClickListener: function () {
      if (this._mapClick) {
        this._map.removeListener(this.clickMethod, this._mapClick);
      }
      this._mapClick = null;
    },
    _addMarker: function (idx, latLng) {
      var marker = new nokia.maps.map.Marker(
          latLng,
          $.extend({}, this._vertexMarkerImage, this.options.markerOptions)
        );
      marker.addListener('mouseenter', $.proxy(function (evt) {
        $(this.element).css({cursor: 'move'});
      }, this));
      marker.addListener('mouseout', $.proxy(function (evt) {
        $(this.element).css({cursor: this._mapCursor()});
      }, this));
      this._markers.push({"marker": marker});
      if (this.options.draggableMarkers) {
        marker.set({"draggable": true, "zIndex": +150});
      }
      this._map.objects.add(marker);
      return marker;
    },
    _setMarkerStyle: function (idx, style) {
      if (idx < this._markers.length) {
        var marker = this._markers[idx].marker;
        if (style === 'vertex') {
          marker.set($.extend({zIndex: +150}, this._vertexMarkerImage));
        } else if (style === 'firstVertex') {
          marker.set($.extend({zIndex: +200}, this._firstVertexMarkerImage));
        }
      }
    },
    _addMarkerClickListener: function (idx, handler) {
      if (idx < this._markers.length) {
        this._markers[idx].marker.addListener(this.clickMethod, $.proxy(handler, this));
      }
    },
    _removeMarkerClickListener: function (idx) {
      // according to the docs, all async events are removed on destroy()
    },
    _addMarkerMoveListener: function (idx, marker, handler) {
      if (idx < this._markers.length) {
        marker.addListener('drag', $.proxy(handler, this));
      }
    },
    _removeMarkerMoveListeners: function () {
      // according to the docs, all async events are removed on destroy()
    },
    _addMarkerDragEndListener: function (idx, marker, handler) {
      if (idx < this._markers.length) {
        marker.addListener('dragend', $.proxy(handler, this));
      }
    },
    _removeMarkerDragEndListeners: function () {
      // according to the docs, all async events are removed on destroy()
    },
    _getDragPosition: function (marker, evt) {
      return this._getLatLngFromEvent(evt);
    },
    _getMarkerPosition: function (marker) {
      return marker.coordinate;
    },
    _removeMarkers: function () {
      this._removeMarkerClickListener(0);
      $.each(this._markers, $.proxy(function (idx, o) {
        var marker = o.marker;
        // according to the docs, all async events are removed on destroy()
        if (o.radiusCircle) {
          this._map.objects.remove(o.radiusCircle);
        }
        this._map.objects.remove(marker);
      }, this));
      this._markers = [];
      this._coordsClear();
    },
    _coordsObserver: function (strip, idx, inserted, removed) {
      if (inserted === 0) {
      } else {
        if (this._currentMapShape !== null) {
          this._currentMapShape.path.set(idx, strip.get(idx));
        }
        if (idx < this._markers.length) {
          if (this._markers[idx].radiusCircle) {
            this._markers[idx].radiusCircle.set("center", strip.get(idx));
          }
        }
      }
    },
    _createCoordsArray: function () {
      this._mvcCoords = new nokia.maps.geo.Strip([]);
      this._mvcCoords.addObserver(this._coordsObserver, this);
      return this._mvcCoords;
    },
    _newCoordsArray: function (v) {
      return new nokia.maps.geo.Strip(v);
    },
    _coordsLength: function () {
      return this._mvcCoords.getLength();
    },
    _coordsPush: function (latLng) {
      var idx = this._mvcCoords.getLength();
      this._mvcCoords.add(latLng);
      return idx;
    },
    _coordsGetAsDArray: function (idx) {
      var p = this._mvcCoords.get(idx);
      return [p.latitude, p.longitude];
    },
    _coordsSetAt: function (idx, latLng) {
      this._mvcCoords.set(idx, latLng);
    },
    _coordsClear: function () {
      this._mvcCoords.removeObserver(this._coordsObserver, this);
      this._mvcCoords.destroy();
      this._createCoordsArray();
    },
    boundsHandler: function () {
      return $.proxy(function (evt, ui) {
        var bounds = ui.coordinates;
        if ('undefined' !== typeof bounds) {
          var bb = null;
          if ('undefined' !== typeof this._polylineRadius && this._polylineRadius !== null) {
            bb = this._polylineRadius.getBoundingBox(this._map);
            bounds.push(bb.bottomRight);
            bounds.push(bb.topLeft);
          } else {
            $.each(this._markers, $.proxy(function (idx, m) {
              bb = m[m.radiusCircle ? "radiusCircle" : "marker"].getBoundingBox(this._map);
              bounds.push(bb.bottomRight);
              bounds.push(bb.topLeft);
            }, this));
          }
        }
      }, this);
    }
  });
}(jQuery));
