/**
 * @name $.ui.simplicityGoogleMapShapeCreator
 * @namespace A Google map.
 * <p>
 * Adds the ability to show an point and radius or polygon/line to the map which
 * is persisted in a target input as geoJSON. This is the building block that
 * <code>simplicityMapShapeCreatorUi</code> exposes.
 * </p>
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMap();
 *     $('#map').simplicityGoogleMapShapeCreator({
 *       input: $('&lt;input name="placemark"/>').simplicityInputs()
 *     });
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="https://developers.google.com/maps/documentation/javascript/reference/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMapShapeCreator", $.ui.simplicityMapShapeCreator, {
    /**
     * Widget options.
     * <dl>
     *   <dt><code>polygonOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of polygons. Defaults to
     *     a map implementation specific value. Defaults to <code>{strokeWeight: 0, fillOpacity: 0.20}</code>.
     *   </dd>
     *   <dt><code>lineStringOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of line strings. Defaults to
     *     <code>{strokeWeight: 1, strokeColor: '#888888'}</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleMapShapeCreator.options
     */
    options: {
      lineStringOptions: '',
      polygonOptions: ''
    },
    _create: function () {
      $.ui.simplicityMapShapeCreator.prototype._create.apply(this, arguments);
      if (this.options.lineStringOptions === '') {
        this.options.lineStringOptions = {strokeWeight: 1, strokeColor: '#888888'};
      }
      if (this.options.polygonOptions === '') {
        this.options.polygonOptions = {strokeWeight: 0, fillOpacity: 0.20};
      }
      this._shapeType = 'Point';
      this._currentMapShape = null;
      this._mapClickListener = null;
      this._map = $(this.element).simplicityGoogleMap('map');
      this._mapCursor = 'crosshair';
      this._mvcCoords = new google.maps.MVCArray();
      this._vertexMarkerImage = this._getMarkerImage(this.options.vertexMarkerOptions);
      this._firstVertexMarkerImage = this._getMarkerImage(this.options.firstVertexMarkerOptions);
      this._addClass('ui-simplicity-google-shape-creator');
    },
    _getMarkerImage: function (markerOptions) {
      var a = markerOptions.anchor;
      var s = markerOptions.size;
      return new google.maps.MarkerImage(
        markerOptions.icon,
        new google.maps.Size(s[0], s[1]),
        new google.maps.Point(0, 0),
        new google.maps.Point(a[0], a[1])
      );
    },
    _setOption: function (key, value) {
      $.ui.simplicityMapShapeCreator.prototype._setOption.apply(this, arguments);
      switch (key) {
      case "markerOptions":
        $.each(this._markers, $.proxy(function (idx, m) {
          m.marker.setOptions(this.options.markerOptions);
        }, this));
        break;
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
          }, this)
        );
        break;
      }
    },
    _draw: function () {
      this._map.setOptions({
        'draggableCursor': this.options.editMode ? this._mapCursor : '',
        'draggingCursor': this.options.editMode ? 'pointer' : '',
        'disableDoubleClickZoom': this.options.editMode
      });
    },
    _addLineString: function () {
      var lineOptions = $.extend({}, this.options.lineStringOptions, {path: this._mvcCoords});
      this._currentMapShape = new google.maps.Polyline(lineOptions);
      this._currentMapShape.setMap(this._map);
      this._shapeType = 'LineString';
      return this._currentMapShape;
    },
    _addPolygon: function () {
      var polyOptions = $.extend({}, this.options.polygonOptions, {paths: this._mvcCoords});
      this._currentMapShape = new google.maps.Polygon(polyOptions);
      this._currentMapShape.setMap(this._map);
      this._shapeType = 'Polygon';
      return this._currentMapShape;
    },
    _setPolylinePath: function (v) {
      if (this._polylineRadius) {
        this._polylineRadius.setPath(v);
      }
    },
    _bufferShape: function () {
      if (this._geoJson.placemarks.type === 'LineString') {
        var polyOptions = $.extend({}, this.options.polygonOptions, {paths: this._getLineStringBufferPoints()});
        if (this._polylineRadius) {
          this._polylineRadius.setMap(null);
        }
        this._polylineRadius = new google.maps.Polygon(polyOptions);
        this._polylineRadius.setMap(this._map);
      } else {
        $.each(this._markers, $.proxy(function (idx, m) {
          if (m.radiusCircle) {
            m.radiusCircle.setRadius(this._radiusMeters);
          } else if (this._radiusMeters) {
            m.radiusCircle = new google.maps.Circle(
              $.extend({}, this.options.polygonOptions, this.options.circleOptions,
              {
                center: m.marker.getPosition(),
                radius: this._radiusMeters
              }));
            m.radiusCircle.setMap(this._map);
          }
        }, this));
      }
    },
    _unbufferShape: function () {
      $.each(this._markers, $.proxy(function (idx, m) {
        if (m.radiusCircle) {
          m.radiusCircle.setMap(null);
          m.radiusCircle = null;
        }
      }, this));
      if (this._polylineRadius) {
        this._polylineRadius.setMap(null);
      }
      this._polylineRadius = null;
    },
    _removeShapeFromMap: function () {
      if (this._currentMapShape !== null) {
        this._currentMapShape.setMap(null);
        this._currentMapShape = null;
        this._shapeType = 'Point';
        if (this._polylineRadius) {
          this._polylineRadius.setMap(null);
          this._polylineRadius = null;
        }
      }
    },
    _getLatLngFromEvent: function (evt) {
      return new google.maps.LatLng(evt.latLng.lat(), evt.latLng.lng());
    },
    _makeLatLng: function (lat, lng) {
      return new google.maps.LatLng(lat, lng);
    },
    _latLngAsArray: function (latLng) {
      return [latLng.lat(), latLng.lng()];
    },
    getMappingProviderId: function () {
      return "Google";
    },
    updateBounds: function () {
      var bounds = new google.maps.LatLngBounds();
      var ui = {
        bounds: bounds
      };
      this.boundsHandler()({}, ui);
      bounds = ui.bounds;
      if ('undefined' !== typeof bounds && !bounds.isEmpty()) {
        this._map.fitBounds(bounds);
      }
    },
    _getGeocodePrecisionData: function (point, ui) {
      var result = {
          point: point,
          addr: ui.item.value
        };
      try {
        var v = ui.item.vendor.address_components;
        $.each(v, function (idx, ac) {
          result[ac.types[0]] = ac.short_name;
          if (idx === 0) {
            result.quality = ac.types[0];
          }
        });
      } catch (e) {
      }
      return result;
    },
    setMapCenterFromMarker: function (marker) {
      if (marker) {
        this._map.setCenter(marker.getPosition());
      }
    },
    // Map Listeners
    _addMapClickListener: function () {
      if (this._mapClickListener === null) {
        this._mapClickListener = google.maps.event.addListener(this._map, 'click', $.proxy(this._mapClickHandler, this));
      }
    },
    _removeMapClickListener: function () {
      if (this._mapClickListener !== null) {
        google.maps.event.removeListener(this._mapClickListener);
        this._mapClickListener = null;
      }
    },
    _addMarker: function (idx, latLng) {
      var markerOpts = $.extend({}, this.options.markerOptions, {
        position: latLng,
        icon: this._vertexMarkerImage
      });
      if (this.options.draggableMarkers) {
        markerOpts.cursor = 'move';
      }
      var marker = new google.maps.Marker(markerOpts);
      this._markers.push({"marker": marker, "moveListener": null, "dragEndListener": null});
      if (this.options.draggableMarkers) {
        marker.setOptions({draggable: true, zIndex: +150});
      }
      marker.setMap(this._map);
      return marker;
    },
    _setMarkerStyle: function (idx, style) {
      if (idx < this._markers.length) {
        var marker = this._markers[idx].marker;
        if (style === 'vertex') {
          marker.setOptions({
            "icon": this._vertexMarkerImage,
            "zIndex": +150
          });
        } else if (style === 'firstVertex') {
          marker.setOptions({
            "icon": this._firstVertexMarkerImage,
            "zIndex": +200
          });
        }
      }
    },
    _getDragPosition: function (marker, evt) {
      return this._getMarkerPosition(marker);
    },
    _getMarkerPosition: function (marker) {
      var position = marker.getPosition();
      return new google.maps.LatLng(position.lat(), position.lng());
    },
    _removeMarkers: function () {
      this._removeMarkerClickListener(0);
      this._removeMarkerMoveListeners();
      this._removeMarkerDragEndListeners();
      $.each(this._markers, function (idx, m) {
        var marker = m.marker;
        marker.setMap(null);
        if (m.radiusCircle) {
          m.radiusCircle.setMap(null);
        }
      });
      this._markers = [];
      this._mvcCoords.clear();
    },
    _addMarkerClickListener: function (idx, handler) {
      if (idx < this._markers.length) {
        this._firstMarkerListener = google.maps.event.addListener(this._markers[idx].marker, 'click', $.proxy(handler, this));
      }
    },
    _removeMarkerClickListener: function (idx) {
      if (this._firstMarkerListener !== null) {
        google.maps.event.removeListener(this._firstMarkerListener);
        this._firstMarkerListener = null;
      }
    },
    _addMarkerMoveListener: function (idx, marker, handler) {
      var result = null;
      if (idx < this._markers.length) {
        result =  google.maps.event.addListener(marker, 'position_changed', $.proxy(handler, this));
        this._markers[idx].moveListener = result;
      }
      return result;
    },
    _removeMarkerMoveListeners: function () {
      $.each(this._markers, function (idx, m) {
        var listener = m.moveListener;
        if (listener !== null) {
          google.maps.event.removeListener(listener);
          m.moveListener = null;
        }
      });
    },
    _addMarkerDragEndListener: function (idx, marker, handler) {
      if (idx < this._markers.length) {
        this._markers[idx].dragEndListener =  google.maps.event.addListener(marker, 'dragend', $.proxy(handler, this));
      }
    },
    _removeMarkerDragEndListeners: function () {
      $.each(this._markers, function (idx, m) {
        var listener = m.dragEndListener;
        if (listener !== null) {
          google.maps.event.removeListener(listener);
          m.moveListener = null;
        }
      });
    },
    // Coords
    _createCoordsArray: function () {
      this._mvcCoords = new google.maps.MVCArray();
      return this._mvcCoords;
    },
    _newCoordsArray: function (v) {
      var l = [];
      $.each(v, function (idx, pa) { // convert to array of LatLng
        l.push(new google.maps.LatLng(pa[0], pa[1]));
      });
      return new google.maps.MVCArray(l);
    },
    _coordsLength: function () {
      return this._mvcCoords.getLength();
    },
    _coordsPush: function (latLng) {
      var idx = this._mvcCoords.getLength();
      this._mvcCoords.push(latLng);
      return idx;
    },
    _coordsGetAsDArray: function (idx) {
      var p = this._mvcCoords.getAt(idx);
      return [p.lat(), p.lng()];
    },
    _coordsSetAt: function (idx, latLng) {
      this._mvcCoords.setAt(idx, latLng);
      if (this._markers[idx].radiusCircle) {
        this._markers[idx].radiusCircle.setCenter(latLng);
      }
    },
    boundsHandler: function () {
      return $.proxy(function (evt, ui) {
        var bounds = ui.bounds;
        if ('undefined' !== typeof bounds) {
          if ('undefined' !== typeof this._polylineRadius && this._polylineRadius !== null) {
            this._polylineRadius.getPath().forEach($.proxy(function (latLng, idx) {
              bounds.extend(latLng);
            }, this));
          } else {
            $.each(this._markers, $.proxy(function (idx, m) {
              if (m.radiusCircle && m.radiusCircle.getMap() !== null) {
                bounds.union(m.radiusCircle.getBounds());
              } else {
                bounds.extend(m.marker.getPosition());
              }
            }, this));
          }
        }
      }, this);
    }
  });
}(jQuery));
