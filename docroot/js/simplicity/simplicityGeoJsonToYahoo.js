(function ($) {
  var shapeFactory = {
    newPoint: function (lonlat) {
      var location = new YGeoPoint(lonlat[1], lonlat[0]);
      return new YMarker(location);
    },
    newLineString: function (lonlats) {
      var path = [];
      $.each(lonlats, function (idx, coord) {
        var ll = new YGeoPoint(coord[1], coord[0]);
        path.push(ll);
      });
      return new YPolyline(path);
    },
    newPolygon: function (shellLonLats) {
      var paths = [];
      $.each(shellLonLats, function (idx, coords) {
        var path = [];
        $.each(coords, function (idx2, coord) {
          var ll = new YGeoPoint(coord[1], coord[0]);
          path.push(ll);
        });
        paths.push(path);
      });
      var result = undefined;
      if (0 !== paths.length) {
        result = new YPolyline(paths[0]);
      }
      return result;
    }
  };

  $.simplicityGeoJsonToYahoo = function (geoJson, debug) {
    return $.simplicityGeoJsonToVendor(geoJson, shapeFactory, debug);
  };
}(jQuery));
