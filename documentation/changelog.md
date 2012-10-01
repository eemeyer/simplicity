---
layout: default
nav: changelog
title: changelog
subhead: Changelog
lead: What's new, doc?
---

<h1>3.1</h1>
<div class="release-date">2012-08-14</div>

Compatibility
-------------

* `simplicityGoogleMapBoundsTracker` no longer considers a bounds change during drag unless you set the `idleWhileDragging` option to `true`.

Improvements
------------

* Enhances simplicityDiscoverySearch to support CORS direct engine requests.
* Enhances simplicityDiscoverySearch to make extracting a result set optional.
* Changes default behavior of `simplicityGoogleMapBoundsTracker` so that bounds event is not triggered when dragging. It now only triggers the bounds event if the map bounds actually changed.
* Optimizes buffered shape creation and updating in the shape creator widgets.
* Fixes to `simplicityMapShapeCreator` and `simplicityMapeShapeCreatorUi` to make them easier to use.


<h1>3.0</h1>
<div class="release-date">2012-07-19</div>

Improvements
------------

* Adds geocoding and polygon drawing support to the map widgets. The new widgets are `simplicityGoogleMapShapeCreator`, `simplicityMapQuestMapShapeCreator`, `simplicityBingMapShapeCreator`, `simplicityNokiaMapShapeCreator` and `simplicityMapShapeCreatorUi`.
* Conditionally applies autoFocus patch to ui.autocomplete, for versions before 1.9 of jQuery UI.
* Adds `simplicitySearchSearching` event to `simplicityDiscoverySearch`.
* Passes `window` into the anonymous functions that define `simplicityHistory`, `simplicityPagination` and `simplicityGoogleMapLoader`, making sure we use the value of `window` at declare time instead of runtime which makes the widget `noConflict` safe.
* Enhances `simplicityPagination` to allow for jQuery selector `.scrollTop()` support when page changes.
* Fixes invalid guard in `simplicityPagination` where the option `search` was used instead of `searchElement`.


<h1>2.9.1</h1>
<div class="release-date">2012-06-22</div>

Compatibility
-------------

* Fixes bug in previous 2.9 release that would caues a JavaScript error if google maps wasn't available before simplicity.

Improvements
------------

* Adds `markerType` option to `simplicityGoogleMapResults`. Possible values are `overlay` (default) or `google`. This allows clients to choose between the standard google marker (google) or our new `simplicityGoogleMarker` (overlay). Adds supporting factory methods to `$.simplicityGoogleMarker`.
* Improves $.simplicityGoogleMarker and removes the need for the Google Maps API to exist before it is declared.

<h1>2.9</h1>
<div class="release-date">2012-06-22</div>

Compatibility
-------------

* The `simplicityHaversine*` functions have moved to `$.simplicityGeoFn`, a shim is in place to call the new variants but any references in your code should be updated to use the new location of these functions.

Improvements
------------

* Consolidates the simplicityHaversine* functions into a new namespace `$.simplicityGeoFn` and adds some extra geographic utility functions to be used by the polygon widget.
* Adds simplicityGoogleMarker, a DOM backed Google Map marker that can be easily styled via CSS.
* Enhances `simplicityDiscoverySearch` to optionally request and deliver query profile responses from the engine. Adds three new widget events that enable customers to manipulate the `$.ajax` parameter options, its success and error methods.
* Adds support for radio buttons to `simplicityFancySelect`.

<h1>2.8</h1>
<div class="release-date">2012-04-12</div>

Improvements
------------

* Enhances simplicityFancyFacets to pass through formatting templates for simplicityFancySelects.
* Enhances `simplicityHistory` to use `#!`, making navigation and resets more user-friendly.
* Applies StandardMarker (Nokia) and adds with default marker numbering and/or zIndex when supported.

<h1>2.7</h1>
<div class="release-date">2012-02-07</div>

Improvements
------------

* Adds support for Nokia map (will replace Yahoo maps).
* Adds `removemarker` event to `simplicity${vendor}MapResults`.

<h1>2.6</h1>
<div class="release-date">2011-12-16</div>

Improvements
------------

* Introduces `simplicityAjaxHelpher` that adds support for cancelling inflight Ajax requests for `simplicityDiscoverySearch`.

<h1>2.5</h1>
<div class="release-date">2011-10-24</div>

Compatibility
-------------

* Replaces the `positionSelector` option of `simplicityFlyout` with `position` that uses standard jQuery UI position options.
* Renames the `missingText` option to `missingCount` for `simplicityFacetCount`.
* The `simplicityFacetCounts` and `simplicityResultSet` events from `simplicityDiscoverySearch` are no longer enabled by default. They have been deprecated and will be removed in a future release. If you wish to use them in the meantime, set the `triggerFacetCountEvent` or `triggerResultSetEvent` option of `simplicityDiscoverySearch` to `true`.
* The `resultSet` field has been removed from the from the `simplicitySearchResponse` event (triggered by `simplicityDiscoverySearch`). If you wish to use this data then use the `simplicityDiscoverySearchItemEnumerator` over the response object.

Improvements
------------

* Introduces `simplicityFancyFacets` a more complex combination of `simplicifyFancyFacet` widgets with support for displaying only some of the available options and making the rest available in a flyout.
* Introduces `simplicityFancySelect` which progressively enhances a select input.
* Introduces `simplicityFacetedSelect` a widget to dynamically populate the option elements of a select input based on the search response.
* Introduces `simplicitySelectSlider`, a single handled slider that maps to a select input. Includes options to display tick marks, labels and a tooltip.
* Improves `simplicityFlyout` to better use `ui-helper-accessible-hidden` and make use of jQuery UI position.
* Adds search counters to `simplicityDiscoverySearch` which are exposed by the `searchStats` and `queryStats` methods.
* Special cases single selection from a select input to not be an array when converted to a state value in `simplicityToState`.
* Adds dynamic option injection logic to `simplicityFromState` to add placeholder options to select inputs if they are missing.
* Fixes bug in `simplicityToState` for multi-select enabled select inputs that contain a default value. Now that empty value is not injected into the state value.
* Improves error handling of ajax queries.
* Adds index counts to the row created by `simplicityDiscoverySearchItemEnumerator` making it easier for customers to include result set positional information using their callbacks: `index0`, `index1`, `resultsIndex0` (position in result set).
* Adds `applyClass` option to `simplicityPagination` which allows you to specify which classes are applied to the pagination elements, e.g. `ui-corner-all`. Also applies `ui-priority-primary` to the "current" elements, uses `ui-state-disabled` for disabled Next/Prev links and `ui-state-active` to the currently displayed page span.
* Removes theme-based formatting for `simplicityPagination`, allowing the jQuery UI theme to dictate presentation.
* Adds css for simplicity slider such that slider handle doesn't glow when selected (Safari).
* Introduces `simplicityProxy` and `simplicityWidget`. The `simplicityWidget` widget is the new base class of all other widgets, allowing us to apply more simple event handling support across the board.
* Fixes logic error in mapOptions handling of simplicityMapQuestMap._initWhenAvailable. Now the defaultMapOptions are respected.
* Removes `resultSet` data usage from the widget set. Adds global helper function `simplicityDiscoverySearchItemEnumerator` to enumerate the searchResponse and use a callback method to process the data.
* Adds support for `facets` API with backwards support for `drillDown`. Moves `drillDown` and `resultSet` response objects to top-level objects and deprecates `simplicityFacetCounts` and `simplicityResultSet` events.
* Converts number to String in `simplicityPagination` to avoid false state change events when reading the page number from the simplicity state which generally uses strings for the values.


<h1>2.4</h1>
<div class="release-date">2011-07-25</div>

Improvements
------------

* Adds JSONP support to simplicityDiscoverySearch and an example of how to use it.
* Adds BSD 2-clause license to the project.

<h1>2.3</h1>
<div class="release-date">2011-04-22</div>

Compatibility
-------------

* Breaks up the map widgets into smaller components. `simplicity${vendor}Map` becomes `simplicity${vendor}Map`, `simplicity${vendor}MapBoundsCoordinator`, `simplicity${vendor}MapBoundsTracker` and `simplicity${vendor}MapResults`.

Improvements
------------

* Fixes bug in geocode widgets, they need to skip bbox normalization if it is missing in from the upstream vendor response.
* Removes vestigial this.element.unbind('change', this._changeHandler) from destroy methods of simplicityDiscoverySearch and simplicityState.


<h1>2.2</h1>
<div class="release-date">2011-02-23</div>

Compatibility
-------------

* Renames the vendor response specific data in the geocode widgets from `response` to `vendor`.

Improvements
------------

* Stops change event propagation from child elements in simplicityInputs.
* Adds a `mapMoveEvents` option to override which map events are used to detect map moves for all four map widgets.
* Productizes `simplicityGoogleMap`, `simplicityBingMap`, `simplicityYahooMap` and `simplicityMapQuestMap` widgets adding support for create, marker and bounds events.
* Introduces `simplicityHaversineDistance`.
* Adds bounding box to the normalized geocode response for the vendors that support it (all but mapquest).
* Adds simplicityDebug which replaces a bunch of copy/pasted code. This widget adds four text areas to the page that show and allow edits to the state, search response, result set and facet counts.


<h1>2.1</h1>
<div class="release-date">2011-02-10</div>

Compatibility
-------------

* Renames `simplicityInput` to `simplicityInputs`
* Renames `simplicityBucketCount` to `simplicityFacetCount` and replaces any references to `bucket` with `facet`.

Improvements
------------

* Updates simplicityMapQuestMap to use the mapinit module to calculate the bestFit rect instead of some custom code.
* Adds jsdoc for all widgets.
* Added trim option to simplicityInputs and simplicityToState which can be used to disable trimming of whitespace from values.
* Introduces the geocoding widgets; `simplicityGoogleGeocoder`, `simplicityBingGeocoder`, `simplicityYahooGeocoder`, `simplicityMapQuestGeocoder`.
* Adds `quietStateChange` option to `simplicityInputs` which allows us to define groups of quiet and hot inputs.
* Adds support for multiple grouped inputs to `simplicityInputs.` This can be used to atomically update multiple input fields at once.
* Improves state event triggering logic in simplicityState to only trigger a changed state if it differs from the last triggered change state and was asked to trigger on change.

<h1>2.0</h1>
<div class="release-date">2011-01-06</div>

Initial release.
