(function ($) {
  // Based on  GeoJSON to Google Maps library (git://github.com/JasonSanford/GeoJSON-to-Google-Maps.git) commit abbd27
  $.simplicityGeoJsonToYahoo = function (geojson) {

    var geometryToVendorType = function (geojsonGeometry) {
      var vendorObjs = [];
      switch (geojsonGeometry.type) {
      case 'Point':
        (function () {
          var location = new YGeoPoint(geojsonGeometry.coordinates[1], geojsonGeometry.coordinates[0]);
          vendorObjs.push(new YMarker(location));
        }());
        break;
      case 'MultiPoint':
        $.each(geojsonGeometry.coordinates, function (idx, coord) {
          var location =  new YGeoPoint(coord[1], coord[0]);
          vendorObjs.push(new YMarker(location));
        });
        break;
      case 'LineString':
        (function () {
          var path = [];
          $.each(geojsonGeometry.coordinates, function (idx, coord) {
            var ll = new YGeoPoint(coord[1], coord[0]);
            path.push(ll);
          });
          vendorObjs.push(new YPolyline(path));
        }());
        break;
      case 'MultiLineString':
        $.each(geojsonGeometry.coordinates, function (idx, coords) {
          var path = [];
          $.each(coords, function (idx2, coord) {
            var ll = new YGeoPoint(coord[1], coord[0]);
            path.push(ll);
          });
          vendorObjs.push(new YPolyline(path));
        });
        break;
      case 'Polygon':
        (function () {
          var paths = [];
          $.each(geojsonGeometry.coordinates, function (idx, coords) {
            var path = [];
            $.each(coords, function (idx2, coord) {
              var ll = new YGeoPoint(coord[1], coord[0]);
              path.push(ll);
            });
            paths.push(path);
          });
          // TODO: does not support polygons with holes
          if (0 !== paths.length) {
            vendorObjs.push(new YPolyline(paths[0]));
          }
        }());
        break;
      case 'MultiPolygon':
        (function () {
          $.each(geojsonGeometry.coordinates, function (idx, shape) {
            var paths = [];
            $.each(shape, function (idx2, coords) {
              var path = [];
              $.each(coords, function (idx3, coord) {
                var ll = new YGeoPoint(coord[1], coord[0]);
                path.push(ll);
              });
            });
            paths.push(path);
            // TODO: does not support polygons with holes
            if (0 !== paths.length) {
              vendorObjs.push(new YPolyline(paths[0]));
            }
          });
        }());
        break;
      default:
        vendorObjs.push(_error('Invalid GeoJSON object: Geometry object must be one of Point, LineString, Polygon or MultiPolygon.'));
      }
      return vendorObjs;
    };

    var _error = function (message) {
      return {
        type: 'Error',
        message: message
      };
    };

    var result = [];
    switch (geojson.type) {
    case 'FeatureCollection':
      if (!geojson.features) {
        result.push(_error('Invalid GeoJSON object: FeatureCollection object missing "features" member.'));
      } else {
        $.each(geojson.features, function (idx, feature) {
          result.push(geometryToVendorType(feature.geometry));
        });
      }
      break;
    case 'GeometryCollection':
      if (!geojson.geometries) {
        result.push(_error('Invalid GeoJSON object: GeometryCollection object missing "geometries" member.'));
      } else {
        $.each(geojson.geometries, function (idx, geom) {
          result.push(geometryToVendorType(geom));
        });
      }
      break;
    case 'Feature':
      if (!(geojson.properties && geojson.geometry)) {
        result.push(_error('Invalid GeoJSON object: Feature object missing "properties" or "geometry" member.'));
      } else {
        $.merge(result, geometryToVendorType(geojson.geometry));
      }
      break;
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      if (geojson.coordinates) {
        $.merge(result, geometryToVendorType(geojson));
      } else {
        result.push(_error('Invalid GeoJSON object: Geometry object missing "coordinates" member.'));
      }
      break;
    default:
      result.push(_error('Invalid GeoJSON object: GeoJSON object must be one of Point, LineString, Polygon, MultiPolygon, Feature, FeatureCollection or GeometryCollection.'));
    }
    return result;
  };
}(jQuery));
