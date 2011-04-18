/**
 * @name $.ui.simplicityYahooMapBoundsCoordinator
 * @namespace A Yahoo! map.
 * <p>
 * Yahho! Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
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
     *   <dt>latitudeField</dt>
     *   <dd>
     *     Field to find the latitude of the result item in the <code>simplicityResultSet</code>
     *     item properties. Defaults to <code>'latitude'</code>.
     *   </dd>
     *   <dt>longitudeField</dt>
     *   <dd>
     *     Field to find the longitude of the result item in the <code>simplicityResultSet</code>
     *     item properties. Defaults to <code>'longitude'</code>.
     *   </dd>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>fitOnResultSet<dt>
     *   <dd>
     *     When true the map is panned and zoomed to best fit the search
     *     results that are added as part of the <code>simplicityResultSet</code>
     *     event handler. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>mapOptions</dt>
     *   <dd>
     *     Options used when creating the map. Defaults to <code>''</code> which is expanded at
     *     runtime to
     *     <pre>
     *     {
     *       center: new YGeoPoint(0, 0),
     *       zoom: 16,
     *       mapTypeId: YAHOO_MAP_REG
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'endPan,endAutoPan,changeZoom'</code>.
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
     * after the event is handled, then this component will update the bing map to fit the locations.
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
