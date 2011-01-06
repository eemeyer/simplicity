/**
 * @name $.ui.simplicityYahooMap
 * @namespace A Yahoo! map
 */
(function ($) {
  $.widget("ui.simplicityYahooMap", {
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      apiKey: '',
      mapVersion: '3.8',
      mapOptions: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-yahoo-map');
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
    },
    _initWhenAvailable: function () {
      var available = false;
      if ('undefined' !== typeof this._map) {
        available = true;
      } else if ('undefined' !== typeof YMap) {
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = {
            center: new YGeoPoint(0, 0),
            zoom: 16,
            mapType: YAHOO_MAP_REG
          };
        } else {
          mapOptions = this.options.mapOptions.call(this);
        }
        this._map = new YMap(this.element[0]);
        this._map.setMapType(mapOptions.mapType);
        this._map.drawZoomAndCenter(mapOptions.center, mapOptions.zoom);
        available = true;
      }
      return available;
    },
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof YMap) {
          if ('undefined' === typeof $.simplicityLoadJs) {
            alert('Dynamic loading of Yahoo! maps is not supported. Enable this widget by adding the following script tag to your page:\n\n' +
              '<script type="text/javascript" src="http://api.maps.yahoo.com/ajaxymap?v=3.8&appid=YOUR_APP_ID"></script>');
          } else {
            var src = 'http://api.maps.yahoo.com/ajaxymap?v=' + this.options.mapVersion;
            if (this.options.apiKey !== '') {
              src = src + '&appid=' + this.options.apiKey;
            }
            $.simplicityLoadJs(src, $.proxy(function () {
              this.refreshMap();
            }, this));
          }
        }
      }
    },
    refreshMap: function () {
      this._resultSetHandler({}, $(this.options.searchElement).simplicityDiscoverySearch('resultSet'));
    },
    _resultSetHandler: function (evt, resultSet) {
      if (this._initWhenAvailable()) {
        this._map.removeMarkersAll();
        if (resultSet.rows.length > 0) {
          var locations = [];
          $.each(resultSet.rows, $.proxy(function (idx, row) {
            var properties = row.properties;
            if ('undefined' !== typeof properties) {
              var latitude = properties[this.options.latitudeField];
              var longitude = properties[this.options.longitudeField];
              if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
                latitude = Number(latitude);
                longitude = Number(longitude);
                var point = new YGeoPoint(latitude, longitude);
                locations.push(point);
                var marker = new YMarker(point);
                this._map.addOverlay(marker);
              }
            }
          }, this));
          var bounds = this._map.getBestZoomAndCenter(locations);
          this._map.drawZoomAndCenter(bounds.YGeoPoint, bounds.zoomLevel);
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-yahoo-map');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
