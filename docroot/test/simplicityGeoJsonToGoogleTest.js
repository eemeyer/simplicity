TestCase("simplicityGeoJsonToGoogle", {

  'testFeaturePoint': function () {
    var converted = this._convert({
      'type': 'Feature',
      'id': 'identifier',
      'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
      'properties': {'name': 'named'}
    });
    assertEquals('should contain converted', 1, converted.vendorObjects.length);
    assertInstanceOf('should be expected type', google.maps.Marker, converted.vendorObjects[0]);
    assertEquals('should have lat', 10.0, converted.vendorObjects[0].getPosition().lat());
    assertEquals('should have lon', 100.0, converted.vendorObjects[0].getPosition().lng());
    assertObject(converted.vendorObjects[0].simplicityGeoJson);

    assertEquals(
      {'type': 'Feature',
      'id': 'identifier',
      'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
      'properties': {'name': 'named'}
      },
      converted.vendorObjects[0].simplicityGeoJson);

    assertEquals(
        {'type': 'Feature',
        'id': 'identifier',
        'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
        'properties': {'name': 'named'},
        'simplicityVendorObjects': converted.vendorObjects
        },
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
    $.each(converted.vendorObjects, $.proxy(function (idx, vendor) {
    }, this));
    $.each([[100.0, 10.0], [101.0, 11.0], [102.0, 12.0]], $.proxy(function (idx, coord) {
      var vendor = converted.vendorObjects[idx];
      assertInstanceOf('should be expected type ' + idx, google.maps.Marker, vendor);
      assertEquals('should have lat', coord[1], vendor.getPosition().lat());
      assertEquals('should have lon', coord[0], vendor.getPosition().lng());
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
    assertInstanceOf('should be expected type', google.maps.Polyline, vendor);
    $.each([[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], $.proxy(function (idx, coord) {
      this._assertLatLng(idx, coord, vendor.getPath().getAt(idx));
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

  'testInvalidFeature': function () {
    var converted = this._convert({
      'type': 'Feature',
      'id': 'identifier',
      'properties': {'name': 'named'}
    });
    assertEquals('should contain converted', [], converted.vendorObjects);
    assertEquals([], converted.geoJson.simplicityVendorObjects);
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
      assertInstanceOf('should be expected type', google.maps.Marker, actual);
      assertEquals('should have lat', 0.5, actual.getPosition().lat());
      assertEquals('should have lon', 102.0, actual.getPosition().lng());
    }());
    ($.proxy(function () {
      var actual = converted.vendorObjects[1];
      var path = actual.getPath();
      this._assertVertices([[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], path.getArray());
    }, this)());

    (function () {
      var actual = converted.geoJson.features[0].simplicityVendorObjects[0];
      assertInstanceOf('should be expected type', google.maps.Marker, actual);
      assertEquals('should have lat', 0.5, actual.getPosition().lat());
      assertEquals('should have lon', 102.0, actual.getPosition().lng());
    }());
    ($.proxy(function () {
      var actual = converted.geoJson.features[1].simplicityVendorObjects[0];
      var path = actual.getPath();
      this._assertVertices([[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]], path.getArray());
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
      assertInstanceOf('should be expected type', google.maps.Marker, actual);
      assertEquals('should have lat', 0.5, actual.getPosition().lat());
      assertEquals('should have lon', 102.0, actual.getPosition().lng());
    }());
    (function () {
      var actual = converted.vendorObjects[1];
      var path = actual.getPath();
      assertEquals('should vertices', 4, path.getLength());
      assertEquals('should have vertex', [102.0, 0.0], [path.getAt(0).lng(), path.getAt(0).lat()]);
      assertEquals('should have vertex', [103.0, 1.0], [path.getAt(1).lng(), path.getAt(1).lat()]);
      assertEquals('should have vertex', [104.0, 0.0], [path.getAt(2).lng(), path.getAt(2).lat()]);
      assertEquals('should have vertex', [105.0, 1.0], [path.getAt(3).lng(), path.getAt(3).lat()]);
    }());

    (function () {
      var actual = converted.geoJson.geometries[0].simplicityVendorObjects[0];
      assertInstanceOf('should be expected type', google.maps.Marker, actual);
      assertEquals('should have lat', 0.5, actual.getPosition().lat());
      assertEquals('should have lon', 102.0, actual.getPosition().lng());
    }());
    (function () {
      var actual = converted.geoJson.geometries[1].simplicityVendorObjects[0];
      var path = actual.getPath();
      assertEquals('should vertices', 4, path.getLength());
      assertEquals('should have vertex', [102.0, 0.0], [path.getAt(0).lng(), path.getAt(0).lat()]);
      assertEquals('should have vertex', [103.0, 1.0], [path.getAt(1).lng(), path.getAt(1).lat()]);
      assertEquals('should have vertex', [104.0, 0.0], [path.getAt(2).lng(), path.getAt(2).lat()]);
      assertEquals('should have vertex', [105.0, 1.0], [path.getAt(3).lng(), path.getAt(3).lat()]);
    }());

    $.each(
        [{'type': 'Point', 'coordinates': [102.0, 0.5]},
         {
          'type': 'LineString',
          'coordinates': [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]
         }], function (idx, expectedJson) {
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

  'testPolygon': function () {
    var converted = this._convert({ "type": "Polygon",
      "coordinates": [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]
    });
    assertEquals('should contain converted', 1, converted.vendorObjects.length);

    var actual = converted.vendorObjects[0];
    assertEquals(1, actual.getPaths().getLength());
    var path = actual.getPath();
    this._assertVertices([[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]], path.getArray());
  },

  'testMultiPolygon': function () {
    var converted = this._convert({
      "type": "MultiPolygon",
      "coordinates": [
                      [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
                      [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                       [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
                      ]
    });
    assertEquals('should contain converted', 2, converted.vendorObjects.length);
    this._assertVertices([[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]],
        converted.vendorObjects[0].getPaths().getAt(0).getArray());
    this._assertVertices([[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
        converted.vendorObjects[1].getPaths().getAt(0).getArray());

    // NOTE: there is no good place to attache the simplicityVendorObject to a MultiPolygon, since the coordinates[][][][] holds
    // a collection of polygons. Right now simplicityVendorObject just points to the last poly. This could be turned into an array.
  },

  _assertVertices : function (expectedCoordinates, actualPathArray) {
    assertEquals('should have vertices', expectedCoordinates.length, actualPathArray.length);
    $.each(expectedCoordinates, $.proxy(function (idx, expected) {
      this._assertLatLng('should have vertex ' + idx, expected, actualPathArray[idx]);
    }, this));
  },

  _assertLatLng: function (message, expectedCoord, actualLatLng) {
    assertEquals(message, expectedCoord, [actualLatLng.lng(), actualLatLng.lat()]);
  },

  _convert: function (geoJson) {
    var converted = $.simplicityGeoJsonToGoogle(geoJson, {} , true);
    assertObject(converted);
    assertArray(converted.vendorObjects);
    assertObject(converted.geoJson);
    assertArray(converted.geoJson.simplicityVendorObjects);
    assertArray(converted.vendorObjects);
    return converted;
  }

});
