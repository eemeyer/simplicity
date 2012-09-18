  /**
   * @name $.simplicityGoogleMarker
   * @namespace Contains factory methods and classes to create a custom Google OverlayView marker.
   */
(function ($) {
  var _initialized = false;
  $.simplicityGoogleMarker = {};
  /**
   * @private
   */
  $.simplicityGoogleMarker._markerTemplateCache = {};
  /**
   * A custom Google Maps Overlay View for a jQuery-based standard marker. This class must be
   * instantiated using the factory method $.simplicityGoogleMarker.create().
   *
   * @class $.simplicityGoogleMarker.OverlayMarker
   * @throws Error when not instantiated using $.simplicityGoogleMarker.create()
   * @extends google.maps.OverlayView
   * @param {jQuery} element jQuery element to use for the marker
   * @param {Dictionary} options
   * <dl>
   *   <dt>template</dt>
   *   <dd>
   *     The HTML for the marker. The template is converted to a jQuery object.
   *     Defaults to <pre>
   * &lt;div>
   *   &lt;div class="row"/>
   *   &lt;div class="ptr"/>
   *   &lt;div class="shadow"/>
   * &lt;/div></pre>
   *   </dd>
   *   <dt>html</dt>
   *   <dd>
   *     The html or text to add to the marker.
   *   </dd>
   *   <dt>title</dt>
   *   <dd>
   *     The value of the element's <code>title</code> attribute.
   *   </dd>
   *   <dt>className</dt>
   *   <dd>
   *     The class to add to the marker.
   *   </dd>
   *   <dt>position</dt>
   *   <dd>
   *     The position of the marker. Type of <code>google.maps.LatLng</code>. Use <code>anchor</code>
   *     to determine the placement of the marker in relation to the position.
   *   </dd>
   *   <dt>anchor</dt>
   *   <dd>
   *     The anchor of the marker. Type of <code>google.maps.Point</code>. Defaults to the bottom center
   *     of the marker.
   *   </dd>
   *   <dt>row</dt>
   *   <dd>
   *     The required row information used to configure the marker. Keys: index0, index1
   *   </dd>
   *   <dt>draggable</dt>
   *   <dd>
   *     Indicates that the marker is draggable. Defaults to <code>false</code>.
   *   </dd>
   * </dl>
   */
  $.simplicityGoogleMarker.OverlayMarker = function (options) {
    if (!_initialized) {
      throw new Error("Instances of simplicityGoogleMarker must be created using $.simplicityGoogleMarker.create.");
    }
    google.maps.OverlayView.call(this);
    this.options = options;
    var template = this.options.template ||
      '<div><div class="row"/><div class="ptr"/><div class="shadow"/></div>';
    this._element = $.simplicityGoogleMarker._markerTemplateCache[template];
    if ('undefined' === typeof this._element) {
      this._element = $(template);
      $.simplicityGoogleMarker._markerTemplateCache[template] = this._element;
    }
    this._element = this._element.clone();
    this._element.data({
      marker: this,
      row: this.options.row || {}
    });
    this._element.addClass('simplicity-google-marker');
    if (this.options.className) {
      this._element.addClass(this.options.className);
    }
    if (this.options.html) {
      this.html(this.options.html);
    }
    if (this.options.title) {
      this.title(this.options.title);
    }
    this._latLng = options.position;
    this._latLngPt = null;
    if (this.options.draggable) {
      this._element.draggable({
        stop: $.proxy(function (evt, ui) {
          this.setLatLngFromOffset(
            ui.position.left - ui.originalPosition.left, // dX
            ui.position.top - ui.originalPosition.top // dY
          );
        }, this)
      });
    }
  };
  $.simplicityGoogleMarker.setup = function () {
    if (!_initialized) {
      $.simplicityGoogleMarker.OverlayMarker.prototype = new google.maps.OverlayView();
      /**
       * Implementation of <code>google.maps.OverlayView.onAdd</code>
       *
       * @function
       * @private
       */
      $.simplicityGoogleMarker.OverlayMarker.prototype.onAdd = function () {
        this.getPanes().overlayMouseTarget.appendChild(this._element[0]);
      };
      /**
       * Implementation of <code>google.maps.OverlayView.onRemove</code>
       *
       * @function
       * @private
       */
      $.simplicityGoogleMarker.OverlayMarker.prototype.onRemove = function () {
        this._element.remove();
      };
      /**
       * Implementation of <code>google.maps.OverlayView.draw</code>
       *
       * @function
       * @private
       */
      $.simplicityGoogleMarker.OverlayMarker.prototype.draw = function () {
        if ('undefined' !== typeof this._latLng) { // it is possible to create a marker without a position
          this._latLngPt = this.getProjection().fromLatLngToDivPixel(this._latLng);
          var h = this._element.height();
         // default bottom center
          var a = this.options.anchor || new google.maps.Point(this._element.width() / 2, h);
          // $.draggable always uses relative positioning, so offset the y by the height of the element
          // and the elements created before it.
          var p = new google.maps.Point(
            this._latLngPt.x - a.x,
            this._latLngPt.y - a.y - (this.options.draggable ? this.options.row.index0 * h : 0));
          this._element.css({
            top:  p.y + 'px',
            left: p.x + 'px',
            'z-Index': -this.options.row.index1
          });
        }
      };
      /**
       * Calculates new latLng for a marker based on it's new position relative
       * to it's previous position and places the marker at that position
       *
       * @function
       * @param {double} dX Offset value for the X axis
       * @param {double} dY Offset value for the Y axis
       */
      $.simplicityGoogleMarker.OverlayMarker.prototype.setLatLngFromOffset = function (dX, dY) {
        this._latLngPt = new google.maps.Point(dX + this._latLngPt.x, dY + this._latLngPt.y);
        this._latLng = this.getProjection().fromDivPixelToLatLng(this._latLngPt);
      };
      /**
       * Returns the marker's current position
       *
       * @function
       * @returns {google.maps.LatLng} The position of the marker
       */
      $.simplicityGoogleMarker.OverlayMarker.prototype.getPosition = function () {
        return this._latLng;
      };
      /**
       * Sets the marker's current position
       *
       * @function
       * @param {google.maps.LatLng} latLng The new position of the marker
       */
      $.simplicityGoogleMarker.OverlayMarker.prototype.setPosition = function (latLng) {
        if ('undefined' !== typeof latLng) {
          this._latLng = latLng;
          this.draw();
        }
      };
      /**
       * Returns the marker's element
       *
       * @function
       * @returns {jQuery} The jQuery element used for the marker
       */
      $.simplicityGoogleMarker.OverlayMarker.prototype.getElement = function () {
        return this._element;
      };
      /**
       * Gets or sets the marker's title
       *
       * @function
       * @param {String} title The title to set
       */
      $.simplicityGoogleMarker.OverlayMarker.prototype.title = function (title) {
        if (arguments.length === 0) {
          return this._element.attr('title');
        }
        this._element.attr('title', title);
      };
      /**
       * Gets or sets the marker's HTML
       *
       * @function
       * @param {String} html The html or text to set
       */
      $.simplicityGoogleMarker.OverlayMarker.prototype.html = function (html) {
        if (arguments.length === 0) {
          return this._element.find(".row").html();
        }
        this._element.find(".row").html(html);
      };
      _initialized = true;
    }
  };
  /**
   * Factory Method to create a new $.simplicityGoogleMarker.OverlayMarker. The
   * parameters to the method are the same as for the constructor of
   * $.simplicityGoogleMarker.OverlayMarker.
   *
   * @name $.simplicityGoogleMarker.createOverlayMarker
   * @function
   * @returns {$.simplicityGoogleMarker.OverlayMarker}
   * @public
   */
  $.simplicityGoogleMarker.createOverlayMarker = function () {
    $.simplicityGoogleMarker.setup();
    return new $.simplicityGoogleMarker.OverlayMarker(arguments[0]);
  };
  /**
   * Factory Method to create a new google.maps.Marker. The
   * parameters to the method are the same as for the constructor of
   * google.maps.Marker.
   *
   * @name $.simplicityGoogleMarker.createMarker
   * @function
   * @returns {google.maps.Marker}
   * @public
   */
  $.simplicityGoogleMarker.createMarker = function () {
    return new google.maps.Marker(arguments[0]);
  };
}(jQuery));
