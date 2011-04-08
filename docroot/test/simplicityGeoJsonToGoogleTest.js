TestCase("simplicityGeoJsonToGoogle", {
  'testFeaturePoint': function () {
    var converted = $.simplicityGeoJsonToGoogle(
        {'type': 'Feature',
        'id': 'identifier',
        'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
        'properties': {'name': 'named'}
    });
    assertObject(converted);
    assertArray(converted.vendorObjects);
    assertObject(converted.geoJson);

    var vendorObjects = converted.vendorObjects;
    assertEquals('should contain converted', 1, vendorObjects.length);
    assertInstanceOf('should be expected type', google.maps.Marker, vendorObjects[0]);
    assertEquals('should have lat', 10.0, vendorObjects[0].getPosition().lat());
    assertEquals('should have lon', 100.0, vendorObjects[0].getPosition().lng());
    assertObject(vendorObjects[0].simplicityGeoJson);
    assertEquals(
      {'type': 'Feature',
      'id': 'identifier',
      'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
      'properties': {'name': 'named'},
      simplicityGeoJsonParent: null
      },
      vendorObjects[0].simplicityGeoJson);
    assertEquals(
        {'type': 'Feature',
        'id': 'identifier',
        'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
        'properties': {'name': 'named'},
        simplicityVendorObject: vendorObjects[0]
        },
        converted.geoJson);
  },

  'testFeatureCollection': function () {
    var converted = $.simplicityGeoJsonToGoogle({
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
    assertObject(converted);
    assertArray(converted.vendorObjects);
    assertObject(converted.geoJson);
    var vendorObjects = converted.vendorObjects;

    assertTrue($.isArray(vendorObjects));
    assertEquals('should contain converted', 2, vendorObjects.length);

    (function () {
      var actual = vendorObjects[0];
      assertInstanceOf('should be expected type', google.maps.Marker, actual);
      assertEquals('should have lat', 0.5, actual.getPosition().lat());
      assertEquals('should have lon', 102.0, actual.getPosition().lng());
    }());
    (function () {
      var actual = vendorObjects[1];
      var path = actual.getPath();
      assertEquals('should vertices', 4, path.getLength());
      assertEquals('should have vertex', [102.0, 0.0], [path.getAt(0).lng(), path.getAt(0).lat()]);
      assertEquals('should have vertex', [103.0, 1.0], [path.getAt(1).lng(), path.getAt(1).lat()]);
      assertEquals('should have vertex', [104.0, 0.0], [path.getAt(2).lng(), path.getAt(2).lat()]);
      assertEquals('should have vertex', [105.0, 1.0], [path.getAt(3).lng(), path.getAt(3).lat()]);
    }());

    assertEquals({
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'id': 'point1',
        'geometry': {'type': 'Point', 'coordinates': [102.0, 0.5]},
        'properties': {'name': 'point 1 name'},
        simplicityVendorObject: vendorObjects[0]
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
        simplicityVendorObject: vendorObjects[1]
      }]
    }, converted);

    assertEquals({
      'type': 'Feature',
      'id': 'point1',
      'geometry': {'type': 'Point', 'coordinates': [102.0, 0.5]},
      'properties': {'name': 'point 1 name'},
      simplicityGeoJsonParent: {
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
      }
    }, vendorObjects[0].simplicityGeoJson);
  }
});