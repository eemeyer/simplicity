/**
 * @name $.ui.simplicityBingMapShapeCreator
 * @namespace A Bing map.
 * <p>
 * Adds the ability to show an point and radius or polygon/line to the map which
 * is persisted in a target input as geoJSON. This is the building block that
 * <code>simplicityMapShapeCreatorUi</code> exposes.
 * </p>
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityBingMap();
 *     $('#map').simplicityBingMapShapeCreator({
 *       input: $('&lt;input name="placemark"/>').simplicityInputs()
 *     });
 *   &lt;/script>
 *
 * @see Bing Maps AJAX Control v7 <a href="http://msdn.microsoft.com/en-us/library/gg427610.aspx">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityBingMapShapeCreator", $.ui.simplicityMapShapeCreator, {
    /**
     * Widget options.
     * <dl>
     *   <dt><code>lineStringOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of line strings. Defaults to
     *     <code>{strokeThickness: 1}</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityBingMapShapeCreator.options
     */
    options: {
      lineStringOptions: ''
    },
    _create: function () {
      $.ui.simplicityMapShapeCreator.prototype._create.apply(this, arguments);
      if (this.options.lineStringOptions === '') {
        this.options.lineStringOptions = {strokeThickness: 1};
      }
      this._shapeType = 'Point';
      this._currentMapShape = null;
      this._mapClickListener = null;
      if (this.options.polygonOptions === '') {
        this.options.polygonOptions = {
          strokeThickness: 0,
          fillColor: new Microsoft.Maps.Color(75, 75, 75, 0.5)
        };
      }
      this._map = $(this.element).simplicityBingMap('map');
      this._mvcCoords = [];
      this._mapElement = $(this.element).find('.MicrosoftMap');
      this._defaultMapCursor = this._mapElement.css('cursor');
      this._mapDrawCursor = 'crosshair';
      this._mapClickListener = null;

      this._vertexMarkerImage = this._getMarkerImage(this.options.vertexMarkerOptions);
      this._firstVertexMarkerImage = this._getMarkerImage(this.options.firstVertexMarkerOptions);
      this._addClass('ui-simplicity-bing-shape-creator');
    },
    _getMarkerImage: function (markerOptions) {
      var a = markerOptions.anchor;
      var s = markerOptions.size;
      return {
        icon: markerOptions.icon,
        width: s[0],
        height: s[1],
        anchor: new Microsoft.Maps.Point(a[0], a[1]),
        zIndex: +150
      };
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
          this._markers[0].marker.setOptions(this._firstVertexMarkerImage);
        }
        break;
      case "vertexMarkerOptions":
        this._vertexMarkerImage = this._getMarkerImage(this.options.vertexMarkerOptions);
        var minVertexIdx = this.options.editMode && this._markers.length > 2 ? 0 : -1;
        $.each(this._markers, $.proxy(function (idx, m) {
          if (idx > minVertexIdx) { // Skip the first vertex if it uses the firstVertex options
            m.marker.setOptions(this._vertexMarkerImage);
          }
        }, this));
        break;
      }
    },
    _draw: function () {
      this._setMapCursor();
    },
    _setMapCursor: function () {
      this._mapElement.css({'cursor': this.options.editMode ? this._mapDrawCursor : this._defaultMapCursor});
    },
    _addLineString: function () {
      var lineOptions = $.extend({}, this.options.lineStringOptions);
      this._currentMapShape = new Microsoft.Maps.Polyline(this._mvcCoords, lineOptions);
      this._map.entities.push(this._currentMapShape);
      this._shapeType = 'LineString';
      return this._currentMapShape;
    },
    _addPolygon: function () {
      var polyOptions = $.extend({}, this.options.polygonOptions);
      this._currentMapShape = new Microsoft.Maps.Polygon(this._mvcCoords, polyOptions);
      this._map.entities.push(this._currentMapShape);
      this._shapeType = 'Polygon';
      return this._currentMapShape;
    },
    _setPolylinePath: function (v) {
      if (this._polylineRadius) {
        this._polylineRadius.setLocations(v);
      }
    },
    _bufferShape: function () {
      if (this._geoJson.placemarks.type === 'LineString') {
        var polyOptions = $.extend({}, this.options.polygonOptions);
        if (this._polylineRadius) {
          this._map.entities.remove(this._polylineRadius);
        }
        this._polylineRadius = new Microsoft.Maps.Polygon(this._getLineStringBufferPoints(), polyOptions);
        this._map.entities.push(this._polylineRadius);
      } else {
        $.each(this._markers, $.proxy(function (idx, m) {
          if (m.radiusCircle) {
            this._map.entities.remove(m.radiusCircle);
          }
          if (this._radiusMeters) {
            var center = this._latLngAsArray(m.marker.getLocation());
            m.radiusCircle = this._createCircle(center);
            this._map.entities.push(m.radiusCircle);
          }
        }, this));
      }
    },
    _unbufferShape: function () {
      $.each(this._markers, $.proxy(function (idx, m) {
        if (m.radiusCircle) {
          this._map.entities.remove(m.radiusCircle);
          m.radiusCircle = null;
        }
      }, this));
      if (this._polylineRadius) {
        this._map.entities.remove(this._polylineRadius);
      }
      this._polylineRadius = null;
    },
    _removeFromMap: function (object) {
      if (object !== null) {
        this._map.entities.remove(object);
      }
    },
    _removeShapeFromMap: function () {
      if (this._currentMapShape !== null) {
        this._map.entities.remove(this._currentMapShape);
        this._currentMapShape = null;
        this._shapeType = 'Point';
        if (this._polylineRadius) {
          this._map.entities.remove(this._polylineRadius);
          this._polylineRadius = null;
        }
      }
    },
    _getLatLngFromEvent: function (evt) {
      var point = new Microsoft.Maps.Point(evt.getX(), evt.getY());
      var loc = evt.target.tryPixelToLocation(point);
      return new Microsoft.Maps.Location(loc.latitude, loc.longitude);
    },
    _makeLatLng: function (lat, lng) {
      return new Microsoft.Maps.Location(lat, lng);
    },
    _latLngAsArray: function (latLng) {
      return [latLng.latitude, latLng.longitude];
    },
    updateBounds: function () {
      var ui = {
        locations: []
      };
      this.boundsHandler()({}, ui);
      if ('undefined' !== typeof ui.locations && 0 !== ui.locations.length) {
        this._map.setView({bounds: Microsoft.Maps.LocationRect.fromLocations(ui.locations)});
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
        });
      } catch (e) {
      }
      return result;
    },
    setMapCenterFromMarker: function (marker) {
      if (marker) {
        this._map.setView({center: marker.getLocation()});
      }
    },
    getMappingProviderId: function () {
      return "Bing";
    },
    _addMapClickListener: function () {
      if (this._mapClickListener === null) {
        this._mapClickListener = Microsoft.Maps.Events.addHandler(this._map, 'click', this._bingMapClickListener());
      }
    },
    _removeMapClickListener: function () {
      if (this._mapClickListener !== null) {
        Microsoft.Maps.Events.removeHandler(this._mapClickListener);
        this._mapClickListener = null;
      }
    },
    _addMarker: function (idx, latLng) {
      var marker = null;
      if (idx <= 2 || !$.simplicityEquiv(latLng, this._markers[0].marker.getLocation())) {
        var markerOpts = $.extend({}, this.options.markerOptions, this._vertexMarkerImage);
        marker = new Microsoft.Maps.Pushpin(latLng, markerOpts);
        this._markers.push({"marker": marker, "moveListener": null, "dragEndListener": null});
        if (this.options.draggableMarkers) {
          marker.setOptions({draggable: true});
        }
        this._map.entities.push(marker);
      }
      return marker;
    },
    _setMarkerStyle: function (idx, style) {
      if (idx < this._markers.length) {
        var marker = this._markers[idx].marker;
        if (style === 'vertex') {
          marker.setOptions(this._vertexMarkerImage);
        } else if (style === 'firstVertex') {
          marker.setOptions(this._firstVertexMarkerImage);
        }
      }
    },
    _addMarkerClickListener: function (idx, handler) {
      if (idx < this._markers.length) {
        var clickHandler = function (evt) {
          // Click is triggered at end of drag. :(, so we need to see if the marker
          // moved before deciding if we're going to close the polygon
          if ($.simplicityEquiv(this._dragStartLocation, this._dragEndLocation)) {
            $.proxy(handler, this)(evt);
          }
        };
        this._firstMarkerListener = Microsoft.Maps.Events.addHandler(this._markers[idx].marker, 'click', $.proxy(clickHandler, this));
      }
    },
    _removeMarkerClickListener: function (idx) {
      if (this._firstMarkerListener !== null) {
        Microsoft.Maps.Events.removeHandler(this._firstMarkerListener);
        this._firstMarkerListener = null;
      }
    },
    _addMarkerMoveListener: function (idx, marker, handler) {
      var result = null;
      if (idx < this._markers.length) {
        result = Microsoft.Maps.Events.addHandler(marker, 'drag', $.proxy(handler, this));
        this._markers[idx].moveListener = result;
        this._markers[idx].mouseoverlistener = Microsoft.Maps.Events.addHandler(marker, 'mouseover', $.proxy(this._changeCursor, this));
        this._markers[idx].mouseoutlistener = Microsoft.Maps.Events.addHandler(marker, 'mouseout', $.proxy(this._revertCursor, this));
      }
      return result;
    },
    _removeMarkerMoveListeners: function () {
      $.each(this._markers, function (idx, o) {
        var listener = o.moveListener;
        if (listener !== null) {
          Microsoft.Maps.Events.removeHandler(listener);
          o.moveListener = null;
          Microsoft.Maps.Events.removeHandler(o.mouseoverlistener);
          Microsoft.Maps.Events.removeHandler(o.mouseoutlistener);
        }
      });
    },
    _addMarkerDragEndListener: function (idx, marker, handler) {
      if (idx < this._markers.length) {
        var dragStartHandler = function () {
          // Store the start location
          this._dragStartLocation = marker.getLocation();
        };
        var dragEndHandler = function (evt) {
          // When clicking the first marker, we compare this location to see if we
          // were dragging or clicking
          this._dragEndLocation = marker.getLocation();
          $.proxy(handler, this)(evt);
        };
        this._markers[idx].dragStartListener = Microsoft.Maps.Events.addHandler(marker, 'dragstart', $.proxy(dragStartHandler, this));
        this._markers[idx].dragEndListener = Microsoft.Maps.Events.addHandler(marker, 'dragend', $.proxy(dragEndHandler, this));
      }
    },
    _removeMarkerDragEndListeners: function () {
      $.each(this._markers, function (idx, o) {
        var listener = o.dragEndListener;
        if (listener !== null) {
          Microsoft.Maps.Events.removeHandler(listener);
          o.moveListener = null;
        }
      });
    },
    _getDragPosition: function (marker, evt) {
      return this._getMarkerPosition(marker);
    },
    _getMarkerPosition: function (marker) {
      var p = marker.getLocation();
      return new Microsoft.Maps.Location(p.latitude, p.longitude);
    },
    _removeMarkers: function () {
      this._removeMarkerClickListener(0);
      this._removeMarkerMoveListeners();
      this._removeMarkerDragEndListeners();
      var map = this._map;
      $.each(this._markers, function (idx, o) {
        var marker = o.marker;
        map.entities.remove(marker);
        if (o.radiusCircle) {
          map.entities.remove(o.radiusCircle);
        }
      });
      this._markers = [];
      this._createCoordsArray();
    },
    _createCoordsArray: function () {
      this._mvcCoords = [];
      return this._mvcCoords;
    },
    _newCoordsArray: function (v) {
      var l = [];
      $.each(v, function (idx, pa) { // convert to array of LatLng
        l.push(new Microsoft.Maps.Location(pa[0], pa[1]));
      });
      return l;
    },
    _coordsLength: function () {
      return this._mvcCoords.length;
    },
    _coordsPush: function (latLng) {
      var idx = this._mvcCoords.length;
      this._mvcCoords.push(latLng);
      if (this._currentMapShape) {
        this._currentMapShape.setLocations(this._mvcCoords);
      }
      return idx;
    },
    _coordsGetAsDArray: function (idx) {
      var p = this._mvcCoords[idx];
      return [p.latitude, p.longitude];
    },
    _coordsSetAt: function (idx, latLng) {
      this._mvcCoords[idx] = latLng;
      var m = this._markers[idx];
      if (m.radiusCircle) {
        this._map.entities.remove(m.radiusCircle);
        if (this.radiusMeters) {
          var center = this._latLngAsArray(latLng);
          m.radiusCircle = this._createCircle(center);
          this._map.entities.push(m.radiusCircle);
        }
      }
      if (this._currentMapShape) {
        this._currentMapShape.setLocations(this._mvcCoords);
      }
    },
    boundsHandler: function () {
      return $.proxy(function (evt, ui) {
        if ($.isArray(ui.locations)) {
          var bounds = ui.locations;
          if ('undefined' !== typeof bounds) {
            if ('undefined' !== typeof this._polylineRadius && this._polylineRadius !== null) {
              this._polylineRadius.getLocations().forEach($.proxy(function (latLng, idx) {
                bounds.push(latLng);
              }, this));
            } else {
              $.each(this._markers, $.proxy(function (idx, m) {
                bounds.push(m.marker.getLocation());
              }, this));
            }
          }
        }
      }, this);
    },
    _bingMapClickListener: function () {
      return $.proxy(function (evt) {
        // Clicking on a marker also triggers this event, so we have to filter
        // to prevent markers from popping up everywhere
        if (evt.targetType === 'map') {
          this._mapClickHandler(evt);
        }
      }, this);
    },
    _changeCursor: function () {
      this._mapElement.css({'cursor': 'move'});
    },
    _revertCursor: function () {
      this._setMapCursor();
    },
    _createCircle: function (center) {
      // Bing does not support drawing Circles
      var pFrom = $.simplicityGeoFn.travel(center, this._radiusMeters, 0);
      var circleCoords = this._newCoordsArray(this._getArc(360, center, pFrom, this._radiusMeters, 12.25));
      circleCoords.push(circleCoords[0]);
      var options = $.extend({}, this.options.polygonOptions, this.options.circleOptions);
      return new Microsoft.Maps.Polygon(circleCoords, options);
    }
  });
}(jQuery));
