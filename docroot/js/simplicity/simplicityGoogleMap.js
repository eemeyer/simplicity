/**
 * @name $.ui.simplicityGoogleMap
 * @namespace A Google map
 */
(function ($) {
  $.widget("ui.simplicityGoogleMap", {
    options: {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      apiKey: '',
      mapVersion: '3',
      mapParams: 'sensor=false',
      mapOptions: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-google-map');
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
    },
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
        } else {
          mapOptions = this.options.mapOptions.call(this);
        }
        this._map = new google.maps.Map(this.element[0], mapOptions);
        this._markers = [];
        available = true;
      }
      return available;
    },
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
    refreshMap: function () {
      this._resultSetHandler({}, $(this.options.searchElement).simplicityDiscoverySearch('resultSet'));
    },
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
