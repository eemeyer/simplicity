(function ($) {
  // Based on  GeoJSON to Google Maps library (git://github.com/JasonSanford/GeoJSON-to-Google-Maps.git) commit abbd27
  $.simplicityGeoJsonToMapQuest = function (geojson) {

    var geometryToVendorType = function (geojsonGeometry) {
      var vendorObjs = [];
      switch (geojsonGeometry.type) {
      case 'Point':
        (function () {
          var location = new MQA.LatLng(geojsonGeometry.coordinates[1], geojsonGeometry.coordinates[0]);
          vendorObjs.push(new MQA.Poi(location));
        }());
        break;
      case 'MultiPoint':
        $.each(geojsonGeometry.coordinates, function (idx, coord) {
          var location =  new MQA.LatLng(coord[1], coord[0]);
          vendorObjs.push(new MQA.Poi(location));
        });
        break;
      case 'LineString':
        (function () {
          var path = new MQA.LatLngCollection();
          $.each(geojsonGeometry.coordinates, function (idx, coord) {
            var ll = new MQA.LatLng(coord[1], coord[0]);
            path.add(ll);
          });
          if (path.getSize() !== 0) {
            var vendorObj = new MQA.LineOverlay();
            vendorObj.setValue('shapePoints', path);
            vendorObjs.push(vendorObj);
          }
        }());
        break;
      case 'MultiLineString':
        $.each(geojsonGeometry.coordinates, function (idx, coords) {
          var path = new MQA.LatLngCollection();
          $.each(coords, function (idx2, coord) {
            var ll = new MQA.LatLng(coord[1], coord[0]);
            path.add(ll);
          });
          if (path.getSize() !== 0) {
            var vendorObj = new MQA.LineOverlay();
            vendorObj.setValue('shapePoints', path);
            vendorObjs.push(vendorObj);
          }
        });
        break;
      case 'Polygon':
        (function () {
          var paths = [];
          $.each(geojsonGeometry.coordinates, function (idx, coords) {
            var path = new MQA.LatLngCollection();
            $.each(coords, function (idx2, coord) {
              var ll = new MQA.LatLng(coord[1], coord[0]);
              path.add(ll);
            });
            paths.push(path);
          });
          // TODO: does not support polygons with holes
          if (0 !== paths.length && 0 !== paths[0].getSize()) {
            var vendorObj = new MQA.PolygonOverlay();
            vendorObj.setValue('shapePoints', paths[0]);
            vendorObjs.push(vendorObj);
          }
        }());
        break;
      case 'MultiPolygon':
        (function () {
          $.each(geojsonGeometry.coordinates, function (idx, shape) {
            var paths = [];
            $.each(shape, function (idx2, coords) {
              var path = new MQA.LatLngCollection();
              $.each(coords, function (idx3, coord) {
                var ll = new MQA.LatLng(coord[1], coord[0]);
                path.add(ll);
              });
              paths.push(path);
            });
            // TODO: does not support polygons with holes
            if (0 !== paths.length && 0 !== paths[0].getSize()) {
              var vendorObj = new MQA.PolygonOverlay();
              vendorObj.setValue('shapePoints', paths[0]);
              vendorObjs.push(vendorObj);
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
