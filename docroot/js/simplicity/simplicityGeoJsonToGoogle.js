(function ($) {
  // Based on  GeoJSON to Google Maps library (git://github.com/JasonSanford/GeoJSON-to-Google-Maps.git) commit abbd27
  $.simplicityGeoJsonToGoogle = function (geoJson, debug) {

    var geometryToVendorType = function (output, geoJsonGeometry) {
      var vendorObjs = output.vendorObjects;
      switch (geoJsonGeometry.type) {
      case 'Point':
        (function () {
          var cleanGeoJson = $.extend(true, {}, output.geoJson);
          var opts = {};
          opts.position = new google.maps.LatLng(geoJsonGeometry.coordinates[1], geoJsonGeometry.coordinates[0]);
          var vendorObj = new google.maps.Marker(opts);
          vendorObj.simplicityGeoJson = cleanGeoJson;
          output.geoJson.simplicityVendorObjects = [vendorObj];
          vendorObjs.push(vendorObj);
        }());
        break;
      case 'MultiPoint':
        (function () {
          var cleanGeoJson = $.extend(true, {}, output.geoJson);
          output.geoJson.simplicityVendorObjects = [];
          $.each(geoJsonGeometry.coordinates, function (idx, coord) {
            var opts = {};
            opts.position = new google.maps.LatLng(coord[1], coord[0]);
            var vendorObj = new google.maps.Marker(opts);
            vendorObj.simplicityGeoJson = cleanGeoJson;
            output.geoJson.simplicityVendorObjects.push(vendorObj);
            vendorObjs.push(vendorObj);
          });
        }());
        break;
      case 'LineString':
        (function () {
          var cleanGeoJson = $.extend(true, {}, output.geoJson);
          output.geoJson.simplicityVendorObjects = [];
          var path = [];
          $.each(geoJsonGeometry.coordinates, function (idx, coord) {
            var ll = new google.maps.LatLng(coord[1], coord[0]);
            path.push(ll);
          });
          var opts = {};
          opts.path = path;
          var vendorObj = new google.maps.Polyline(opts);
          vendorObj.simplicityGeoJson = cleanGeoJson;
          output.geoJson.simplicityVendorObjects.push(vendorObj);
          vendorObjs.push(vendorObj);
        }());
        break;
      case 'MultiLineString':
        var cleanGeoJson = $.extend(true, {}, output.geoJson);
        output.geoJson.simplicityVendorObjects = [];
        $.each(geoJsonGeometry.coordinates, function (idx, coords) {
          var path = [];
          $.each(coords, function (idx2, coord) {
            var ll = new google.maps.LatLng(coord[1], coord[0]);
            path.push(ll);
          });
          var opts = {};
          opts.path = path;
          var vendorObj = new google.maps.Polyline(opts);
          vendorObj.simplicityGeoJson = cleanGeoJson;
          output.geoJson.simplicityVendorObjects.push(vendorObj);
          vendorObjs.push(vendorObj);
        });
        break;
      case 'Polygon':
        (function () {
          var cleanGeoJson = $.extend(true, {}, output.geoJson);
          output.geoJson.simplicityVendorObjects = [];
          var paths = [];
          $.each(geoJsonGeometry.coordinates, function (idx, coords) {
            var path = [];
            $.each(coords, function (idx2, coord) {
              var ll = new google.maps.LatLng(coord[1], coord[0]);
              path.push(ll);
            });
            paths.push(path);
          });
          var opts = {};
          opts.paths = paths;
          var vendorObj = new google.maps.Polygon(opts);
          vendorObj.simplicityGeoJson = cleanGeoJson;
          output.geoJson.simplicityVendorObjects.push(vendorObj);
          vendorObjs.push(vendorObj);
        }());
        break;
      case 'MultiPolygon':
        (function () {
          var cleanGeoJson = $.extend(true, {}, output.geoJson);
          output.geoJson.simplicityVendorObjects = [];
          $.each(geoJsonGeometry.coordinates, function (idx, shape) {
            var paths = [];
            $.each(shape, function (idx2, coords) {
              var path = [];
              $.each(coords, function (idx3, coord) {
                var ll = new google.maps.LatLng(coord[1], coord[0]);
                path.push(ll);
              });
              paths.push(path);
            });
            var opts = {};
            opts.paths = paths;
            var vendorObj = new google.maps.Polygon(opts);
            vendorObj.simplicityGeoJson = cleanGeoJson;
            output.geoJson.simplicityVendorObjects.push(vendorObj);
            vendorObjs.push(vendorObj);
          });
        }());
        break;
      default:
        _error('Invalid GeoJSON object: Geometry object must be one of Point, LineString, Polygon or MultiPolygon.');
      }
    };

    var _error = function (message) {
      if (debug) {
        console.warn(message);
      }
    };

    var result = {
      vendorObjects: [],
      geoJson: JSON.parse(JSON.stringify(geoJson))
    };

    var opts = {};
    switch (geoJson.type) {
    case 'FeatureCollection':
      if (!geoJson.features) {
        _error('Invalid GeoJSON object: FeatureCollection object missing "features" member.');
        result.geoJson.simplicityVendorObjects = [];
      } else {
        $.each(geoJson.features, function (idx, feature) {
          var output = {
            vendorObjects: result.vendorObjects,
            geoJson: feature
          };
          geometryToVendorType(output, feature.geometry, opts);
          result.geoJson.features[idx] = output.geoJson;
        });
        result.geoJson.simplicityVendorObjects = $.merge([], result.vendorObjects);
      }
      break;
    case 'GeometryCollection':
      if (!geoJson.geometries) {
        _error('Invalid GeoJSON object: GeometryCollection object missing "geometries" member.');
        result.geoJson.simplicityVendorObjects = [];
      } else {
        $.each(geoJson.geometries, function (idx, geom) {
          var output = {
            vendorObjects: result.vendorObjects,
            geoJson: geom
          };
          geometryToVendorType(output, geom, opts);
          result.geoJson.geometries[idx] = output.geoJson;
        });
        result.geoJson.simplicityVendorObjects = $.merge([], result.vendorObjects);
      }
      break;
    case 'Feature':
      if (!(geoJson.properties && geoJson.geometry)) {
        _error('Invalid GeoJSON object: Feature object missing "properties" or "geometry" member.');
        result.geoJson.simplicityVendorObjects = [];
      } else {
        geometryToVendorType(result, geoJson.geometry, opts);
      }
      break;
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      if (geoJson.coordinates) {
        geometryToVendorType(result, geoJson, opts);
      } else {
        _error('Invalid GeoJSON object: Geometry object missing "coordinates" member.');
        result.geoJson.simplicityVendorObjects = [];
      }
      break;
    default:
      _error('Invalid GeoJSON object: GeoJSON object must be one of Point, LineString, Polygon, MultiPolygon, Feature, FeatureCollection or GeometryCollection.');
      result.geoJson.simplicityVendorObjects = [];
    }
    return result;
  };
}(jQuery));
