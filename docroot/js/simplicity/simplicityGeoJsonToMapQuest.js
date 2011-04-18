(function ($) {
  var shapeFactory = {
    newPoint: function (lonlat) {
      var location = new MQA.LatLng(lonlat[1], lonlat[0]);
      return new MQA.Poi(location);
    },
    newLineString: function (lonlats) {
      var path = new MQA.LatLngCollection();
      $.each(lonlats, function (idx, coord) {
        var ll = new MQA.LatLng(coord[1], coord[0]);
        path.add(ll);
      });
      var vendorObj = undefined;
      if (path.getSize() !== 0) {
        vendorObj = new MQA.LineOverlay();
        vendorObj.setValue('shapePoints', path);f
      }
      return vendorObj;
    },
    newPolygon: function (shellLonLats) {
      var paths = [];
      $.each(shellLonLats, function (idx, coords) {
        var path = new MQA.LatLngCollection();
        $.each(coords, function (idx2, coord) {
          var ll = new MQA.LatLng(coord[1], coord[0]);
          path.add(ll);
        });
        paths.push(path);
      });
      var vendorObj = undefined;
      // TODO: does not support polygons with holes
      if (0 !== paths.length && 0 !== paths[0].getSize()) {
        vendorObj = new MQA.PolygonOverlay();
        vendorObj.setValue('shapePoints', paths[0]);
      }
      return vendorObj;
    }
  };

  $.simplicityGeoJsonToMapQuest = function (geoJson, debug) {
    return $.simplicityGeoJsonToVendor(geoJson, shapeFactory, debug);
  };

}(jQuery));
