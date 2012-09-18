/**
 * @name $.ui.simplicityMapShapeCreator
 * @namespace A map shape creator for use in Discovery searches.
 * <p>
 * This widget is generally only called through one of its implementations that
 * are specific to a map provider.
 *
 * Current simplcityMapShapeCreator implementations:
 * <ul>
 * <li>simplicityGoogleShapeCreator</li>
 * <li>simplicityNokiaMapShapeCreator</li>
 * <li>simplicityMapQuestShapeCreator</li>
 * </ul>
 *
 * <p>A widget which creates a single shape on a map. Supported shapes are Point, MultiPoint,
 * LineString and Polygon.
 *
 * Whenever the shapes change, the underlying state input element will be updated.</p>
 *
 * <p>The widget supports radius values by showing circles around any drawn
 * point, as long as the point is not part of polygon. The radius value can be used
 * for exactDistance calculations in a Discovery geoloc type query.</p>
 *
 * <p>Requires an instance of simplicity&lt;mapprovider&gt;ShapeCreator implementation.
 * When used in conjunction with simplicityMapShapeCreatorUi, a complete visible
 * shape creator interface is made available.</p>
 *
 * <p>Triggers a <code>simplicitymapshapecreatorshapechange</code> event which other components can use to
 * add additional functionality.</p>
 *
 * The map is formatted into geoJson (http://www.geojson.org/geojson-spec.html) as follows:
 * <pre>
 * {
 *   "placemarks": {
 *     "type": "Polygon",
 *     "coordinates": [[[lng1,lat1], [lng2, lat2], [lng3, lat3], [lng1, lat1]]]
 *   },
 *   "properties": {
 *     "radius": 1.5
 *   }
 * }
 * </pre>
 *
 * <p>The Discovery Search Engine criterion using the geoJson format would look
 * like this:</p>
 * <pre>
 * {
 *    "dimension": "location",
 *    "placemarks": {
 *      "type": "Polygon",
 *      "coordinates": [[[lng1,lat1], [lng2, lat2], [lng3, lat3], [lng1, lat1]]]
 *    },
 *    "exactDistance": 1.5
 * }
 * </pre>
 */
(function ($) {
  var supportedShapeTypes = ['Point', 'MultiPoint', 'LineString', 'Polygon'];
  $.widget("ui.simplicityMapShapeCreator", $.ui.simplicityWidget, {
    /**
     * Widget options.
     * <dl>
     *   <dt><code>input</code></dt>
     *   <dd>
     *     The input or selector for the element that contains the geoJson state.
     *     Defaults to <code>'$('&lt;input name="placemark"/>').simplicityInputs()'</code>.
     *   </dd>
     *   <dt><code>editMode</code></dt>
     *   <dd>
     *     Determines if the widget is in edit mode or not. When in edit mode, the widget allows new
     *     points associated with a shape to be added. Defaults to <code>false</code>.
     *   </dd>
     *   <dt><code>radius</code></dt>
     *   <dd>
     *     Determines the radius to use when defining exactDistance circles and
     *     the area of a LineString. Defaults to <code>1</code>.
     *   </dd>
     *   <dt><code>distanceUnit</code></dt>
     *   <dd>
     *     Determines whether the radius distance is specified in Miles (<code>MI</code>)
     *     or Kilometers (<code>KM</code>).
     *     Defaults to <code>MI</code>.
     *   </dd>
     *   <dt><code>connected</code></dt>
     *   <dd>
     *     Determines if the widget connects multi points into a line string
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt><code>draggableMarkers</code></dt>
     *   <dd>
     *     Set this to <code>true</code> to allow created markers (vertices)
     *     to be dragged to new positions. Not all map providers may support
     *     draggable markers.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt><code>capSegments</code></dt>
     *   <dd>
     *     Determines how many arc segments are created when displaying the searchable
     *     radius around a LineString end point.
     *     Defaults to <code>8</code>.
     *   </dd>
     *   <dt><code>jointSegments</code></dt>
     *   <dd>
     *     Determines how the maximum number of arc segments  created when displaying the searchable
     *     radius around a LineString mid-string joint vertex (not an end point).
     *     Defaults to <code>8</code>.
     *   </dd>
     *   <dt><code>firstVertexMarkerOptions</code></dt>
     *   <dd>
     *     Determines the map vendor independent specification for displaying a marker
     *     for the first vertex of a drawn shape.
     *     Defaults to css <code>
     *     .ui-simplicity-map-shape-creator .vertex-marker {
     *       background-image: url(shapecreator/first_marker_alpha_29x29.png);
     *       width: 29px;
     *       height: 29px;
     *     }</code>
     *   </dd>
     *   <dt><code>vertexMarkerOptions</code></dt>
     *   <dd>
     *     Determines the map vendor independent specification for displaying a
     *     generic marker for any vertex of a drawn shape.
     *     Defaults to css <code>
     *     .ui-simplicity-map-shape-creator .vertex-marker {
     *       background-image: url(shapecreator/vertex_alpha_29x29.png);
     *       width: 29px;
     *       height: 29px;
     *     }</code>
     *   </dd>
     *   <dt><code>markerOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to enhance the vertex markers. Defaults to
     *     ''.
     *   </dd>
     *   <dt><code>polygonOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of polygons. Defaults to
     *     a map implementation specific value. Defaults to <code>''</code>.
     *   </dd>
     *   <dt><code>circleOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of circles used to
     *     display search radii around points and line strings. Extends the
     *     settings for <code>polygonOptions</code>.
     *   </dd>
     *   <dt><code>lineStringOptions</code></dt>
     *   <dd>
     *     A dictionary of options that are used to define the look of line strings. Defaults to
     *     <code>''</code>.
     *   </dd>
     *   <dt><code>dragOptimization</code></dt>
     *   <dd>
     *     When enabled, visible radii around points and line strings are not updated
     *     until the drag action ends. Defaults to <code>false</code>.
     *   </dd>
     *   <dt><code>debug</code></dt>
     *   <dd>
     *     Enables debug mode. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityMapShapeCreator.options
     */
    options: {
      input: '',
      editMode: false,
      connected: true,
      draggableMarkers: true,
      radius: 0,
      capSegments: 8,
      jointSegments: 8,
      distanceUnit: 'MI', // or 'KM'
      markerOptions: '',
      lineStringOptions: '',
      polygonOptions: '',
      circleOptions: '',
      dragOptimization: false,
      debug: false,
      firstVertexMarkerOptions: '',
      vertexMarkerOptions: ''
    },
    _create: function () {
      this._points = [];
      this._geoJson = this._newGeoJson();

      this._jointDegrees = 180 / this.options.jointSegments;
      this._capDegrees = 180 / this.options.capSegments;
      this._precision = 10000;
      // Initialize class instance variables
      this._map = '';
      this._markers = [];
      this._firstMarkerListener = null;
      if (this.options.markerOptions === '') {
        this.options.markerOptions = {};
      }
      if (this.options.circleOptions === '') {
        this.options.circleOptions = {};
      }
      this._input = this.options.input === '' ?
        $('<input name="placemark"/>').simplicityInputs() :
        $(this.options.input);
      this._bind(this._input, 'change', this._inputChangeHandler);
      this._addClass('ui-simplicity-map-shape-creator');
      if (this.options.firstVertexMarkerOptions === '') {
        this.options.firstVertexMarkerOptions = this._getVertexMarkerOptions('first-vertex-marker');
      }
      if (this.options.vertexMarkerOptions === '') {
        this.options.vertexMarkerOptions = this._getVertexMarkerOptions('vertex-marker');
      }
    },
    _getVertexMarkerOptions: function (vertexClass) {
      var helper = $('<div/>')
        .addClass('ui-helper-hidden-accessible ' + vertexClass)
        .appendTo(this.element);
      var w = helper.width(), h = helper.height();
      var vertexOpts = {
        icon: helper.css('background-image').replace(/url\("?([^"]*)"?\)/, '$1'),
        size: [w, h], // size of div from style, width, height should be odd to enable pixel centering
        anchor: [(w + w % 2) / 2, (h + h % 2) / 2] // centered horizontally / vertically
      };
      helper.remove();
      if (this.options.debug) {
        console.log('simplicityMapShapeCreator: vertex "' + vertexClass + '" options', JSON.stringify(vertexOpts, null, '  '));
      }
      return vertexOpts;
    },
    _setOption: function (key, value) {
      $.Widget.prototype._setOption.apply(this, arguments);
      switch (key) {
      case "editMode":
        this._geoJson.properties.editMode = value;
        if (value) {
          if ('undefined' !== this._geoJson.properties && this._geoJson.properties.geocoder) {
            // If we had geocoded, we need to clear any shape related to the geocoded
            // point as we're going to create a fresh new shape
            this.reset();
          }
          this._addMapClickListener();
          this._setupFirstPoint();
        } else {
          this._clearFirstPointUi();
          this._removeMapClickListener();
          this._removeMarkerClickListener(0);
        }
        if (!this.options.editMode || this._geoJson.placemarks.type !== 'Polygon') {
          this._draw();
        }
        this._changeHandler();
        break;
      case "radius":
        this._applyShapeBuffer();
        this._geoJson.properties.radius = value;
        this._changeHandler();
        break;
      case "connected":
        if (this.options.editMode) {
          if (value) { // LineString
            this._createLineString();
            this._setupFirstPoint();
          } else if (this._geoJson.placemarks.type.indexOf('Point') === -1) {
            // convert to MultiPoint, if shape type isn't a "Point" variant
            this._removeShapeFromMap();
            this._clearFirstPointUi();
            if (this._geoJson.placemarks.type === 'Polygon') {
              // Convert LinearRing to MultiPoint coords
              this._geoJson.placemarks.coordinates = this._geoJson.placemarks.coordinates[0].slice(0, -1);
            }
            this._geoJson.placemarks.type = (this._points.length === 1) ? 'Point' : 'MultiPoint';
          }
          this._geoJson.properties.radius = this.options.radius;
          this._draw();
          this._applyShapeBuffer();
          this._changeHandler(true);
        }
        break;
      case "jointSegments":
        this._jointDegrees = 180 / value;
        break;
      case "capSegments":
        this._capDegrees = 180 / value;
        break;
      }
    },
    _setupFirstPoint: function () {
      if (this._geoJson.placemarks.type === 'LineString') {
        this._addMarkerClickListener(0, this._firstMarkerClickHandler);
      }
      if (this._points.length >= 3) {
        this._setFirstPointUi();
      }
    },
    // START OF PUBLIC METHODS
    /**
     * Clears any map drawing without triggering a state change.
     *
     * @name $.ui.simplicityMapShapeCreator.clear
     * @function
     * @param {boolean} [triggerChange] Chooses if the change handler will be called. Default is <code>true</code>
     */
    reset: function (triggerChange) {
      this._clear();
      this._geoJson = this._newGeoJson();
      if ('undefined' === typeof triggerChange || triggerChange === true) {
        this._changeHandler();
      }
    },
    /**
     * Places a new marker at the specified point.
     *
     * @name $.ui.simplicityMapShapeCreator.newGeocodedPoint
     * @function
     * @param {String} location The geocoded value returned by the geocoder, usually a formatted address
     * @param {double} lat The latitude of the point
     * @param {double} lng The longitude of the point
     * @returns {object} the geoJson shape object
     */
    newGeocodedPoint: function (ui) {
      var latLng = this._makeLatLng(ui.item.latitude, ui.item.longitude);
      var marker = this._newPoint(latLng);
      if (marker !== null) {
        if (this._points.length === 1) {
          this._addMarkerClickListener(0, this._firstMarkerClickHandler);
        }
        if ('undefined' !== typeof ui.item.value) {
          this._geoJson.properties.geocoder = this._getGeocodePrecisionData(this._asGeoJsonLatLng(latLng), ui);
        }
        this._changeHandler(true);
      }
      return marker;
    },
    /**
     * Converts a polygon into a line string by breaking the LinerRing coordinates.
     *
     * @name $.ui.simplicityMapShapeCreator.convertPolygonToLineString
     * @function
     *
     * Triggers a state change
     */
    convertPolygonToLineString: function (radius) {
      if (this._geoJson.placemarks.type === 'Polygon') {
        // Convert LinearRing to MultiPoint coords
        this._geoJson.placemarks.coordinates = this._geoJson.placemarks.coordinates[0].slice(0, -1);
        this._removeShapeFromMap();
        this._geoJson.properties.radius = radius;
        this._createLineString();
        this._applyShapeBuffer();
        this._addMarkerClickListener(0, this._firstMarkerClickHandler);
        if (this._points.length >= 3) {
          this._setFirstPointUi();
        }
        this._changeHandler(true);
      }
    },
    /**
     * Handler for change events. When the underlying shape is changed this
     * handler updates the state of the associated input with this data.
     *
     * <p>Triggers a simplicitymapshapecreatorshapechange event. Handlers for that event receive a ui
     * object with a geoJson member.</p>
     *
     * @name $.ui.simplicityMapShapeCreator._changeHandler
     * @function
     * @param {boolean} [force] determines whether to force the change regardless of the type of shape in play.
     * Defaults to <code>true</code>
     */
    _changeHandler: function (force) {
      this._triggerShapeChange(this._geoJson);
      this._input.val(this._geoJson.placemarks.coordinates.length === 0 ? '' : JSON.stringify(this._geoJson));
      try {
        this._ignoreChangeEvent = true;
        this._input.change();
      } finally {
        // ignore errors
        this._ignoreChangeEvent = false;
      }
    },
    /**
     * Return the geoJson object.
     *
     * @name $.ui.simplicityMapShapeCreator.geoJson
     * @function
     * @returns {object} the geoJson shape object
     */
    geoJson: function () {
      return this._geoJson;
    },
    /**
     * Returns the geometry (shape type) of the current shape.
     *
     * @name $.ui.simplicityMapShapeCreator.geometry
     * @function
     * @returns {String} Either <code>Point</code>, <code>MultiPoint</code>, <code>LineString</code> or <code>Polygon</code>.
     *
     */
    geometry: function () {
      return this._geoJson.placemarks.type;
    },
    /**
     * Returns the case-sensitive id of the underlying mapping provider.
     *
     * @name $.ui.simplicityMapShapeCreator.getMappingProviderId
     * @function
     * @returns {String} the case sensitive mapping provider id, e.g. "Google", "MapQuest", etc.
     */
    getMappingProviderId: function () {
      throw new Error("getMappingProviderId method should be implemented");
    },
    /**
     * Returns a dictionary of widget type to mapping provider implementation
     * names.
     *
     * @name $.ui.simplicityMapShapeCreator.getMappingProviderWidgetNames
     * @function
     * @returns {Dictionary} The dictionary of widget names
     *
     * Response dictionary:
     * <dl>
     *   <dt><code>map</code></dt>
     *   <dd>
     *     The widget name for the map widget, for example, <code>simplicityGoogleMap</code>.
     *   </dd>
     *   <dt><code>shapeCreator</code></dt>
     *   <dd>
     *     The widget name for the the shape creator widget, for example, <code>simplicityGoogleMapShapeCreator</code>.
     *   </dd>
     *   <dt><code>geocoder</code></dt>
     *   <dd>
     *     The widget name for the mapping provider geocoder widget, for example, <code>simplicityGoogleGeocoder</code>.
     *   </dd>
     *   <dt><code>results</code></dt>
     *   <dd>
     *     The widget name for the mapping provider results widget, for example, <code>simplicityGoogleMapResults</code>.
     *   </dd>
     *   <dt><code>boundsCoordinator</code></dt>
     *   <dd>
     *     The widget name for the mapping provider bounds coordinator, for example, <code>simplicityGoogleMapBoundsCoordinator</code>.
     *   </dd>
     *   <dt><code>boundsTracker</code></dt>
     *   <dd>
     *     The widget name for the mapping provider bounds tracker, for example, <code>simplicityGoogleMapBoundsTracker</code>.
     *   </dd>
     * </dl>
     */
    getMappingProviderWidgetNames: function () {
      var id = this.getMappingProviderId();
      return {
        map: "simplicity" + id + "Map",
        shapeCreator: "simplicity" + id + "MapShapeCreator",
        geocoder: "simplicity" + id + "Geocoder",
        results: "simplicity" + id + "MapResults",
        boundsCoordinator: "simplicity" + id + "MapBoundsCoordinator",
        boundsTracker: "simplicity" + id + "MapBoundsTracker"
      };
    },
    /**
     * Updates Bounds for the associated map to include all of the drawn shapes
     * Use this method when forcing the map to update to include the shape bounds.
     * Use <code>boundsHandler</code> as the event handler to a simplicity map bounds
     * coordinator "calculatebounds" event.
     *
     * @name $.ui.simplicityMapShapeCreator.updateBounds
     * @function
     */
    updateBounds: function () {
      throw new Error("updateBounds method should be implemented");
    },
    /**
     * Handler for adjusting the map bounds to include any drawn shape. Use this
     * method to retrieve the bounds handler for use in binding to a simplicity
     * map bounds coordinator "calculatebounds" event.
     *
     * @name $.ui.simplicityMapShapeCreator.boundsHandler
     * @function
     * @private
     */
    boundsHandler: function (evt, ui) {
      throw new Error("boundsHandler method should be implemented");
    },
    /**
     * Sets the center of the map to the specified Lat/Lng point.
     *
     * @name $.ui.simplicityMapShapeCreator.setMapCenterFromMarker
     * @function
     */
    setMapCenterFromMarker: function (marker) {
      throw new Error("setMapCenterFromMarker method should be implemented");
    },
    // END OF PUBLIC METHODS
    _getLatLngFromEvent: function (evt) {
      throw new Error("_getLatLngFromEvent method should be implemented");
    },
    /**
     * Makes a lat/lng instance from two doubles.
     *
     * @name $.ui.simplicityMapShapeCreator._makeLatLng
     * @function
     * @param lat double
     * @param lng double
     */
    _makeLatLng: function (lat, lng) {
      throw new Error("_makeLatLng method should be implemented");
    },
    /**
     * Creates a single element array of lat/lng doubles.
     *
     * @name $.ui.simplicityMapShapeCreator._latLngAsArray
     * @function
     */
    _latLngAsArray: function (latLng) {
      throw new Error("_latLngAsArray method should be implemented");
    },
    /**
     * Sets the center of the map to the specified Lat/Lng point.
     *
     * @name $.ui.simplicityMapShapeCreator._getGeocodePrecisionData
     * @function
     */
    _getGeocodePrecisionData: function (point, ui) {
      throw new Error("_getGeocodePrecisionData method should be implemented");
    },
    /**
     * Adds a click listener to a marker
     *
     * @name $.ui.simplicityMapShapeCreator._addMarkerClickListener
     * @function
     * @param {int} idx A zero-based index referring to the list of marker vertices.
     */
    _addMarkerClickListener: function (idx, handler) {
      throw new Error("_addMarkerClickListener method should be implemented");
    },
    /**
     * Adds a click listener to a marker
     *
     * @name $.ui.simplicityMapShapeCreator._removeMarkerClickListener
     * @function
     * @param {int} idx A zero-based index referring to the list of marker vertices.
     */
    _removeMarkerClickListener: function (idx) {
      throw new Error("_removeMarkerClickListener method should be implemented");
    },
    /**
     * Buffers a shape
     *
     * @name $.ui.simplicityMapShapeCreator._bufferShape
     * @function
     */
    _bufferShape: function () {
      throw new Error("_bufferShape method should be implemented");
    },
    /**
     * Removes any buffers from shapes
     *
     * @name $.ui.simplicityMapShapeCreator._unbufferShape
     * @function
     */
    _unbufferShape: function () {
      throw new Error("_unbufferShape method should be implemented");
    },
    /**
     * Sets the path coordinates
     *
     * @name $.ui.simplicityMapShapeCreator._setPolylinePath
     * @function
     * @param {Array} v Array of coordinates to use for the path
     */
    _setPolylinePath: function (v) {
      throw new Error("_setPolylinePath method should be implemented");
    },
    /**
     * Clears the shape creator without changing the geoJson object
     * @name $.ui.simplicityMapShapeCreator._clear
     * @function
     * @private
     */
    _clear: function (evt, ui) {
      this._removeShapeFromMap();
      this._removeMarkers();
      this._points = [];
    },
    /**
     * Handler for dealing with changes to the underlying input for the shape.
     * @name $.ui.simplicityMapShapeCreator._inputChangeHandler
     * @function
     * @private
     */
    _inputChangeHandler: function (evt, ui) {
      if (!this._ignoreChangeEvent) {
        if (this._input.val().length === 0) {
          if (this._markers.length > 0) {
            this.reset();
          }
        } else {
          try {
            this._geoJson = this._validateGeoJson(JSON.parse(this._input.val()));
            this._geoJsonToMap(this._geoJson);
            this._triggerShapeChange(this._geoJson);
          } catch (e) {
            if (this.options.debug) {
              console.log(e.message, e);
            } else {
              this.reset();
            }
          }
        }
      }
    },
    /**
     * @name $.ui.simplicityMapShapeCreator._validateGeoJson
     * @function
     * @param {geoJson} geoJson The geoJson object to validate
     * @returns {geoJson}
     * @private
     * @throws Error on invalid geoJson
     */
    _validateGeoJson: function (geoJson) {
      var result = undefined;
      if ('undefined' !== typeof geoJson.placemarks) {
        if ('undefined' !== typeof geoJson.placemarks.type) {
          if ($.inArray(geoJson.placemarks.type, supportedShapeTypes) > -1) {
            if ('undefined' !== typeof geoJson.placemarks.coordinates) {
              if ($.isArray(geoJson.placemarks.coordinates)) {
                result = geoJson;
              } else {
                throw new Error("geoJson coordinates are not an Array.");
              }
            } else {
              throw new Error("Missing geoJson coordinates.");
            }
          } else {
            throw new Error("geoJson placemark type is not valid list: " +
                geoJson.placemarks.type + " not in " + supportedShapeTypes.join(", "));
          }
        } else {
          throw new Error("Missing geoJson placemarks type.");
        }
      } else {
        throw new Error("Missing geoJson placemarks");
      }
      return result;
    },
    /**
     * @name $.ui.simplicityMapShapeCreator._newGeoJson
     * Creates a new and "empty" geoJson shape.
     * @function
     * @private
     * @returns {object} A geoJson Point geometry object with no coordinate
     */
    _newGeoJson: function () {
      return {
          placemarks: {
            type: 'Point',
            coordinates: []
          },
          properties: {
            radius: this.options.radius
          }
        };
    },
    /**
     * Manages setting the radius for a shape.
     *
     * @name $.ui.simplicityMapShapeCreator._applyShapeBuffer
     * @function
     * @private
     */
    _applyShapeBuffer: function () {
      this._radiusMeters = this.options.radius * (this.options.distanceUnit === 'MI' ? 1609.344 : 1000);
      this._unbufferShape();
      if (this.options.radius === "0" || this.options.radius === 0 || this._geoJson.placemarks.type === 'Polygon' || this._coordsLength() === 0) {
      } else {
        this._bufferShape();
      }
    },
    /**
     * Handler for triggering a simplicitymapshapecreatorshapechange event.
     *
     * @name $.ui.simplicityMapShapeCreator._triggerShapeChange
     * @function
     * @private
     * @param {object} geoJson shape object representing the changed shape
     */
    _triggerShapeChange: function (geoJson) {
      var ui = geoJson ? {'geoJson': geoJson} : {};
      this._trigger('shapeChange', {}, ui);
    },
    /**
     * Handler for setting the UI for the first point in a shape. For example,
     * the first point of a LineString geometry shape will change if the shape
     * can be converted into a Polygon.
     *
     * @name $.ui.simplicityMapShapeCreator._setFirstPointUi
     * @function
     * @private
     */
    _setFirstPointUi: function () {
      this._setMarkerStyle(0, this._geoJson.placemarks.type === 'LineString' ? 'firstVertex' : 'vertex');
    },
    /**
     * Restores the first point UI to a generic point.
     *
     * @name $.ui.simplicityMapShapeCreator._clearFirstPointUi
     * @function
     * @private
     */
    _clearFirstPointUi: function () {
      if (this._points.length > 1) {
        this._setMarkerStyle(0, 'vertex');
      }
    },
    /**
     * Handles map click events in which new vertices are created and applied to the current shape.
     *
     * @name $.ui.simplicityMapShapeCreator._mapClickHandler
     * @function
     * @private
     */
    _mapClickHandler: function (evt) {
      if (this.options.editMode) {
        var latLng = this._getLatLngFromEvent(evt);
        if (this._newPoint(latLng) !== null) {
          this._changeHandler();
        }
      }
    },
    /**
     * Handler for the click event on the first marker. For example, clicking
     * on the first marker of a LineString with more than 2 points may convert
     * the LineString into a Polygon.
     *
     * @name $.ui.simplicityMapShapeCreator._firstMarkerClickHandler
     * @function
     * @private
     */
    _firstMarkerClickHandler: function (evt) {
      if (this._geoJson.placemarks.type === 'LineString') {
        this._createPolygon();
        this._setFirstPointUi();
        this._changeHandler();
      }
    },
    /**
     * Handler for dealing with position changes of a dragged marker.
     *
     * @name $.ui.simplicityMapShapeCreator._markerMoveHandler
     * @function
     * @private
     */
    _markerMoveHandler: function (idx, marker) {
      return function (evt) {
        var latLng = this._getDragPosition(marker, evt);
        this._coordsSetAt(idx, latLng);
        if (!this.options.dragOptimization && this._geoJson.placemarks.type === 'LineString') {
          this._setPolylinePath(this._updateBufferedShape(idx));
        }
      };
    },
    /**
     * Handler for managing the event when the user stops dragging a marker.
     * 
     * @name $.ui.simplicityMapShapeCreator._markerDragEndHandler
     * @function
     * @private
     */
    _markerDragEndHandler: function (idx, marker) {
      return function (evt) {
        var coords;
        var latLng = this._getMarkerPosition(marker);
        var type = this._geoJson.placemarks.type;
        var geoJsonLatLng = this._asGeoJsonLatLng(latLng);
        if (type === 'Point') {
          this._geoJson.placemarks.coordinates = geoJsonLatLng;
        } else if (type === 'Polygon') {
          coords = this._geoJson.placemarks.coordinates[0];
          if (idx < coords.length) {
            coords[idx] = geoJsonLatLng;
            if (idx === 0) { // LinearRing!
              coords[coords.length - 1] = geoJsonLatLng;
            }
          }
        } else if (type === 'LineString' || type === 'MultiPoint') {
          if (this.options.dragOptimization && this._geoJson.placemarks.type === 'LineString') {
            this._setPolylinePath(this._getLineStringBufferPoints());
          }
          coords = this._geoJson.placemarks.coordinates;
          if (idx < coords.length) {
            coords[idx] = geoJsonLatLng;
          }
        }
        delete this._geoJson.properties.geocoder;
        this._changeHandler();
      };
    },
    /**
     * Converts [lat, lng] into [lng, lat] with precision reduction.
     *
     * @name $.ui.simplicityMapShapeCreator._asGeoJsonLatLng
     * @function
     * @private
     * @param {[lat, lng]} alatLng Array of latitude and longitude
     */
    _asGeoJsonLatLng: function (alatLng) {
      var latLng = this._latLngAsArray(alatLng);
      return [Math.round(latLng[1] * this._precision) / this._precision, Math.round(latLng[0] * this._precision) / this._precision];
    },
    /**
     * Generic method for creating a new marker point
     *
     * @name $.ui.simplicityMapShapeCreator._newPoint
     * @function
     * @private
     * @param {LatLng} latLng Mapping provider object representing a point of its Marker implementation.
     * @returns {Marker} Mapping provider implementation of the created Marker instance.
     */
    _newPoint: function (latLng) {
      var marker = null;
      if (this._geoJson.placemarks.type !== 'Polygon') {
        var idx = this._points.length;
        marker = this._newMarkerHandler(latLng, idx);
        this._points.push(marker);
        if (this._points.length === 1) {
          this._addMarkerClickListener(0, this._firstMarkerClickHandler);
        } else if (this._points.length === 2) {
          if (this.options.connected) {
            this._createLineString();
          }
        } else if (this._points.length === 3) {
          this._setFirstPointUi();
        }
        this._applyShapeBuffer();
      }
      return marker;
    },
    /**
     * Generic handler for configuring a new marker
     *
     * @name $.ui.simplicityMapShapeCreator._newMarkerHandler
     * @function
     * @private
     * @param {LatLng} latLng Mapping provider object representing a point of its Marker implementation.
     * @param {integer} idx zero-based index of the marker.
     * @returns {Marker} Mapping provider implementation of the created Marker instance.
     */
    _newMarkerHandler: function (latLng, idx) {
      this._coordsPush(latLng);
      var marker = this._addMarker(idx, latLng);
      if (this.options.draggableMarkers) {
        this._addMarkerMoveListener(idx, marker, this._markerMoveHandler(idx, marker));
        this._addMarkerDragEndListener(idx, marker, this._markerDragEndHandler(idx, marker));
      }
      var geoJsonLatLng = this._asGeoJsonLatLng(latLng);
      if (this._geoJson.placemarks.type === 'Point') {
        if (this._geoJson.placemarks.coordinates.length === 0) {
          this._geoJson.placemarks.coordinates = geoJsonLatLng;
        } else {
          var pointCoords = this._geoJson.placemarks.coordinates;
          this._geoJson.placemarks.coordinates = [pointCoords, geoJsonLatLng];
        }
      } else {
        this._geoJson.placemarks.coordinates.push(geoJsonLatLng);
      }
      return marker;
    },
    /**
     * Creates a map provider implementaion of a LineString using the existing coordinates
     * from the created Markers.
     *
     * @name $.ui.simplicityMapShapeCreator._createLineString
     * @function
     * @private
     * @returns {LineString} Map provider implementation of the created LineString instance.
     */
    _createLineString: function () {
      var shape = this._addLineString();
      this._geoJson.placemarks.type = 'LineString';
      delete this._geoJson.properties.geocoder;
      return shape;
    },
    /**
     * Creates a map provider implementaion of a Polygon from the created Markers.
     *
     * @name $.ui.simplicityMapShapeCreator._createPolygon
     * @function
     * @private
     * @returns {Polygon} Map provider implementation of the created Polygon instance.
     */
    _createPolygon: function () {
      this._removeShapeFromMap();
      var shape = this._addPolygon();
      this._geoJson.placemarks.type = 'Polygon';
      var coords = this._geoJson.placemarks.coordinates;
      // We only support one polygon in this version
      // its LinearRing will always be the first element
      coords.push(coords[0]);
      this._geoJson.placemarks.coordinates = [coords];
      this._geoJson.properties.radius = 0;
      delete this._geoJson.properties.geocoder;
      return shape;
    },
    /**
     * Visualizes a geoJson shape object onto a map
     * 
     * @name $.ui.simplicityMapShapeCreator._geoJsonToMap
     * @function
     * @private
     * @param {object} The geoJson shape to visualize.
     */
    _geoJsonToMap: function (geoJson) {
      try {
        this.options.radius = geoJson.properties.radius;
      } catch (e) {
        this.options.radius = 0;
      }
      var placemarks = geoJson.placemarks;
      var placemarkType = placemarks.type;
      var plCoords = placemarks.coordinates;
      var coords = [];
      if (placemarkType === 'Point') {
        coords.push(this._makeLatLng(plCoords[1], plCoords[0]));
      } else {
        var lastItemIdx;
        // We only support one polygon in this version
        // its LinearRing will always be the first element
        if (placemarkType === 'Polygon') {
          plCoords = plCoords[0];
          lastItemIdx = plCoords.length - 1;
        } else {
          lastItemIdx = plCoords.length;
        }
        var i;
        for (i = 0; i < lastItemIdx; i = i + 1) {
          coords.push(this._makeLatLng(plCoords[i][1], plCoords[i][0]));
        }
      }
      this._clear();
      var marker, idx, len = coords.length;
      for (idx = 0; idx < len; idx = idx + 1) {
        this._coordsPush(coords[idx]);
        marker = this._addMarker(idx, coords[idx]);
        if (this.options.draggableMarkers) {
          this._addMarkerMoveListener(idx, marker, this._markerMoveHandler(idx, marker));
          this._addMarkerDragEndListener(idx, marker, this._markerDragEndHandler(idx, marker));
        }
        this._points.push(marker);
      }
      if (placemarkType === 'Polygon') {
        this._addPolygon();
      } else if (placemarkType === 'LineString') {
        this._addLineString();
      } else if (placemarkType === 'MultiPoint') {
        this.options.connected = false;
      }
      this._applyShapeBuffer();
      if (this.options.editMode !== geoJson.properties.editMode) {
        this._setOption("editMode", geoJson.properties.editMode);
      }
    },
    /**
     * Calculates the buffered vertices of a point in a shape given the
     * heading frpm the previous and to the next point in the shape. These points form the
     * buffered two-dimensional shape of a one-dimension LineString.
     *
     * "out" refers to the point 90 degrees from the heading to the "next" point.
     * Also referred to as Outbound.
     * "back" refers to the point 270 degrees from the same heading, the opposite point.
     * Also referred to as Inbound.
     *
     * @name $.ui.simplicityMapShapeCreator._getBluntVertexData
     * @function
     * @private
     * @param {integer} idx The index of the point to buffer
     * @param {double} radius The radius to use when buffering
     * @returns {object} Convenience object to simplify recalculation of point positions
     * and buffering when the enclosing shape changes.
     * 
     * <code>
     *   {
     *     fromPrev: {
     *       out: [lat, lng],
     *       back: [lat, lng],
     *       heading: degrees
     *     },
     *     toNext: {
     *       out: [lat, lng],
     *       back: [lat, lng],
     *       heading: degrees
     *     }
     *   }
     * </code>
     */
    _getBluntVertexData: function (idx) {
      var vertex = this._coordsGetAsDArray(idx);
      return {
        vertex: vertex,
        fromPrev: idx > 0 ? this._makeVertexPart(idx - 1, vertex) : null,
        toNext: idx < this._coordsLength() - 1 ? this._makeVertexPart(idx + 1, vertex) : null
      };
    },
    _makeVertexPart: function (idx, vertex) {
      var p = this._coordsGetAsDArray(idx),
        h = $.simplicityGeoFn.computeHeading(vertex, p);
      return {
          out: $.simplicityGeoFn.travel(vertex, this._radiusMeters, h + 90),
          back: $.simplicityGeoFn.travel(vertex, this._radiusMeters, h - 90),
          heading: h
        };
    },
    /**
     * Creates an arc between two points such that the arc connects to opposing 
     * points such that the arc meets the buffered line string components at each
     * respective tangent.
     *
     * @name $.ui.simplicityMapShapeCreator._getArc
     * @function
     * @private
     * @param {double} angle The angle over which to create the arc.
     * @param {array} vertex The vertex around which to create the arc, expressed as [lat, lng]
     * @param {array} pFrom The point representing the arc tangent at which to begin the arc, expressed as [lat,lng]
     * @param {double} deg The number of degrees to use for each arc segment.
     * @returns {array} An array of points needed to complete the arch, where each point is expressed as [lat, lng]
     */
    _getArc: function (angle, vertex, pFrom, radius, deg) {
      var heading = $.simplicityGeoFn.computeHeading(vertex, pFrom),
        arc = [],
        segmentsToAdd = Math.abs(angle / deg),
        dir = angle < 0 ? -1 : 1;

      for (var i = 1; i < segmentsToAdd; i += 1) {
        var apex = $.simplicityGeoFn.travel(vertex, radius, heading - deg * dir * i);
        arc.push(apex);
      }
      return arc;
    },
    /**
     * Buffers a line string the radius in play. The LineString will be buffered into a Polygon
     * in which the end points and connecting vertices will be capped and shaped to represent the true
     * shape of the buffered LineString.
     *
     * The shape coordinates are built in two arrays, the "outbound" (out) and the "inbound" (back).
     *
     * Each "outbound" buffered points are calculated from the heading of the
     * vertex to the next vertex traveling <code>radius</code> distance at 90 degrees from
     * that heading. The "outbound" shape includes the encap arc at the last vertex.
     *
     * Each "inbound" buffered points are calculated from the heading of the
     * vertex to the previous vertex traveling <code>radius</code> distance at -90 degrees from
     * that heading. The "inbound" shape includes the encap arc at the first vertex.
     *
     * For points between the first and the last (connector), the curve shape is either a point or an arc.
     * The curve shape is an arc for obtuse angles. For acute angles, it is the
     * intersection of two lines, one traveling with heading from the previous vertex to the connector, the
     * the other traveling from the next vertex back to the connector. Both of these lines originate
     * from their respective buffered points.
     *
     * The information used to create the buffer is stored in this._vertexData;
     *
     * @name $.ui.simplicityMapShapeCreator._getLineStringBufferPoints
     * @function
     * @private
     * @returns {array} An array of coordinates for the Polygon representing the buffered LineString.
     */
    _getLineStringBufferPoints: function () {
      var out = [], // array of buffered points heding out to end of the line string
        back = []; // array of buffered points heading back to the first point of the line string;
      this._vertexData = [];
      this._firstVertexEndCap(out, back);
      var idx, max = this._coordsLength() - 1;
      for (idx = 1; idx < max; idx += 1) {
        this._midVertexCurves(idx, out, back);
      }
      this._lastVertexEndCap(max, out, back);
      return this._getBufferedShapeArray(out, back);
    },
    /**
     * Partner method to _getLineStringBufferPoints. This method updates the existing
     * buffered shape by only addresses vertices that are impacted when a single
     * vertex moves. When the firt and last vertices are moved, only their adjacent vertices
     * will also need to be updated. For any connecting vertex, the preceding and
     * subsequent vertices will need to be updated.
     * 
     * @name $.ui.simplicityMapShapeCreator._updateBufferedShape
     * @function
     * @private
     * @param {int} idx The index of the vertex that has moved
     * @returns {array} An array of coordinates for the Polygon representing the buffered LineString.
     */
    _updateBufferedShape: function (idx) {
      var last = this._vertexData.length - 1;
      var range,
      out = [], // array of buffered points heding out to end of the line string
      back = []; // array of buffered points heading back to the first point of the line string;
      if (idx === 0) {
        range = [0, 1];
      } else if (idx === last) {
        range = [idx - 1, idx];
      } else {
        range = [idx - 1, idx + 1];
      }
      var i, k = this._vertexData.length, vertex;
      for (i = 0; i < k; i += 1) {
        while (true) {
          if (i > range[0] && i < range[1] ||
              i > 0 && i === range[0] ||
              i < last && i === range[1]) {
            this._midVertexCurves(i, out, back);
            break;
          } else if (i === range[0]) { // First Vertex
            this._firstVertexEndCap(out, back);
            break;
          } else if (i === range[1]) { // Last Vertex
            this._lastVertexEndCap(i, out, back);
            break;
          }
          // Copy vertices not linked to the dragged vertex
          vertex = this._vertexData[i];
          if (i === 0) {
            out.push(vertex.toNext.out);
            back.push.apply(back, vertex.arc);
            back.push(vertex.toNext.back);
          } else if (i === last) {
            out.push(vertex.fromPrev.back);
            out.push.apply(out, vertex.arc);
            back.push(vertex.fromPrev.out);
          } else {
            if (vertex.angle < -3 || vertex.angle > 3) {
              // If we're within 3 degrees of straight
              var pushTo = vertex.angle < 0 ? [out, back] : [back, out];
              if (vertex.arc.length > 0) {
                pushTo[0].push.apply(pushTo[0], vertex.arc);
              } else {
                pushTo[0].push(vertex.fromPrev.back);
                pushTo[0].push(vertex.toNext.out);
              }
              if (vertex.intersect !== null) {
                pushTo[1].push(vertex.intersect);
              } else {
                pushTo[1].push(vertex.fromPrev.out);
                pushTo[1].push(vertex.toNext.back);
              }
            }
          }
          break;
        }
      }
      return this._getBufferedShapeArray(out, back);
    },
    /**
     * Helper method to _getLineStringBufferPoints and _updateBufferedShape. Manages
     * the creation of the endcap arc for the first vertex of the shape.
     * 
     * @name $.ui.simplicityMapShapeCreator._firstVertexEndCap
     * @function
     * @private
     * @param {Array} out The reference to the array of outbound points
     * @param {Array} back The reference to the array of inbound points
     */
    _firstVertexEndCap: function (out, back) {
      var vertex = this._vertexData[0] = this._getBluntVertexData(0);
      out.push(vertex.toNext.out);

      vertex.arc = this._getArc(-180, vertex.vertex, vertex.toNext.out, this._radiusMeters, this._capDegrees);
      back.push.apply(back, vertex.arc);
      back.push(vertex.toNext.back);
    },
    /**
     * Helper method to _getLineStringBufferPoints and _updateBufferedShape. Manages
     * the creation of the endcap arc for the last vertex of the shape.
     * 
     * @name $.ui.simplicityMapShapeCreator._lastVertexEndCap
     * @function
     * @private
     * @param {int} idx The index of the last vertex
     * @param {Array} out The reference to the array of outbound points
     * @param {Array} back The reference to the array of inbound points
     */
    _lastVertexEndCap: function (idx, out, back) {
      var vertex = this._vertexData[idx] = this._getBluntVertexData(idx);
      out.push(vertex.fromPrev.back);
      vertex.arc = this._getArc(180, vertex.vertex, vertex.fromPrev.back, this._radiusMeters, this._capDegrees);
      out.push.apply(out, vertex.arc);
      back.push(vertex.fromPrev.out);
    },
    /**
     * Helper method to _getLineStringBufferPoints and _updateBufferedShape. Manages
     * the creation of the endcap arc for the last vertex of the shape.
     * 
     * @name $.ui.simplicityMapShapeCreator._midVertexCurves
     * @function
     * @private
     * @param {int} idx The index of the connector vertex
     * @param {Array} out The reference to the array of outbound points
     * @param {Array} back The reference to the array of inbound points
     */
    _midVertexCurves: function (i, out, back) {
      var pX, pFrom;
      var vertex = this._vertexData[i] = this._getBluntVertexData(i);
      vertex.arc = pX = null;

      pFrom = this._vertexData[i - 1];
      angle = vertex.toNext.heading - pFrom.toNext.heading;
      angle -= angle > 180 ? 360 : 0;
      angle += angle < -180 ? 360 : 0;
      vertex.angle = angle;
      if (angle < -3 || angle > 3) {
        // If we're within 3 degrees of straight, we want to show the curve(s)
        if (angle < 0) {
          vertex.arc = this._getArc(-angle, vertex.vertex, vertex.fromPrev.back, this._radiusMeters, this._jointDegrees);
          if (vertex.arc.length > 0) {
            out.push.apply(out, vertex.arc);
          } else {
            out.push(vertex.fromPrev.back);
            out.push(vertex.toNext.out);
          }
          pX = vertex.intersect = $.simplicityGeoFn.intersection(
              pFrom.toNext.back, pFrom.toNext.heading,
              vertex.toNext.back, vertex.toNext.heading);
          if (pX !== null) {
            back.push(pX);
          } else {
            back.push(vertex.fromPrev.out);
            back.push(vertex.toNext.back);
          }
        } else {
          pX = vertex.intersect = $.simplicityGeoFn.intersection(
              pFrom.toNext.out, pFrom.toNext.heading,
              vertex.toNext.out, vertex.toNext.heading);
          if (pX !== null) {
            // Coalesce the two vertices into the intersection
            out.push(pX);
          } else {
            out.push(vertex.fromPrev.back);
            out.push(vertex.toNext.out);
          }
          vertex.arc = this._getArc(-angle, vertex.vertex, vertex.fromPrev.out, this._radiusMeters, this._jointDegrees);
          if (vertex.arc.length > 0) {
            back.push.apply(back, vertex.arc);
          } else {
            back.push(vertex.fromPrev.out);
            back.push(vertex.toNext.back);
          }
        }
      }
    },
    /**
     * Helper method to _getLineStringBufferPoints and _updateBufferedShape. Manages
     * the creation of the final array of points making up the buffered shape. This
     * array of points is in a state that can be used to create a polygon. It
     * represents a LinearRing.
     * 
     * @name $.ui.simplicityMapShapeCreator._getBufferedShapeArray
     * @function
     * @private
     * @param {Array} out The reference to the array of outbound points
     * @param {Array} back The reference to the array of inbound points
     */
    _getBufferedShapeArray: function (out, back) {
      // The back array is reversed since it was built at the same time
      // as the outbound array.
      out.push.apply(out, back.reverse());
      // Make the LinearRing
      out.push(out[0]);
      return this._newCoordsArray(out);
    },
    destroy: function () {
      this._removeMapClickListener();
      this._removeMarkerMoveListeners();
      this._removeMarkerDragEndListeners();
      this.options.editMode = false;
      this.reset(false);
      this._draw();
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
