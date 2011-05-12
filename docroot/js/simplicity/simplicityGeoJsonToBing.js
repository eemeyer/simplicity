(function ($) {
  var shapeFactory = {
    newPoint: function (lonlat) {
      var location = new Microsoft.Maps.Location(lonlat[1], lonlat[0]);
      return new Microsoft.Maps.Pushpin(location);
    },
    newLineString: function (lonlats) {
      var path = [];
      $.each(lonlats, function (idx, coord) {
        var ll = new Microsoft.Maps.Location(coord[1], coord[0]);
        path.push(ll);
      });
      return new Microsoft.Maps.Polyline(path);
    },
    newPolygon: function (shellLonLats) {
      var paths = [];
      $.each(shellLonLats, function (idx, coords) {
        var path = [];
        $.each(coords, function (idx2, coord) {
          var ll = new Microsoft.Maps.Location(coord[1], coord[0]);
          path.push(ll);
        });
        paths.push(path);
      });
      var result = undefined;
      if (0 !== paths.length) {
        result = new Microsoft.Maps.Polygon(paths[0]);
      }
      return result;
    }
  };

  $.simplicityGeoJsonToBing = function (geoJson, debug) {
    return $.simplicityGeoJsonToVendor(geoJson, shapeFactory, debug);
  };
}(jQuery));
