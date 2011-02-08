/**
 * @name $.ui.simplicityGoogleMap
 * @namespace A Google map.
 * <p>
 * Google Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMap();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="http://code.google.com/apis/maps/documentation/javascript/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMap", {
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
     *   <dt>mapOptions</dt>
     *   <dd>
     *     Options used when creating the map. Defaults to <code>''</code> which is expanded at
     *     runtime to
     *     <pre>
     *     {
     *       center: new google.maps.LatLng(0,0),
     *       zoom: 1,
     *       mapTypeId: google.maps.MapTypeId.ROADMAP
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleMap.options
     */
    options: {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      mapOptions: '',
      // The following options are for internal use only
      apiKey: '',
      mapVersion: '3',
      mapParams: 'sensor=false'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-google-map');
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
    },
    /**
     * Lazy initialization method used to create the map only when the necessary JavaScript
     * is available. Intended to be called from any of this widgets public methods that need to
     * access the this._map.
     *
     * @name $.ui.simplicityGoogleMap._initWhenAvailable
     * @function
     * @private
     */
    _initWhenAvailable: function () {
      var available = false;
      if ('undefined' !== typeof this._map) {
        available = true;
      } else if ('undefined' !== typeof google && 'undefined' !== typeof google.maps) {
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = {
            center: new google.maps.LatLng(0, 0),
            zoom: 1,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
        } else if ($.isFunction(this.options.mapOptions)) {
          mapOptions = this.options.mapOptions.call(this);
        } else {
          mapOptions = this.options.mapOptions;
        }
        this._map = new google.maps.Map(this.element[0], mapOptions);
        this._markers = [];
        available = true;
      }
      return available;
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityGoogleMap.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Try to dynamically load the necessary JavaScript from the upstream vendor that will
     * allow the map to function.
     *
     * @name $.ui.simplicityGoogleMap.loadMap
     * @function
     * @private
     */
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof google || 'undefined' === typeof google.load) {
          // The Google JS loader is missing, get it
          var callbackName = 'simplicityGoogleMapGoogleLoaderCallback';
          window[callbackName] = $.proxy(this.loadMap, this);
          var src = 'http://www.google.com/jsapi?callback=' + callbackName;
          if (this.options.apiKey !== '') {
            src = src + '&key=' + this.options.apiKey;
          }
          $('head').append($('<script type="text/javascript" src="' + src + '"></script>'));
        } else {
          // The Google JS loader is available, use it to load the maps API
          google.load('maps', this.options.mapVersion, {
            other_params: this.options.mapParams,
            callback: $.proxy(this.refreshMap, this)
          });
        }
      }
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityGoogleMap.refreshMap
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
     * @name $.ui.simplicityGoogleMap._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, resultSet) {
      if (this._initWhenAvailable()) {
        $.each(this._markers, function (idx, marker) {
          marker.setMap(null);
        });
        this._markers.length = 0;
        if (resultSet.rows.length > 0) {
          var bounds = new google.maps.LatLngBounds();
          $.each(resultSet.rows, $.proxy(function (idx, row) {
            var properties = row.properties;
            if ('undefined' !== typeof properties) {
              var latitude = properties[this.options.latitudeField];
              var longitude = properties[this.options.longitudeField];
              if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
                var point = new google.maps.LatLng(latitude, longitude);
                this._markers.push(new google.maps.Marker({
                  position: point,
                  map: this._map
                }));
                bounds.extend(point);
              }
            }
          }, this));
          this._map.fitBounds(bounds);
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-google-map');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
