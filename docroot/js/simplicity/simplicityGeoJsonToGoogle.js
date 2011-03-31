(function ($) {
  // Based on  GeoJSON to Google Maps library (git://github.com/JasonSanford/GeoJSON-to-Google-Maps.git) commit abbd27
  $.simplicityGeoJsonToGoogle = function (geojson, options) {

    var geometryToVendorType = function (geojsonGeometry, opts) {
      var googleObjs = [];
      switch (geojsonGeometry.type) {
      case 'Point':
        opts.position = new google.maps.LatLng(geojsonGeometry.coordinates[1], geojsonGeometry.coordinates[0]);
        googleObjs.push(new google.maps.Marker(opts));
        break;
      case 'MultiPoint':
        $.each(geojsonGeometry.coordinates, function (idx, coord) {
          opts.position = new google.maps.LatLng(coord[1], coord[0]);
          googleObjs.push(new google.maps.Marker(opts));
        });
        break;
      case 'LineString':
        (function () {
          var path = [];
          $.each(geojsonGeometry.coordinates, function (idx, coord) {
            var ll = new google.maps.LatLng(coord[1], coord[0]);
            path.push(ll);
          });
          opts.path = path;
          googleObjs.push(new google.maps.Polyline(opts));
        }());
        break;
      case 'MultiLineString':
        $.each(geojsonGeometry.coordinates, function (idx, coords) {
          var path = [];
          $.each(coords, function (idx2, coord) {
            var ll = new google.maps.LatLng(coord[1], coord[0]);
            path.push(ll);
          });
          opts.path = path;
          googleObjs.push(new google.maps.Polyline(opts));
        });
        break;
      case 'Polygon':
        (function () {
          var paths = [];
          $.each(geojsonGeometry.coordinates, function (idx, coords) {
            var path = [];
            $.each(coords, function (idx2, coord) {
              var ll = new google.maps.LatLng(coord[1], coord[0]);
              path.push(ll);
            });
            paths.push(path);
          });
          opts.paths = paths;
          googleObjs.push(new google.maps.Polygon(opts));
        }());
        break;
      case 'MultiPolygon':
        (function () {
          var paths = [];
          $.each(geojsonGeometry.coordinates, function (idx, shape) {
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
          googleObjs.push(new google.maps.Polygon(opts));
        }());
        break;
      default:
        googleObjs.push(_error('Invalid GeoJSON object: Geometry object must be one of Point, LineString, Polygon or MultiPolygon.'));
      }
      return googleObjs;
    };

    var _error = function (message) {
      return {
        type: 'Error',
        message: message
      };
    };

    var result = [];
    var opts = options || {};
    switch (geojson.type) {
    case 'FeatureCollection':
      if (!geojson.features) {
        result.push(_error('Invalid GeoJSON object: FeatureCollection object missing "features" member.'));
      } else {
        $.each(geojson.features, function (idx, feature) {
          result.push(geometryToVendorType(feature.geometry, opts));
        });
      }
      break;
    case 'GeometryCollection':
      if (!geojson.geometries) {
        result.push(_error('Invalid GeoJSON object: GeometryCollection object missing "geometries" member.'));
      } else {
        $.each(geojson.geometries, function (idx, geom) {
          result.push(geometryToVendorType(geom, opts));
        });
      }
      break;
    case 'Feature':
      if (!(geojson.properties && geojson.geometry)) {
        result.push(_error('Invalid GeoJSON object: Feature object missing "properties" or "geometry" member.'));
      } else {
        $.merge(result, geometryToVendorType(geojson.geometry, opts));
      }
      break;
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      if (geojson.coordinates) {
        $.merge(result, geometryToVendorType(geojson, opts));
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
