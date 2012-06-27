module("simplicity minified");

test("has no errors", function() {
  var errors = window.simplicityMinifiedErrors;
  delete window.simplicityMinifiedErrors;
  if (errors.length != 0) {
    console.log("There were " + errors.length + " errors when loading the JavaScript elements");
    $.each(errors, function (idx, error) {
      console.log("  [" + idx + "]", error);
    });
    ok(false, errors.length + " errors occurred when loading the page JavaScript, see console.log for details");
  }
});

// Core widgets
test("defines $.simplicityEquiv", function() {
  ok('undefined' !== typeof($.simplicityEquiv), 'undefined widget: $.simplicityEquiv');
});
test("defines $.simplicityProxy", function() {
  ok('undefined' !== typeof($.simplicityProxy), 'undefined widget: $.simplicityProxy');
});
test("defines $.ui.simplicityWidget", function() {
  ok('undefined' !== typeof($.ui.simplicityWidget), 'undefined widget: $.ui.simplicityWidget');
});
test("defines $.fn.simplicityFromState", function() {
  ok('undefined' !== typeof($.fn.simplicityFromState), 'undefined widget: $.fn.simplicityFromState');
});
test("defines $.fn.simplicityToState", function() {
  ok('undefined' !== typeof($.fn.simplicityToState), 'undefined widget: $.fn.simplicityToState');
});
test("defines $.ui.simplicityState", function() {
  ok('undefined' !== typeof($.ui.simplicityState), 'undefined widget: $.ui.simplicityState');
});
test("defines $.ui.simplicityInputs", function() {
  ok('undefined' !== typeof($.ui.simplicityInputs), 'undefined widget: $.ui.simplicityInputs');
});
test("defines $.ui.simplicityHistory", function() {
  ok('undefined' !== typeof($.ui.simplicityHistory), 'undefined widget: $.ui.simplicityHistory');
});
test("defines $.simplicityAjaxHelper", function() {
  ok('undefined' !== typeof($.simplicityAjaxHelper), 'undefined widget: $.simplicityAjaxHelper');
});
test("defines $.ui.simplicityDiscoverySearch", function() {
  ok('undefined' !== typeof($.ui.simplicityDiscoverySearch), 'undefined widget: $.ui.simplicityDiscoverySearch');
});
test("defines $.ui.simplicityDebug", function() {
  ok('undefined' !== typeof($.ui.simplicityDebug), 'undefined widget: $.ui.simplicityDebug');
});

// Widgets sensitive to search
test("defines $.ui.simplicitySearchResults", function() {
  ok('undefined' !== typeof($.ui.simplicitySearchResults), 'undefined widget: $.ui.simplicitySearchResults');
});
test("defines $.ui.simplicityRenderParamsSearchResults", function() {
  ok('undefined' !== typeof($.ui.simplicityRenderParamsSearchResults), 'undefined widget: $.ui.simplicityRenderParamsSearchResults');
});
test("defines $.ui.simplicityPagination", function() {
  ok('undefined' !== typeof($.ui.simplicityPagination), 'undefined widget: $.ui.simplicityPagination');
});
test("defines $.ui.simplicityPageSnapBack", function() {
  ok('undefined' !== typeof($.ui.simplicityPageSnapBack), 'undefined widget: $.ui.simplicityPageSnapBack');
});
test("defines $.ui.simplicityFacetCount", function() {
  ok('undefined' !== typeof($.ui.simplicityFacetCount), 'undefined widget: $.ui.simplicityFacetCount');
});
test("defines $.ui.simplicityFacetedInput", function() {
  ok('undefined' !== typeof($.ui.simplicityFacetedInput), 'undefined widget: $.ui.simplicityFacetedInput');
});
test("defines $.ui.simplicityFacetedSelect", function() {
  ok('undefined' !== typeof($.ui.simplicityFacetedSelect), 'undefined widget: $.ui.simplicityFacetedSelect');
});

// UI only
test("defines $.ui.simplicitySlider", function() {
  ok('undefined' !== typeof($.ui.simplicitySlider), 'undefined widget: $.ui.simplicitySlider');
});
test("defines $.ui.simplicitySelectSlider", function() {
  ok('undefined' !== typeof($.ui.simplicitySelectSlider), 'undefined widget: $.ui.simplicitySelectSlider');
});
test("defines $.ui.simplicityFlyout", function() {
  ok('undefined' !== typeof($.ui.simplicityFlyout), 'undefined widget: $.ui.simplicityFlyout');
});
test("defines $.ui.simplicityFancySelect", function() {
  ok('undefined' !== typeof($.ui.simplicityFancySelect), 'undefined widget: $.ui.simplicityFancySelect');
});
test("defines $.ui.simplicityFancyFacets", function() {
  ok('undefined' !== typeof($.ui.simplicityFancyFacets), 'undefined widget: $.ui.simplicityFancyFacets');
});

// Geographic functions
test("defines $.simplicityGeoFn", function() {
  ok('undefined' !== typeof($.simplicityGeoFn), 'undefined widget: $.simplicityGeoFn');
});
test("defines $.simplicityGeoFn.degreesToRadians", function() {
  ok('undefined' !== typeof($.simplicityGeoFn.degreesToRadians), 'undefined widget: $.simplicityGeoFn.degreesToRadians');
});
test("defines $.simplicityGeoFn.radiansToDegrees", function() {
  ok('undefined' !== typeof($.simplicityGeoFn.radiansToDegrees), 'undefined widget: $.simplicityGeoFn.radiansToDegrees');
});
test("defines $.simplicityGeoFn.distanceRadians", function() {
  ok('undefined' !== typeof($.simplicityGeoFn.distanceRadians), 'undefined widget: $.simplicityGeoFn.distanceRadians');
});
test("defines $.simplicityGeoFn.distanceMiles", function() {
  ok('undefined' !== typeof($.simplicityGeoFn.distanceMiles), 'undefined widget: $.simplicityGeoFn.distanceMiles');
});
test("defines $.simplicityGeoFn.distanceKm", function() {
  ok('undefined' !== typeof($.simplicityGeoFn.distanceKm), 'undefined widget: $.simplicityGeoFn.distanceKm');
});
test("defines $.simplicityGeoFn.computeHeading", function() {
  ok('undefined' !== typeof($.simplicityGeoFn.computeHeading), 'undefined widget: $.simplicityGeoFn.computeHeading');
});
test("defines $.simplicityGeoFn.travel", function() {
  ok('undefined' !== typeof($.simplicityGeoFn.travel), 'undefined widget: $.simplicityGeoFn.travel');
});
test("defines $.simplicityGeoFn.intersection", function() {
  ok('undefined' !== typeof($.simplicityGeoFn.intersection), 'undefined widget: $.simplicityGeoFn.intersection');
});
// Compatibility
test("defines $.simplicityHaversineRadiusMiles", function() {
  ok('undefined' !== typeof($.simplicityHaversineRadiusMiles), 'undefined widget: $.simplicityHaversineRadiusMiles');
});
test("defines $.simplicityHaversineRadiusKm", function() {
  ok('undefined' !== typeof($.simplicityHaversineRadiusKm), 'undefined widget: $.simplicityHaversineRadiusKm');
});
test("defines $.simplicityHaversineDistanceRadians", function() {
  ok('undefined' !== typeof($.simplicityHaversineDistanceRadians), 'undefined widget: $.simplicityHaversineDistanceRadians');
});
test("defines $.simplicityHaversineDistanceMiles", function() {
  ok('undefined' !== typeof($.simplicityHaversineDistanceMiles), 'undefined widget: $.simplicityHaversineDistanceMiles');
});
test("defines $.simplicityHaversineDistanceKm", function() {
  ok('undefined' !== typeof($.simplicityHaversineDistanceKm), 'undefined widget: $.simplicityHaversineDistanceKm');
});

// Maps
test("defines $.ui.simplicityGoogleMap", function() {
  ok('undefined' !== typeof($.ui.simplicityGoogleMap), 'undefined widget: $.ui.simplicityGoogleMap');
});
test("defines $.ui.simplicityGoogleMapResults", function() {
  ok('undefined' !== typeof($.ui.simplicityGoogleMapResults), 'undefined widget: $.ui.simplicityGoogleMapResults');
});
test("defines $.ui.simplicityGoogleMapBoundsCoordinator", function() {
  ok('undefined' !== typeof($.ui.simplicityGoogleMapBoundsCoordinator), 'undefined widget: $.ui.simplicityGoogleMapBoundsCoordinator');
});
test("defines $.ui.simplicityGoogleMapBoundsTracker", function() {
  ok('undefined' !== typeof($.ui.simplicityGoogleMapBoundsTracker), 'undefined widget: $.ui.simplicityGoogleMapBoundsTracker');
});
test("defines $.ui.simplicityGoogleMapLoader", function() {
  ok('undefined' !== typeof($.ui.simplicityGoogleMapLoader), 'undefined widget: $.ui.simplicityGoogleMapLoader');
});
test("defines $.simplicityGoogleMarker", function() {
  ok('undefined' !== typeof($.simplicityGoogleMarker), 'undefined widget: $.simplicityGoogleMarker');
});
test("defines $.simplicityGoogleMarker.OverlayMarker", function() {
  ok('undefined' !== typeof($.simplicityGoogleMarker.OverlayMarker), 'undefined widget: $.simplicityGoogleMarker.OverlayMarker');
});
test("defines $.ui.simplicityBingMap", function() {
  ok('undefined' !== typeof($.ui.simplicityBingMap), 'undefined widget: $.ui.simplicityBingMap');
});
test("defines $.ui.simplicityBingMapResults", function() {
  ok('undefined' !== typeof($.ui.simplicityBingMapResults), 'undefined widget: $.ui.simplicityBingMapResults');
});
test("defines $.ui.simplicityBingMapBoundsCoordinator", function() {
  ok('undefined' !== typeof($.ui.simplicityBingMapBoundsCoordinator), 'undefined widget: $.ui.simplicityBingMapBoundsCoordinator');
});
test("defines $.ui.simplicityBingMapBoundsTracker", function() {
  ok('undefined' !== typeof($.ui.simplicityBingMapBoundsTracker), 'undefined widget: $.ui.simplicityBingMapBoundsTracker');
});
test("defines $.ui.simplicityMapQuestMap", function() {
  ok('undefined' !== typeof($.ui.simplicityMapQuestMap), 'undefined widget: $.ui.simplicityMapQuestMap');
});
test("defines $.ui.simplicityMapQuestMapResults", function() {
  ok('undefined' !== typeof($.ui.simplicityMapQuestMapResults), 'undefined widget: $.ui.simplicityMapQuestMapResults');
});
test("defines $.ui.simplicityMapQuestMapBoundsCoordinator", function() {
  ok('undefined' !== typeof($.ui.simplicityMapQuestMapBoundsCoordinator), 'undefined widget: $.ui.simplicityMapQuestMapBoundsCoordinator');
});
test("defines $.ui.simplicityMapQuestMapBoundsTracker", function() {
  ok('undefined' !== typeof($.ui.simplicityMapQuestMapBoundsTracker), 'undefined widget: $.ui.simplicityMapQuestMapBoundsTracker');
});
test("defines $.ui.simplicityYahooMap", function() {
  ok('undefined' !== typeof($.ui.simplicityYahooMap), 'undefined widget: $.ui.simplicityYahooMap');
});
test("defines $.ui.simplicityYahooMapResults", function() {
  ok('undefined' !== typeof($.ui.simplicityYahooMapResults), 'undefined widget: $.ui.simplicityYahooMapResults');
});
test("defines $.ui.simplicityYahooMapBoundsCoordinator", function() {
  ok('undefined' !== typeof($.ui.simplicityYahooMapBoundsCoordinator), 'undefined widget: $.ui.simplicityYahooMapBoundsCoordinator');
});
test("defines $.ui.simplicityYahooMapBoundsTracker", function() {
  ok('undefined' !== typeof($.ui.simplicityYahooMapBoundsTracker), 'undefined widget: $.ui.simplicityYahooMapBoundsTracker');
});
test("defines $.ui.simplicityNokiaMap", function() {
  ok('undefined' !== typeof($.ui.simplicityNokiaMap), 'undefined widget: $.ui.simplicityNokiaMap');
});
test("defines $.ui.simplicityNokiaMapResults", function() {
  ok('undefined' !== typeof($.ui.simplicityNokiaMapResults), 'undefined widget: $.ui.simplicityNokiaMapResults');
});
test("defines $.ui.simplicityNokiaMapBoundsCoordinator", function() {
  ok('undefined' !== typeof($.ui.simplicityNokiaMapBoundsCoordinator), 'undefined widget: $.ui.simplicityNokiaMapBoundsCoordinator');
});
test("defines $.ui.simplicityNokiaMapBoundsTracker", function() {
  ok('undefined' !== typeof($.ui.simplicityNokiaMapBoundsTracker), 'undefined widget: $.ui.simplicityNokiaMapBoundsTracker');
});

// Geocoders
test("defines $.ui.simplicityGoogleGeocoder", function() {
  ok('undefined' !== typeof($.ui.simplicityGoogleGeocoder), 'undefined widget: $.ui.simplicityGoogleGeocoder');
});
test("defines $.ui.simplicityBingGeocoder", function() {
  ok('undefined' !== typeof($.ui.simplicityBingGeocoder), 'undefined widget: $.ui.simplicityBingGeocoder');
});
test("defines $.ui.simplicityMapQuestGeocoder", function() {
  ok('undefined' !== typeof($.ui.simplicityMapQuestGeocoder), 'undefined widget: $.ui.simplicityMapQuestGeocoder');
});
test("defines $.ui.simplicityYahooGeocoder", function() {
  ok('undefined' !== typeof($.ui.simplicityYahooGeocoder), 'undefined widget: $.ui.simplicityYahooGeocoder');
});
test("defines $.ui.simplicityNokiaGeocoder", function() {
  ok('undefined' !== typeof($.ui.simplicityNokiaGeocoder), 'undefined widget: $.ui.simplicityNokiaGeocoder');
});
