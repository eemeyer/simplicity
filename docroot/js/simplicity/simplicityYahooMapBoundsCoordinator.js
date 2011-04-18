/**
 * @name $.ui.simplicityYahooMapBoundsCoordinator
 * @namespace A Yahoo! map.
 * <p>
 * An invisible jquery ui widget which coordinates the updating of a Yahoo Map's bounds after a discovery search
 * response is parsed and dispatched (the simplicitySearchResponseHandled event from the simplicityDiscoverySearch
 * widget. Triggers a simplicityyahoomapboundscoordinatorcalculatebounds event which other components can use to
 * modify the map bounds.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityYahooMap();
 *   &lt;/script>
 *
 * @see Yahoo! Maps Web Services - AJAX API <a href="http://developer.yahoo.com/maps/ajax/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityYahooMapBoundsCoordinator", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The simplicityDiscoverySearch widget that this widget binds it's events to. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityYahooMapBoundsCoordinator.options
     */
    options : {
      searchElement: 'body',
      map: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-yahoo-map-bounds-coordinator');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityYahooMap('map'); // TODO: will this work if map API is not yet loaded?
      $(this.options.searchElement).bind('simplicitySearchResponseHandled', $.proxy(this._handler, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityYahooMapBoundsCoordinator.map
     * @function
     */
    map: function () {
      return this._map;
    },
    _handler: function (evt) {
      this.updateBounds();
    },
    /**
     * Triggers a simplicityyahoomapboundscoordinatorcalculatebounds event. Handlers for that event receive a ui
     * object with a locations member. They can update, replace or delete that variable. ui.locations is defined and non-empty
     * after the event is handled, then this component will update the Yahoo map to fit the locations.
     *
     * @name $.ui.simplicityYahooMapBoundsCoordinator.updateBounds
     * @function
     */
    updateBounds: function () {
      var ui = {
        locations: []
      };
      this._trigger('calculateBounds', {}, ui);
      if ($.isArray(ui.locations) && 0 !== ui.locations.length) {
        var bounds = this._map.getBestZoomAndCenter(ui.locations);
        this._map.drawZoomAndCenter(bounds.YGeoPoint, bounds.zoomLevel);
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-yahoo-map-bounds-coordinator');
      $(this.options.searchElement).unbind('simplicitySearchResponseHandled', this._handler);
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
