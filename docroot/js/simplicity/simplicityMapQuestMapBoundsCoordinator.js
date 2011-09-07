/**
 * @name $.ui.simplicityMapQuestMapBoundsCoordinator
 * @namespace A MapQuest map
 * <p>
 * An invisible jquery ui widget which coordinates the updating of a MapQuest Map's bounds after a discovery search
 * response is parsed and dispatched (the simplicitySearchResponseHandled event from the simplicityDiscoverySearch
 * widget. Triggers a simplicitymapquestmapboundscoordinatorcalculatebounds event which other components can use to
 * modify the map bounds.
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
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
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

    destroy: function () {
      this.element.removeClass('ui-simplicity-mapquest-map-bounds-coordinator');
      $(this.options.searchElement).unbind('simplicitySearchResponseHandled', this._handler);
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
