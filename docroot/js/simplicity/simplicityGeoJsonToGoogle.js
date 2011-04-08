(function ($) {
  // Based on  GeoJSON to Google Maps library (git://github.com/JasonSanford/GeoJSON-to-Google-Maps.git) commit abbd27
  $.simplicityGeoJsonToGoogle = function (geoJson, options, debug) {

    var geometryToVendorType = function (output, geoJsonGeometry, opts) {
      var vendorObjs = output.vendorObjects;
      switch (geoJsonGeometry.type) {
      case 'Point':
        (function () {
          opts.position = new google.maps.LatLng(geoJsonGeometry.coordinates[1], geoJsonGeometry.coordinates[0]);
          var vendorObj = new google.maps.Marker(opts);
          vendorObj.simplicityGeoJson = JSON.parse(JSON.stringify(output.geoJson));
          output.geoJson.simplicityVendorObject = vendorObj;
          vendorObjs.push(vendorObj);
        }());
        break;
      case 'MultiPoint':
        $.each(geoJsonGeometry.coordinates, function (idx, coord) {
          opts.position = new google.maps.LatLng(coord[1], coord[0]);
          var vendorObj = new google.maps.Marker(opts);
          vendorObj.simplicityGeoJson = JSON.parse(JSON.stringify(output.geoJson));
          output.geoJson.simplicityVendorObject = vendorObj;
          vendorObjs.push(vendorObj);
        });
        break;
      case 'LineString':
        (function () {
          var path = [];
          $.each(geoJsonGeometry.coordinates, function (idx, coord) {
            var ll = new google.maps.LatLng(coord[1], coord[0]);
            path.push(ll);
          });
          opts.path = path;
          var vendorObj = new google.maps.Polyline(opts);
          vendorObj.simplicityGeoJson = JSON.parse(JSON.stringify(output.geoJson));
          output.geoJson.simplicityVendorObject = vendorObj;
          vendorObjs.push(vendorObj);
        }());
        break;
      case 'MultiLineString':
        $.each(geoJsonGeometry.coordinates, function (idx, coords) {
          var path = [];
          $.each(coords, function (idx2, coord) {
            var ll = new google.maps.LatLng(coord[1], coord[0]);
            path.push(ll);
          });
          opts.path = path;
          var vendorObj = new google.maps.Polyline(opts);
          vendorObj.simplicityGeoJson = JSON.parse(JSON.stringify(output.geoJson));
          output.geoJson.simplicityVendorObject = vendorObj;
          vendorObjs.push(vendorObj);
        });
        break;
      case 'Polygon':
        (function () {
          var paths = [];
          $.each(geoJsonGeometry.coordinates, function (idx, coords) {
            var path = [];
            $.each(coords, function (idx2, coord) {
              var ll = new google.maps.LatLng(coord[1], coord[0]);
              path.push(ll);
            });
            paths.push(path);
          });
          opts.paths = paths;
          var vendorObj = new google.maps.Polygon(opts);
          vendorObj.simplicityGeoJson = JSON.parse(JSON.stringify(output.geoJson));
          output.geoJson.simplicityVendorObject = vendorObj;
          vendorObjs.push(vendorObj);
        }());
        break;
      case 'MultiPolygon':
        (function () {
          var paths = [];
          $.each(geoJsonGeometry.coordinates, function (idx, shape) {
            $.each(shape, function (idx2, coords) {
              var path = [];
              $.each(coords, function (idx3, coord) {
                var ll = new google.maps.LatLng(coord[1], coord[0]);
                path.push(ll);
              });
            });
            paths.push(path);
          });
          opts.paths = paths;
          var vendorObj = new google.maps.Polygon(opts);
          vendorObj.simplicityGeoJson = JSON.parse(JSON.stringify(output.geoJson));
          output.geoJson.simplicityVendorObject = vendorObj;
          vendorObjs.push(vendorObj);
        }());
        break;
      default:
        _error('Invalid GeoJSON object: Geometry object must be one of Point, LineString, Polygon or MultiPolygon.');
      }
    };

    var _error = function (message) {
      if (debug) {
        cosole.warn(message);
      }
    };

    var result = {
        vendorObjects: [],
        geoJson: JSON.parse(JSON.stringify(geoJson))
    };

    var opts = options || {};
    switch (geoJson.type) {
    case 'FeatureCollection':
      if (!geoJson.features) {
        _error('Invalid GeoJSON object: FeatureCollection object missing "features" member.');
        result.geoJson = {};
      } else {
        $.each(geoJson.features, function (idx, feature) {
          var output = {
              vendorObjects: result.vendorObjects,
              geoJson: feature
          };
          geometryToVendorType(output, feature.geometry, opts);
          result.geoJson.features[idx] = output.geoJson;
        });
      }
      break;
    case 'GeometryCollection':
      if (!geoJson.geometries) {
        _error('Invalid GeoJSON object: GeometryCollection object missing "geometries" member.');
        result.geoJson = {};
      } else {
        $.each(geoJson.geometries, function (idx, geom) {
          var output = {
              vendorObjects: result.vendorObjects,
              geoJson: geom
          };
          geometryToVendorType(output, geom, opts);
        });
      }
      break;
    case 'Feature':
      if (!(geoJson.properties && geoJson.geometry)) {
        _error('Invalid GeoJSON object: Feature object missing "properties" or "geometry" member.');
        result.geoJson = {};
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
        result.geoJson = {};
      }
      break;
    default:
      _error('Invalid GeoJSON object: GeoJSON object must be one of Point, LineString, Polygon, MultiPolygon, Feature, FeatureCollection or GeometryCollection.');
      result.geoJson = {};
    }
    return result;
  };
}(jQuery));
