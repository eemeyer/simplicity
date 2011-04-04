/**
 * @name $.ui.simplicityBingMapCriteria
 * @namespace A Bing map.
 * <p>
 * Bing Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="position: absolute; width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityBingMapCriteria({
 *       credentials: 'Your credentials go here'
 *     });
 *   &lt;/script>
 *
 * @see Bing Maps AJAX Control v7 <a href="http://msdn.microsoft.com/en-us/library/gg427610.aspx">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityBingMapCriteria", {
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
     *     Optional map instance, if not provided one will be looked up. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>updateBounds</dt>
     *   <dd>
     *     Whether or not the map bounds should be updated to include the criteria locations. Defaults to true.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityBingMapCriteria.options
     */
    options: {
      searchElement: 'body',
      updateBounds: true,
      map: ''
    },
    _create : function () {
      this.element.addClass('ui-simplicity-bing-map-criteria');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityBingMap('map');
      this._markers = [];
      $(this.options.searchElement).bind('simplicitySearchResponse', $.proxy(this._responseHandler, this));
      this.element.bind('simplicitybingmapboundscoordinatorcalculatebounds', $.proxy(this._calcBoundsHandler, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityBingMapCriteria.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityBingMapCriteria.refreshMap
     * @function
     */
    refreshMap: function () {
      this.removeCriteria();
      this.addCriteria();
    },
    /**
     * Event handler for the <code>simplicitySearchResponse</code> event.
     * Extracts the placemarks for all of the criteria locations, and places markers or shapes on the map for each.
     *
     * @name $.ui.simplicityBingMapCriteria._responseHandler
     * @function
     * @private
     */
    _responseHandler: function (evt, ui) {
      this.removeCriteria();
      this.addCriteria(ui);
    },
    _calcBoundsHandler: function (evt, ui) {
      var locations = ui.locations;
      if ($.isArray(locations) && this.options.updateBounds) {
        $.each(this._markers, function (pmIdx, poly) {
          if ($.isFunction(poly.getLocations)) {
            $.merge(locations, poly.getLocations());
          } else if ($.isFunction(poly.getLocation)) {
            locations.push(poly.getLocation());
          }
        });
      }
    },
    /**
     * Removes any markers or shapes that were added to the map by <code>addCriteria</code>.
     *
     * @name $.ui.simplicityBingMapCriteria.removeCriteria
     * @function
     * @private
     */
    removeCriteria: function () {
      $.each(this._markers, $.proxy(function (idx, marker) {
        this._map.entities.remove(marker);
      }, this));
      this._markers.length = 0;
    },
    /**
     * Adds any markers and shapes that can be extracted from the given <code>searchResponse</code>.
     *
     * @name $.ui.simplicityBingMapCriteria.addCriteria
     * @function
     * @private
     */
    addCriteria: function (ui) {
      if ('undefined' === typeof ui) {
        ui = $(this.options.searchElement).simplicityDiscoverySearch('searchResponse');
      }
      if ($.isArray(ui._discovery.response.explanation)) {
        $.each(ui._discovery.response.explanation, $.proxy(function (idx, exp) {
          if (exp.criterionValue && $.isArray(exp.criterionValue.placemarks)) {
            $.each(exp.criterionValue.placemarks, $.proxy(function (idx, pm) {
              var markers = $.simplicityGeoJsonToBing(pm);
              if (markers.length !== 0 && markers[0].type !== 'Error') {
                var markerEvent = {
                  map: this._map,
                  markers: markers,
                  geoJson: pm
                };
                this._trigger('placemark', {}, markerEvent);
                markers = markerEvent.markers;
                if ('undefined' !== typeof markers) {
                  $.each(markers, $.proxy(function (idx, marker) {
                    this._markers.push(marker);
                    this._map.entities.push(marker);
                  }, this));
                }
              }
            }, this));
          }
        }, this));
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-bing-map-criteria');
      $(this.options.searchElement).unbind('simplicitySearchResponse', this._responseHandler);
      this.element.unbind('simplicitybingmapboundscoordinatorcalculatebounds', this._calcBoundsHandler);
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
