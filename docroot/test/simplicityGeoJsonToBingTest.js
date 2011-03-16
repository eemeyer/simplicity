(function () {
  var testCase = TestCase;
  testCase('simplicityGeoJsonToBing', {

    'testInvalidFeature': function () {
      var converted = this._convert({
        'type': 'Feature',
        'id': 'identifier',
        'properties': {'name': 'named'}
      });
      assertEquals('should contain converted', [], converted.vendorObjects);
      assertEquals([], converted.geoJson.simplicityVendorObjects);
    },

    'testInvalidPointCoordsEmpty': function () {
      var converted = this._convert({
        type: 'Point',
        coodinates: []
      });
      assertEquals('should contain converted', [], converted.vendorObjects);
      assertEquals([], converted.geoJson.simplicityVendorObjects);
    },

    'testInvalidPointNoCoords': function () {
      var converted = this._convert({
        type: 'Point'
      });
      assertEquals('should contain converted', [], converted.vendorObjects);
      assertEquals([], converted.geoJson.simplicityVendorObjects);
    },

    'testInvalidType': function () {
      var converted = this._convert({
        'type': 'invalid',
        'id': 'identifier',
        'properties': {'name': 'named'}
      });
      assertEquals('should contain converted', [], converted.vendorObjects);
      assertEquals([], converted.geoJson.simplicityVendorObjects);
    },

    'testFeaturePoint': function () {
      var converted = this._convert({
        'type': 'Feature',
        'id': 'identifier',
        'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
        'properties': {'name': 'named'}
      });
      assertEquals('should contain converted', 1, converted.vendorObjects.length);
      assertInstanceOf('should be expected type', Microsoft.Maps.Pushpin, converted.vendorObjects[0]);
      assertEquals('should have lat', 10.0, converted.vendorObjects[0].getLocation().latitude);
      assertEquals('should have lon', 100.0, converted.vendorObjects[0].getLocation().longitude);
      assertObject(converted.vendorObjects[0].simplicityGeoJson);

      assertEquals({
        'type': 'Feature',
        'id': 'identifier',
        'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
        'properties': {'name': 'named'}
      }, converted.vendorObjects[0].simplicityGeoJson);

      assertEquals({
        'type': 'Feature',
        'id': 'identifier',
        'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
        'properties': {'name': 'named'},
        'simplicityVendorObjects': converted.vendorObjects
      }, converted.geoJson);
    },

    'testPoint': function () {
      var converted = this._convert({'type': 'Point', 'coordinates': [100.0, 10.0]});
      assertEquals('should contain converted', 1, converted.vendorObjects.length);
      assertInstanceOf('should be expected type', Microsoft.Maps.Pushpin, converted.vendorObjects[0]);
      assertEquals('should have lat', 10.0, converted.vendorObjects[0].getLocation().latitude);
      assertEquals('should have lon', 100.0, converted.vendorObjects[0].getLocation().longitude);
      assertObject(converted.vendorObjects[0].simplicityGeoJson);
      assertEquals({'type': 'Point', 'coordinates': [100.0, 10.0]},
        converted.vendorObjects[0].simplicityGeoJson);
      assertEquals(
        {'type': 'Point', 'coordinates': [100.0, 10.0], 'simplicityVendorObjects': converted.vendorObjects},
        converted.geoJson);
    },

    'testFeatureMultiPoint': function () {
      var converted = this._convert({
        'type': 'Feature',
        'id': 'identifier',
        'geometry': {'type': 'MultiPoint', 'coordinates': [[100.0, 10.0], [101.0, 11.0], [102.0, 12.0]] },
        'properties': {'name': 'named'}
      });

      assertEquals('should contain converted', 3, converted.vendorObjects.length);
      $.each([[100.0, 10.0], [101.0, 11.0], [102.0, 12.0]], $.proxy(function (idx, coord) {
        var vendor = converted.vendorObjects[idx];
        assertInstanceOf('should be expected type ' + idx, Microsoft.Maps.Pushpin, vendor);
        assertEquals('should have lat', coord[1], vendor.getLocation().latitude);
        assertEquals('should have lon', coord[0], vendor.getLocation().longitude);
        assertObject(vendor.simplicityGeoJson);

        assertEquals('idx ' + idx,
            {'type': 'Feature',
              'id': 'identifier',
              'geometry': {'type': 'MultiPoint', 'coordinates': [[100.0, 10.0], [101.0, 11.0], [102.0, 12.0]] },
              'properties': {'name': 'named'}
            },
            vendor.simplicityGeoJson);
      }, this));

      assertEquals(
          {'type': 'Feature',
          'id': 'identifier',
          'geometry': {'type': 'MultiPoint', 'coordinates': [[100.0, 10.0], [101.0, 11.0], [102.0, 12.0]] },
          'properties': {'name': 'named'},
          'simplicityVendorObjects': converted.vendorObjects
          },
          converted.geoJson);
    },

    'testMultiPoint': function () {
      var converted = this._convert({'type': 'MultiPoint', 'coordinates': [[100.0, 10.0], [101.0, 11.0], [102.0, 12.0]]});

      assertEquals('should contain converted', 3, converted.vendorObjects.length);
      $.each([[100.0, 10.0], [101.0, 11.0], [102.0, 12.0]], $.proxy(function (idx, coord) {
        var vendor = converted.vendorObjects[idx];
        assertInstanceOf('should be expected type ' + idx, Microsoft.Maps.Pushpin, vendor);
        assertEquals('should have lat', coord[1], vendor.getLocation().latitude);
        assertEquals('should have lon', coord[0], vendor.getLocation().longitude);
        assertObject(vendor.simplicityGeoJson);

        assertEquals('idx ' + idx, {'type': 'MultiPoint', 'coordinates': [[100.0, 10.0], [101.0, 11.0], [102.0, 12.0]]},
          vendor.simplicityGeoJson);
      }, this));

      assertEquals({
        'type': 'MultiPoint',
        'coordinates': [[100.0, 10.0], [101.0, 11.0], [102.0, 12.0]],
        'simplicityVendorObjects': converted.vendorObjects
      }, converted.geoJson);
    },

    'testFeatureLineString': function () {
      var converted = this._convert({
        'type': 'Feature',
        'id': 'linestr1',
        'geometry': {
          'type': 'LineString',
          'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]
        },
        'properties': {
          'prop0': 'value0',
          'prop1': 0.0
        }
      });
      assertEquals(1, converted.vendorObjects.length);
      var vendor = converted.vendorObjects[0];
      assertInstanceOf('should be expected type', Microsoft.Maps.Polyline, vendor);
      $.each([[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], $.proxy(function (idx, coord) {
        this._assertLatLng(idx, coord, vendor.getLocations()[idx]);
      }, this));
      assertEquals({
        'type': 'Feature',
        'id': 'linestr1',
        'geometry': {
          'type': 'LineString',
          'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]
        },
        'properties': {
          'prop0': 'value0',
          'prop1': 0.0
        },
        simplicityVendorObjects: converted.vendorObjects
      }, converted.geoJson);
    },

    'testLineString': function () {
      var converted = this._convert({
        'type': 'LineString',
        'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]
      });
      assertEquals(1, converted.vendorObjects.length);
      var vendor = converted.vendorObjects[0];
      assertInstanceOf('should be expected type', Microsoft.Maps.Polyline, vendor);
      $.each([[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], $.proxy(function (idx, coord) {
        this._assertLatLng(idx, coord, vendor.getLocations()[idx]);
      }, this));
      assertEquals({
        'type': 'LineString',
        'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]],
        simplicityVendorObjects: converted.vendorObjects
      }, converted.geoJson);
    },

    'testFeatureMultiLineString': function () {
      var converted = this._convert({
        'type': 'Feature',
        'id': 'linestr1',
        'geometry': {
          'type': 'MultiLineString',
          'coordinates': [[[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], [[103.0, 2.0], [102.0, 1.0]]]
        },
        'properties': {
          'prop0': 'value0',
          'prop1': 0.0
        }
      });
      assertEquals(2, converted.vendorObjects.length);
      $.each([[[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], [[103.0, 2.0], [102.0, 1.0]]], $.proxy(function (idx, coords) {
        var vendor = converted.vendorObjects[idx];
        assertInstanceOf('should be expected type', Microsoft.Maps.Polyline, vendor);
        $.each(coords, $.proxy(function (idx2, coord) {
          this._assertLatLng(idx + ':' + idx2, coord, vendor.getLocations()[idx2]);
        }, this));
      }, this));
      assertEquals({
        'type': 'Feature',
        'id': 'linestr1',
        'geometry': {
          'type': 'MultiLineString',
          'coordinates': [[[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], [[103.0, 2.0], [102.0, 1.0]]]
        },
        'properties': {
          'prop0': 'value0',
          'prop1': 0.0
        },
        simplicityVendorObjects: converted.vendorObjects
      }, converted.geoJson);
    },

    'testMultiLineString': function () {
      var converted = this._convert({
        'type': 'MultiLineString',
        'coordinates': [[[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], [[103.0, 2.0], [102.0, 1.0]]]
      });
      assertEquals(2, converted.vendorObjects.length);
      $.each([[[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], [[103.0, 2.0], [102.0, 1.0]]], $.proxy(function (idx, coords) {
        var vendor = converted.vendorObjects[idx];
        assertInstanceOf('should be expected type', Microsoft.Maps.Polyline, vendor);
        $.each(coords, $.proxy(function (idx2, coord) {
          this._assertLatLng(idx + ':' + idx2, coord, vendor.getLocations()[idx2]);
        }, this));
      }, this));
      assertEquals({
        'type': 'MultiLineString',
        'coordinates': [[[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], [[103.0, 2.0], [102.0, 1.0]]],
        simplicityVendorObjects: converted.vendorObjects
      }, converted.geoJson);
    },

    'testFeaturePolygon': function () {
      var converted = this._convert({
        'type': 'Feature',
        'id': 'linestr1',
        'geometry': {
          'type': 'Polygon',
          'coordinates': [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]
        },
        'properties': {
          'prop0': 'value0',
          'prop1': 0.0
        }
      });
      assertEquals('should contain converted', 1, converted.vendorObjects.length);

      var actual = converted.vendorObjects[0];
      var path = actual.getLocations();
      this._assertVertices([[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]], path);

      assertEquals({
        'type': 'Feature',
        'id': 'linestr1',
        'geometry': {
          'type': 'Polygon',
          'coordinates': [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]
        },
        'properties': {
          'prop0': 'value0',
          'prop1': 0.0
        },
        simplicityVendorObjects: converted.vendorObjects
      }, converted.geoJson);
    },

    'testPolygon': function () {
      var converted = this._convert({
        'type': 'Polygon',
        'coordinates': [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]
      });
      assertEquals('should contain converted', 1, converted.vendorObjects.length);

      var actual = converted.vendorObjects[0];
      var path = actual.getLocations();
      this._assertVertices([[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]], path);

      assertEquals({
        'type': 'Polygon',
        'coordinates': [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]],
        simplicityVendorObjects: converted.vendorObjects
      }, converted.geoJson);
    },

    'testFeatureMultiPolygon': function () {
      var converted = this._convert({
        'type': 'Feature',
        'id': 'linestr1',
        'geometry': {
          'type': 'MultiPolygon',
          'coordinates': [
            [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
            [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
             [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
          ]
        },
        'properties': {
          'prop0': 'value0',
          'prop1': 0.0
        }
      });
      assertEquals(2, converted.vendorObjects.length);
      $.each([[[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
              [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]], $.proxy(function (idx, shape) {
        $.each(shape, $.proxy(function (idx2, coords) {
          var vendor = converted.vendorObjects[idx];
          assertInstanceOf('should be expected type', Microsoft.Maps.Polygon, vendor);
          $.each(coords, $.proxy(function (idx3, coord) {
            this._assertLatLng(idx + ':' + idx2 + ':' + idx3, coord, vendor.getLocations()[idx3]);
          }, this));
        }, this));
      }, this));
      assertEquals({
        'type': 'Feature',
        'id': 'linestr1',
        'geometry': {
          'type': 'MultiPolygon',
          'coordinates': [
            [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
            [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
             [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
          ]
        },
        'properties': {
          'prop0': 'value0',
          'prop1': 0.0
        },
        simplicityVendorObjects: converted.vendorObjects
      }, converted.geoJson);
    },

    'testMultiPolygon': function () {
      var converted = this._convert({
        'type': 'MultiPolygon',
        'coordinates': [
          [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
          [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
           [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
        ]
      });
      assertEquals(2, converted.vendorObjects.length);
      $.each([[[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
              [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]], $.proxy(function (idx, shape) {
        $.each(shape, $.proxy(function (idx2, coords) {
          var vendor = converted.vendorObjects[idx];
          assertInstanceOf('should be expected type', Microsoft.Maps.Polygon, vendor);
          $.each(coords, $.proxy(function (idx3, coord) {
            this._assertLatLng(idx + ':' + idx2 + ':' + idx3, coord, vendor.getLocations()[idx3]);
          }, this));
        }, this));
      }, this));
      assertEquals({
        'type': 'MultiPolygon',
        'coordinates': [
          [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
          [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
           [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
        ],
        simplicityVendorObjects: converted.vendorObjects
      }, converted.geoJson);
    },

    'testFeatureCollection': function () {
      var converted = this._convert({
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'id': 'point1',
          'geometry': {'type': 'Point', 'coordinates': [102.0, 0.5]},
          'properties': {'name': 'point 1 name'}
        },
        {
          'type': 'Feature',
          'id': 'linestr1',
          'geometry': {
            'type': 'LineString',
            'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]
          },
          'properties': {
            'prop0': 'value0',
            'prop1': 0.0
          }
        }]
      });
      assertEquals('should contain converted', 2, converted.vendorObjects.length);

      (function () {
        var actual = converted.vendorObjects[0];
        assertInstanceOf('should be expected type', Microsoft.Maps.Pushpin, actual);
        assertEquals('should have lat', 0.5, actual.getLocation().latitude);
        assertEquals('should have lon', 102.0, actual.getLocation().longitude);
      }());
      ($.proxy(function () {
        var actual = converted.vendorObjects[1];
        var path = actual.getLocations();
        this._assertVertices([[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], path);
      }, this)());

      (function () {
        var actual = converted.geoJson.features[0].simplicityVendorObjects[0];
        assertInstanceOf('should be expected type', Microsoft.Maps.Pushpin, actual);
        assertEquals('should have lat', 0.5, actual.getLocation().latitude);
        assertEquals('should have lon', 102.0, actual.getLocation().longitude);
      }());
      ($.proxy(function () {
        var actual = converted.geoJson.features[1].simplicityVendorObjects[0];
        var path = actual.getLocations();
        this._assertVertices([[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], path);
      }, this)());

      assertEquals({
        'type': 'Feature',
        'id': 'point1',
        'geometry': {'type': 'Point', 'coordinates': [102.0, 0.5]},
        'properties': {'name': 'point 1 name'}
      }, converted.vendorObjects[0].simplicityGeoJson);

      $.each(converted.vendorObjects, function (idx, obj) {
        delete obj.simplicityGeoJson;
      });
      assertEquals({
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'id': 'point1',
          'geometry': {'type': 'Point', 'coordinates': [102.0, 0.5]},
          'properties': {'name': 'point 1 name'},
          simplicityVendorObjects: [converted.vendorObjects[0]]
        },
        {
          'type': 'Feature',
          'id': 'linestr1',
          'geometry': {
            'type': 'LineString',
            'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]
          },
          'properties': {
            'prop0': 'value0',
            'prop1': 0.0
          },
          simplicityVendorObjects: [converted.vendorObjects[1]]
        }],
        simplicityVendorObjects: converted.vendorObjects
      }, converted.geoJson);
    },

    'testGeometryCollection': function () {
      var converted = this._convert({
        'type': 'GeometryCollection',
        'geometries': [
          {'type': 'Point', 'coordinates': [102.0, 0.5]},
          {
            'type': 'LineString',
            'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]
          }
        ]
      });
      assertEquals('should contain converted', 2, converted.vendorObjects.length);

      (function () {
        var actual = converted.vendorObjects[0];
        assertInstanceOf('should be expected type', Microsoft.Maps.Pushpin, actual);
        assertEquals('should have lat', 0.5, actual.getLocation().latitude);
        assertEquals('should have lon', 102.0, actual.getLocation().longitude);
      }());
      (function () {
        var actual = converted.vendorObjects[1];
        var path = actual.getLocations();
        assertEquals('should vertices', 4, path.length);
        assertEquals('should have vertex', [102.0, 0.0], [path[0].longitude, path[0].latitude]);
        assertEquals('should have vertex', [103.0, 1.0], [path[1].longitude, path[1].latitude]);
        assertEquals('should have vertex', [104.0, 0.0], [path[2].longitude, path[2].latitude]);
        assertEquals('should have vertex', [105.0, 1.0], [path[3].longitude, path[3].latitude]);
      }());

      (function () {
        var actual = converted.geoJson.geometries[0].simplicityVendorObjects[0];
        assertInstanceOf('should be expected type', Microsoft.Maps.Pushpin, actual);
        assertEquals('should have lat', 0.5, actual.getLocation().latitude);
        assertEquals('should have lon', 102.0, actual.getLocation().longitude);
      }());
      (function () {
        var actual = converted.geoJson.geometries[1].simplicityVendorObjects[0];
        var path = actual.getLocations();
        assertEquals('should vertices', 4, path.length);
        assertEquals('should have vertex', [102.0, 0.0], [path[0].longitude, path[0].latitude]);
        assertEquals('should have vertex', [103.0, 1.0], [path[1].longitude, path[1].latitude]);
        assertEquals('should have vertex', [104.0, 0.0], [path[2].longitude, path[2].latitude]);
        assertEquals('should have vertex', [105.0, 1.0], [path[3].longitude, path[3].latitude]);
      }());

      $.each([
        {'type': 'Point', 'coordinates': [102.0, 0.5]},
        {
          'type': 'LineString',
          'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]
        }
      ], function (idx, expectedJson) {
        assertEquals('expected for ' + idx, expectedJson,  converted.vendorObjects[idx].simplicityGeoJson);
      });


      $.each(converted.vendorObjects, function (idx, obj) {
        delete obj.simplicityGeoJson;
      });
      assertEquals({
          type: 'GeometryCollection',
          geometries: [{'type': 'Point', 'coordinates': [102.0, 0.5],
          simplicityVendorObjects: [converted.vendorObjects[0]]
        },
          {
            'type': 'LineString',
            'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]],
            simplicityVendorObjects: [converted.vendorObjects[1]]
          }],
          simplicityVendorObjects: converted.vendorObjects
        }, converted.geoJson);
    },

    _assertVertices : function (expectedCoordinates, actualPathArray) {
      assertEquals('should have vertices', expectedCoordinates.length, actualPathArray.length);
      $.each(expectedCoordinates, $.proxy(function (idx, expected) {
        this._assertLatLng('should have vertex ' + idx, expected, actualPathArray[idx]);
      }, this));
    },

    _assertLatLng: function (message, expectedCoord, actualLatLng) {
      assertEquals(message, expectedCoord, [actualLatLng.longitude, actualLatLng.latitude]);
    },

    _convert: function (geoJson) {
      var converted = $.simplicityGeoJsonToBing(geoJson, true);
      assertObject(converted);
      assertArray(converted.vendorObjects);
      assertObject(converted.geoJson);
      assertArray(converted.geoJson.simplicityVendorObjects);
      assertArray(converted.vendorObjects);
      return converted;
    }

  });
}());
