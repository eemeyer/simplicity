/**
 * @name $.ui.simplicityBingMap
 * @namespace A Bing map.
 * <p>
 * Bing Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="position: absolute; width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityBingMap({
 *       credentials: 'Your credentials go here'
 *     });
 *   &lt;/script>
 *
 * @see Bing Maps AJAX Control v7 <a href="http://msdn.microsoft.com/en-us/library/gg427610.aspx">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityBingMap", {
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
     *   <dt>credentials</dt>
     *   <dd>
     *     Mandatory option that contains your Bing credentials.
     *   </dd>
     *   <dt>mapOptions</dt>
     *   <dd>
     *     Options used when creating the map. Defaults to <code>''</code> which is expanded at
     *     runtime to
     *     <pre>
     *     {
     *       center: new Microsoft.Maps.Location(0, 0),
     *       zoom: 1,
     *       mapTypeId: Microsoft.Maps.MapTypeId.road
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityBingMap.options
     */
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      credentials: '',
      mapOptions: '',
      // The following options are for internal use only
      mapVersion: '7.0'
    },
    _create : function () {
      this.element.addClass('ui-simplicity-bing-map');
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
    },
    /**
     * Lazy initialization method used to create the map only when the necessary JavaScript
     * is available. Intended to be called from any of this widgets public methods that need to
     * access the this._map.
     *
     * @name $.ui.simplicityBingMap._initWhenAvailable
     * @function
     * @private
     */
    _initWhenAvailable: function () {
      var available = false;
      if ('undefined' !== typeof this._map) {
        available = true;
      } else if ('undefined' !== typeof Microsoft && 'undefined' !== typeof Microsoft.Maps && 'undefined' !== typeof Microsoft.Maps.Map) {
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = {
            center: new Microsoft.Maps.Location(0, 0),
            zoom: 1,
            mapTypeId: Microsoft.Maps.MapTypeId.road
          };
        } else if ($.isFunction(this.options.mapOptions)) {
          mapOptions = this.options.mapOptions.call(this);
        } else {
          mapOptions = this.options.mapOptions;
        }
        this._map = new Microsoft.Maps.Map(this.element[0], $.extend({credentials: this.options.credentials}, mapOptions));
        available = true;
      }
      return available;
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityBingMap.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Try to dynamically load the necessary JavaScript from the upstream vendor that will
     * allow the map to function.
     *
     * @name $.ui.simplicityBingMap.loadMap
     * @function
     * @private
     */
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof Microsoft || 'undefined' === typeof Microsoft.Maps || 'undefined' === typeof Microsoft.Maps.Map) {
          var src = 'http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=' + this.options.mapVersion;
          if ('undefined' === typeof $.simplicityLoadJs) {
            alert('Dynamic loading of Bing maps is not supported. Enable this widget by adding the following script tag to your page:\n\n' +
              '<script charset="UTF-8" type="text/javascript" src="' + src + '"></script>');
          } else {
            $.simplicityLoadJs(src, $.proxy(function () {
              this.refreshMap();
            }, this));
          }
        }
      }
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityBingMap.refreshMap
     * @function
     */
    refreshMap: function () {
      this._resultSetHandler({}, $(this.options.searchElement).simplicityDiscoverySearch('resultSet'));
    },
    /**
     * Event handler for the <code>simplicityResultSet</code> event. Extracts the coordinates
     * of each result item by using the property fields defined by the
     * <code>latitudeField</code> and <code>longitudeField</code> options of this widget and
     * places a marker on the map for each valid coordinate. The map is then reset to best
     * display the current set of markers.
     *
     * @name $.ui.simplicityBingMap._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, resultSet) {
      if (this._initWhenAvailable()) {
        this._map.entities.clear();
        if (resultSet.rows.length > 0) {
          var locations = [];
          $.each(resultSet.rows, $.proxy(function (idx, row) {
            var properties = row.properties;
            if ('undefined' !== typeof properties) {
              var latitude = properties[this.options.latitudeField];
              var longitude = properties[this.options.longitudeField];
              if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
                var point = new Microsoft.Maps.Location(latitude, longitude);
                locations.push(point);
                var pin = new Microsoft.Maps.Pushpin(point);
                this._map.entities.push(pin);
              }
            }
          }, this));
          var bounds = Microsoft.Maps.LocationRect.fromLocations(locations);
          this._map.setView({bounds: bounds});
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-bing-map');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
