TestCase("simplicityGeoJsonToGoogle", {
  'testFeaturePoint': function () {
    var vendorObjs = $.simplicityGeoJsonToGoogle(
        {'type': 'Feature',
        'id': 'identifier',
        'geometry': {'type': 'Point', 'coordinates': [100.0, 10.0] },
        'properties': {'name': 'named'}
    });
    assertNotNull(vendorObjs);
    assertTrue($.isArray(vendorObjs));
    assertEquals('should contain converted', 1, vendorObjs.length);
    assertInstanceOf('should be expected type', google.maps.Marker, vendorObjs[0]);
    assertEquals('should have lat', 10.0, vendorObjs[0].getPosition().lat());
    assertEquals('should have lon', 100.0, vendorObjs[0].getPosition().lng());
  },
  'testFeatureCollection': function () {
    var vendorObjs = $.simplicityGeoJsonToGoogle(
        { 'type': 'FeatureCollection',
          'features': [
            { 'type': 'Feature',
              'id': 'point1',
              'geometry': {'type': 'Point', 'coordinates': [102.0, 0.5]},
              'properties': {'name': 'point 1 name'}
              },
            { 'type': 'Feature',
              'id': 'linestr1',
              'geometry': {
                'type': 'LineString',
                'coordinates': [
                  [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                  ]
                },
              'properties': {
                'prop0': 'value0',
                'prop1': 0.0
                }
              }
             ]
           }
    );
    assertNotNull(vendorObjs);
    assertTrue($.isArray(vendorObjs));
    assertEquals('should contain converted', 2, vendorObjs.length);

    (function () {
      var actual = vendorObjs[0][0];
      assertInstanceOf('should be expected type', google.maps.Marker, actual);
      assertEquals('should have lat', 0.5, actual.getPosition().lat());
      assertEquals('should have lon', 102.0, actual.getPosition().lng());
    }());
    (function () {
      var actual = vendorObjs[1][0];
      var path = actual.getPath();
      assertEquals('should vertices', 4, path.getLength());
      assertEquals('should have vertex', [102.0, 0.0], [path.getAt(0).lng(), path.getAt(0).lat()]);
      assertEquals('should have vertex', [103.0, 1.0], [path.getAt(1).lng(), path.getAt(1).lat()]);
      assertEquals('should have vertex', [104.0, 0.0], [path.getAt(2).lng(), path.getAt(2).lat()]);
      assertEquals('should have vertex', [105.0, 1.0], [path.getAt(3).lng(), path.getAt(3).lat()]);
    }());
  }
});