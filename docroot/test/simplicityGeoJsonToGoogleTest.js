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
    assertTrue('should be expected type', vendorObjs[0] instanceof google.maps.Marker);
    assertEquals('should have lat', 10.0, vendorObjs[0].getPosition().lat());
    assertEquals('should have lon', 100.0, vendorObjs[0].getPosition().lng());
  }
});