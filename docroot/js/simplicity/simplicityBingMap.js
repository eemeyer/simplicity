/**
 * @name $.ui.simplicityBingMap
 * @namespace A Bing map
 */
(function ($) {
  $.widget("ui.simplicityBingMap", {
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      credentials: 'Your credentials go here',
      mapOptions: ''
    },
    _create : function () {
      this.element.addClass('ui-simplicity-bing-map');
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
    },
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
        } else {
          mapOptions = this.options.mapOptions.call(this);
        }
        this._map = new Microsoft.Maps.Map(this.element[0], $.extend({credentials: this.options.credentials}, mapOptions));
        available = true;
      }
      return available;
    },
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof Microsoft || 'undefined' === typeof Microsoft.Maps || 'undefined' === typeof Microsoft.Maps.Map) {
          if ('undefined' === typeof $.simplicityLoadJs) {
            alert('Dynamic loading of Bing maps is not supported. Enable this widget by adding the following script tag to your page:\n\n' +
              '<script charset="UTF-8" type="text/javascript" src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0"></script>');
          } else {
            var src = 'http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0';
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
