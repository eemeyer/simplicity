/**
 * @name $.ui.simplicityMapQuestMap
 * @namespace A MapQuest map
 */
(function ($) {
  $.widget("ui.simplicityMapQuestMap", {
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      apiKey: '',
      mapOptions: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-mapquest-map');
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
    },
    _initWhenAvailable: function () {
      var available = false;
      if ('undefined' !== typeof this._map) {
        available = true;
      } else if ('undefined' !== typeof MQA && 'undefined' !== typeof MQA.TileMap) {
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = {
            zoom: 1,
            center: {lat: 0, lng: 0},
            mapType: 'map'
          };
        } else {
          mapOptions = this.options.mapOptions.call(this);
        }
        this._map = new MQA.TileMap(this.element[0],
          this.options.zoom, this.options.center, this.options.mapType);
        available = true;
      }
      return available;
    },
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof MQA || 'undefined' === typeof MQA.TileMap) {
          if ('undefined' === typeof $.simplicityLoadJs) {
            alert('Dynamic loading of MapQuest maps is not supported. Enable this widget by adding the following script tag to your page:\n\n' +
              '<script src="http://mapquestapi.com/sdk/js/v6.0.0/mqa.toolkit.js?key=YOUR_KEY"></script>');
          } else {
            var src = 'http://mapquestapi.com/sdk/js/v6.0.0/mqa.toolkit.js';
            if (this.options.apiKey !== '') {
              src = src + '?key=' + this.options.apiKey;
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
        this._map.removeAllShapes();
        if (resultSet.rows.length > 0) {
          var bounds = MQA.RectLL();
          var minLat = null, maxLat = null, minLng = null, maxLng = null;
          $.each(resultSet.rows, $.proxy(function (idx, row) {
            var properties = row.properties;
            if ('undefined' !== typeof properties) {
              var latitude = properties[this.options.latitudeField];
              var longitude = properties[this.options.longitudeField];
              if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
                latitude = Number(latitude);
                longitude = Number(longitude);
                var poi = new MQA.Poi({lat: latitude, lng: longitude});
                this._map.addShape(poi);
                if (minLat === null || latitude < minLat) {
                  minLat = latitude;
                }
                if (maxLat === null || latitude > maxLat) {
                  maxLat = latitude;
                }
                if (minLng === null || longitude < minLng) {
                  minLng = longitude;
                }
                if (maxLng === null || longitude > maxLng) {
                  maxLng = longitude;
                }
              }
            }
          }, this));
          this._map.setZoomLevel(this._calculateZoomLevel(minLat, minLng, maxLat, maxLng));
          this._map.setCenter({lat: (maxLat + minLat) / 2, lng: (maxLng + minLng) / 2});
        }
      }
    },
    // Ported from: http://www.widgetsandburritos.com/technical/programming/mapquest-api/
    _calculateZoomLevel: function (minLat, minLng, maxLat, maxLng) {
      var mapWidth = this.element.width();
      var mapHeight = this.element.height();
      var mapScaleInPixels = 77;
      // This array contains the number of kilometers, the standard scale on mapquest contains at each zoom factor.
      var zoomRanges = [1840, 630, 210, 71, 32, 14, 7, 3.2, 1.6, 0.8, 0.4, 0.2, 0.1, 0.05, 0.03, 0.02];
      // This is an implementation of the Haversine Formula that calculates distance in Kilometers between
      //  (lat1, lon1) and (lat2, lon2).
      var calculate_distance_km = function (lat1, lon1, lat2, lon2) {
        return (3958 * 3.14159265 * Math.sqrt((lat2 - lat1) * (lat2 - lat1) +
          Math.cos(lat2 / 57.29578) * Math.cos(lat1 / 57.29578) * (lon2 - lon1) * (lon2 - lon1)) / 180);
      };
      // calculate the change in X and Y coordinates separately
      deltaX = calculate_distance_km(minLat, minLng, maxLat, minLng);
      deltaY = calculate_distance_km(minLat, minLng, minLat, maxLng);
      // calculate the best zoom factor on the X-axis
      var bestX;
      for (bestX = 0; bestX < zoomRanges.length; bestX += 1) {
        // calculate the width of the total map in kilometers
        totalWidthKm = mapWidth * zoomRanges[bestX] / mapScaleInPixels;
        if (totalWidthKm < deltaX) {
          break;
        }
      }
      // calculate the best zoom factor on the Y-axis
      var bestY;
      for (bestY = 0; bestY < zoomRanges.length; bestY += 1) {
        // calculate the height of the total map in kilometers
        totalHeightKm = mapHeight * zoomRanges[bestY] / mapScaleInPixels;
        if (totalHeightKm < deltaY) {
          break;
        }
      }
      // we want to take the minimum value, because we don’t want to zoom in too far.
      return Math.min(bestX, bestY);
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-mapquest-map');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
