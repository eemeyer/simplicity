(function ($) {
  var simplicityGeoJsonToGoogleFactory = {
    newLocation: function (lonlat) {
      return new google.maps.LatLng(lonlat[1], lonlat[0]);
    },
    newPoint: function (lonlat) {
      var opts = {};
      opts.position = new google.maps.LatLng(lonlat[1], lonlat[0]);
      return  new google.maps.Marker(opts);
    },
    newLineString: function (lonlats) {
      var path = [];
      $.each(lonlats, function (idx, coord) {
        var ll = new google.maps.LatLng(coord[1], coord[0]);
        path.push(ll);
      });
      return new google.maps.Polyline({path: path});
    },
    newPolygon: function (shellLonLats) {
      var paths = [];
      $.each(shellLonLats, function (idx, coords) {
        var path = [];
        $.each(coords, function (idx2, coord) {
          var ll = new google.maps.LatLng(coord[1], coord[0]);
          path.push(ll);
        });
        paths.push(path);
      });
      return new google.maps.Polygon({paths: paths});
    }
  };

  $.simplicityGeoJsonToGoogle = function (geoJson, debug) {
    return $.simplicityGeoJsonToVendor(geoJson, simplicityGeoJsonToGoogleFactory, debug);
  };
}(jQuery));
