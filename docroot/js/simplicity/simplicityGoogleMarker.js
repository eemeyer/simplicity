/**
 * A custom Google Maps Overlay View for a jQuery-based standard marker
 *
 * @class $.simplicityGoogleMarker
 * @extends google.maps.OverlayView
 * @param {jQuery} element jQuery element to use for the marker
 * @param {Dictionary} row simplicityGoogleMapResults ui.row data for the marker
 * @param {Dictionary} options Marker options
 * @property {jQuery} element The jQuery element to use as the marker.
 * @property {Dictionary} row simplicityGoogleMapResults ui.row data for the marker.
 * @property {Dictionary} options Marker options
 * <dl>
 *   <dt>position</dt>
 *   <dd>
 *     The latLng for the marker.
 *   </dd>
 *   <dt>anchor</dt>
 *   <dd>
 *     The anchor...to position the marker over the latLng point.
 *   </dd>
 *   <dt>draggable</dt>
 *   <dd>
 *     Indicates that the marker is draggble. Defaults to <code>false</code>.
 *   </dd>
 * </dl>
 */
(function ($) {
  $.simplicityGoogleMarker = function (element, row, options) {
    this.element = $(element);
    this.row = row;
    this.options = options;
    this.latLng = options.position;
    this.element.addClass('ui-simplicity-google-marker');
    if (this.options.draggable) {
      this.element.draggable({
        stop: $.proxy(function (evt, ui) {
          this.setLatLngFromOffset(
            ui.position.left - ui.originalPosition.left, // dX
            ui.position.top - ui.originalPosition.top // dY
          );
        }, this)
      });
    }
    /**
     * Required implementation of <code>google.maps.OverlayView.onAdd</code>
     *
     * @name $.simplicityGoogleMarker.onAdd
     * @public
     */
    this.onAdd = function () {
      this.getPanes().overlayMouseTarget.appendChild(this.element[0]);
    };
    /**
     * Required implementation of <code>google.maps.OverlayView.onRemove</code>
     *
     * @name $.simplicityGoogleMarker.onRemove
     * @public
     */
    this.onRemove = function () {
      this.element.remove();
    };
    /**
     * Required implementation of <code>google.maps.OverlayView.draw</code>
     *
     * @name $.simplicityGoogleMarker.draw
     * @public
     */
    this.draw = function () {
      if ('undefined' !== typeof this.latLng) {
        this.latLngPt = this.getProjection().fromLatLngToDivPixel(this.latLng);
        var h = this.element.height();
       // default bottom center
        var a = this.options.anchor || new google.maps.Point(this.element.width() / 2, h);
        var p = new google.maps.Point(this.latLngPt.x - a.x, this.latLngPt.y - a.y - (this.row.index0 * h));
        this.element.css({
          top:  p.y + 'px',
          left: p.x + 'px',
          'z-Index': -this.row.index1
        });
      }
    };
    /**
     * Calculates new latLng for a marker based on it's new position relative
     * to it's previous position
     *
     * @name $.simplicityGoogleMarker.setLatLngFromOffset
     * @function
     * @param {double} dX Offset value for the X axis
     * @param {double} dY Offset value for the Y axis
     * @public
     */
    this.setLatLngFromOffset = function (dX, dY) {
      this.latLngPt = new google.maps.Point(dX + this.latLngPt.x, dY + this.latLngPt.y);
      this.latLng = this.getProjection().fromDivPixelToLatLng(this.latLngPt);
    };
    /**
     * Returns the marker's current latLng position
     *
     * @name $.simplicityGoogleMarker.getPosition
     * @function
     * @returns {google.maps.LatLng} The latLng of the marker
     * @public
     */
    this.getPosition = function () {
      return this.latLng;
    };
    /**
     * Returns the marker's current latLng position
     *
     * @name $.simplicityGoogleMarker.setPosition
     * @function
     * @param {google.maps.LatLng} latLng The new latLng of the marker
     * @public
     */
    this.setPosition = function (latLng) {
      if ('undefined' !== typeof latLng) {
        this.latLng = latLng;
        this.draw();
      }
    };
    /**
     * Returns the marker's element
     *
     * @name $.simplicityGoogleMarker.getElement
     * @function
     * @returns {jQuery} The jQuery element used for the marker
     * @public
     */
    this.getElement = function () {
      return this.element;
    };
    /**
     * Returns the marker's title
     *
     * @name $.simplicityGoogleMarker.setTitle
     * @function
     * @param {String} s The title to set
     * @public
     */
    this.setTitle = function (s) {
      this.element.attr('title', s);
    };
  };
  $.simplicityGoogleMarker.prototype = new google.maps.OverlayView();
}(jQuery));
