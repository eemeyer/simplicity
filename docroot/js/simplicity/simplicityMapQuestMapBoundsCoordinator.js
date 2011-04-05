/**
 * @name $.ui.simplicityMapQuestMapBoundsCoordinator
 * @namespace A MapQuest map
 * <p>
 * MapQuest Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
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
  $.widget("ui.simplicityMapQuestMapBoundsCoordinator", {
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
     *       center: {lat: 0, lng: 0},
     *       zoom: 1,
     *       mapType: 'map'
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'moveend,zoomend'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityMapQuestMapBoundsCoordinator.options
     */
    options : {
      searchElement: 'body',
      map: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-mapquest-map-bounds-coordinator');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityMapQuestMap('map');
      $(this.options.searchElement).bind('simplicitySearchResponseHandled', $.proxy(this._handler, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityMapQuestMapBoundsCoordinator.map
     * @function
     */
    map: function () {
      return this._map;
    },
    _handler: function (evt) {
      this.updateBounds();
    },
    updateBounds: function () {
      var ui = {
        locations: []
      };
      this._trigger('calculateBounds', {}, ui);
      if ('undefined' !== typeof ui.locations && 0 !== ui.locations.length) {
        var bounds;
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

    destroy: function () {
      this.element.removeClass('ui-simplicity-mapquest-map-bounds-coordinator');
      $(this.options.searchElement).unbind('simplicitySearchResponseHandled', this._handler);
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
