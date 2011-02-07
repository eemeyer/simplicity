/**
 * @name $.ui.simplicityDiscoverySearch
 * @namespace Performs a search against the Discovery Search Engine
 *
 * @example
 *   $('body').simplicityState();
 *   // Create all simplicityInputs widgets
 *   $('body')
 *     .simplicityState('mergeQueryParams')
 *     .simplicityHistory()
 *     .simplicityState('triggerChangeEvent')
 *     .simplicityPageSnapBack()
 *     <b>.simplicityDiscoverySearch({
 *       url: 'search_controller.php'
 *     })</b>
 *     <b>.simplicityDiscoverySearch('search');</b>
 */
(function ($) {
  $.widget("ui.simplicityDiscoverySearch", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>stateElement</dt>
     *   <dd>
     *     The location of the simplicityState widget. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>searchOnStateChange</dt>
     *   <dd>
     *     When <code>true</code> triggers a search everytime the state changes. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>initialSearchResponse</dt>
     *   <dd>
     *     The initial search response. Used when a page has a server-side search triggered during load.
     *     Defaults to <code>{}</code>.
     *   </dd>
     *   <dt>debug</dt>
     *   <dd>
     *     Enable logging of key events to <code>console.log</code>. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityDiscoverySearch.options
     */
    options : {
      stateElement: 'body',
      searchOnStateChange: true,
      initialSearchResponse: {},
      debug: false
    },
    _create : function () {
      this.element.addClass('ui-simplicity-discovery-search');
      this.searchResponse(JSON.stringify(this.options.initialSearchResponse), false);
      $(this.options.stateElement).bind('simplicityStateChange', $.proxy(this._stateChangeHandler, this));
    },
    _stateChangeHandler: function (evt, state) {
      if (this.options.searchOnStateChange) {
        this.search(state);
      }
    },
    /**
     * Runs a search. The search happens asynchronously and will trigger multiple events.
     * <ul>
     *   <li>simplicitySearchResponse (original response)</li>
     *   <li>simplicityBucketCounts</li>
     *   <li>simplicityResultSet</li>
     * </ul>
     *
     * @param searchState
     *   The search state as a JSON compatible <code>Object</code>. This is an optional parameter,
     *   if not specified the search state is obtained from the <code>simplicityState</code> widget.
     *
     * @name $.ui.simplicityDiscoverySearch.search
     * @function
     *
     * @example
     *   // Bind to a search button
     *   $('#searchButton').click(function (evt) {
     *     $('body').simplicityDiscoverySearch('search');
     *   });
     */
    search: function (searchState) {
      if (arguments.length === 0) {
        searchState = $(this.options.stateElement).simplicityState('state');
      }
      if (this.options.debug) {
        console.log('Searching for ', this.element, 'with state', searchState);
      }
      $.ajax({
        url: this.options.url,
        type: 'GET',
        contentType: 'application/json',
        data: searchState,
        dataType: 'json',
        cache: false,
        error: $.proxy(function (xhr, textStatus, errorThrown) {
          if (this.options.debug) {
            console.log('Search error for', this.element, '[' + xhr.status + '] ' + xhr.statusText, arguments);
          }
          this.searchResponse({
            error: true,
            statusText: xhr.statusText,
            status: xhr.status,
            resultsHtml: xhr.responseText
          });
        }, this),
        success: $.proxy(function (data, textStatus, xhr) {
          if (this.options.debug) {
            console.log('Search success for', this.element, 'with response', data);
          }
          this.searchResponse(data);
        }, this)
      });
    },
    /**
     * Get or set (and process) the search response. Called with no arguments to retrieve the
     * last response. Called with arguments to process the current response (called by
     * <code>search</code> on success or failure).
     *
     * In processing mode, this method triggers a <code>simplicitySearchResponse</code>
     * event and then calls <code>bucketCounts</code> and <code>resultSet</code>.
     *
     *
     * @param searchResponse
     *   The search response to process.
     * @param triggerEvent
     *   Optional parameter, set it to <code>false</code> to prevent triggering of events.
     *   Defaults to <code>true</code> if not specified.
     *
     * @example
     *   // Get the last search response
     *   var response = $('body').simplicityDiscoverySearch('searchResponse');
     *
     * @example
     *   // Process a fake search response for testing purposes
     *   var response = {
     *     // Fake response
     *   };
     *   $('body').simplicityDiscoverySearch('searchResponse', response);
     *
     * @name $.ui.simplicityDiscoverySearch.searchResponse
     * @function
     */
    searchResponse: function (searchResponse, triggerEvent) {
      if (arguments.length === 0) {
        return JSON.parse(this._searchResponse);
      }
      this._searchResponse = JSON.stringify(searchResponse);
      if (triggerEvent !== false) {
        this.element.triggerHandler('simplicitySearchResponse',
            [JSON.parse(this._searchResponse)]);
      }
      var discoveryResponse = searchResponse._discovery || {};
      discoveryResponse = discoveryResponse.response || {};
      this.bucketCounts(this.extractBucketCounts(discoveryResponse), triggerEvent);
      this.resultSet(this.extractResultSet(discoveryResponse), triggerEvent);
    },
    /**
     * Get the or set the bucket counts. Called with no arguments for get behavior.
     * Triggers a <code>simplicityBucketCounts</code> event on set.
     *
     * @param bucketCounts
     *   The bucket counts to store.
     * @param triggerEvent
     *   Optional parameter, set it to <code>false</code> to prevent triggering of events.
     *   Defaults to <code>true</code> if not specified.
     *
     * @name $.ui.simplicityDiscoverySearch.bucketCounts
     * @function
     */
    bucketCounts: function (bucketCounts, triggerEvent) {
      if (arguments.length === 0) {
        return JSON.parse(this._bucketCounts);
      }
      this._bucketCounts = JSON.stringify(bucketCounts);
      if (triggerEvent !== false) {
        this.element.triggerHandler('simplicityBucketCounts', [JSON.parse(this._bucketCounts)]);
      }
    },
    /**
     * Get the or set the resultset. Called with no arguments for get behavior.
     * Triggers a <code>simplicityResultSet</code> event on set.
     *
     * @param bucketCounts
     *   The bucket counts to store.
     * @param triggerEvent
     *   Optional parameter, set it to <code>false</code> to prevent triggering of events.
     *   Defaults to <code>true</code> if not specified.
     *
     * @name $.ui.simplicityDiscoverySearch.resultSet
     * @function
     */
    resultSet: function (resultSet, triggerEvent) {
      if (arguments.length === 0) {
        return JSON.parse(this._resultSet);
      }
      this._resultSet = JSON.stringify(resultSet);
      if (triggerEvent !== false) {
        this.element.triggerHandler('simplicityResultSet', [JSON.parse(this._resultSet)]);
      }
    },
    /**
     * Converts the search response to a bucket counts object.
     *
     * @example
     *   Input
     *   {
     *     drillDown: [
     *       {
     *         dimension: shape,
     *         ids: ['a', 'b', 'c'],
     *         exactCounts: [1, 3, 4],
     *         fuzzyCounts: [2, 6, 8]
     *       }
     *     ]
     *   }
     *
     * @example
     *   Output
     *   {
     *     shape: {
     *       exact: {'a': 1, 'b': 3, 'c': 4},
     *       fuzzy: {'a': 2, 'b': 6, 'c': 8}
     *     }
     *   }
     *
     * @param discoveryResponse
     * @name $.ui.simplicityDiscoverySearch.extractBucketCounts
     * @function
     */
    extractBucketCounts: function (discoveryResponse) {
      var bucketCounts = {};
      if ($.isArray(discoveryResponse.drillDown)) {
        $.each(discoveryResponse.drillDown, function (idx, elem) {
          var dimFacetCounts = bucketCounts[elem.dimension] || {};
          bucketCounts[elem.dimension] = dimFacetCounts;
          var exactCounts = dimFacetCounts.exact || {};
          dimFacetCounts.exact = exactCounts;
          var fuzzyCounts = dimFacetCounts.fuzzy || {};
          dimFacetCounts.fuzzy = fuzzyCounts;
          $.each(elem.ids, function (idx, id) {
            exactCounts[id] = elem.exactCounts[idx];
            fuzzyCounts[id] = elem.fuzzyCounts[idx];
          });
        });
      }
      return bucketCounts;
    },
    /**
     * Converts the search response to a resultset object.
     * @example
     *   Input
     *   {
     *     startIndex: 0
     *     pageSize: 10,
     *     currentPageSize: 10,
     *     exactSize: 2,
     *     totalSize: 120,
     *     datasetSize: 55000,
     *     itemIds: ['a', 'b', 'c'],
     *     relevanceValues: [1.0, 1.0, 0.9],
     *     exactMatches: [true, true, false],
     *     properties: [
     *       {title: 'aaa'},
     *       {title: 'bbb'},
     *       {title: 'ccc'}
     *     ],
     *     highlighting: [
     *       {},
     *       {'title': '[b]bbb[/b]'},
     *       {}
     *     ]
     *   }
     *
     * @example
     *   Output
     *   <pre>
     *   {
     *     startIndex: 0,
     *     pageSize: 10,
     *     exactSize: 2,
     *     totalSize: 120,
     *     datasetSize: 55000,
     *     numRows: 10,
     *     rows: [
     *       {
     *         id: 'a',
     *         exact: true,
     *         score: 1.0
     *         properties: {
     *           title: 'aaa'
     *         },
     *         highlighting: {}
     *       },
     *       {
     *         id: 'b',
     *         exact: true,
     *         score: 1.0
     *         properties: {
     *           title: 'bbb'
     *         },
     *         highlighting: {
     *           title: '[b]bbb[/b]'
     *         }
     *       },
     *       {
     *         id: 'c',
     *         exact: false,
     *         score: 0.9
     *         properties: {
     *           title: 'ccc'
     *         },
     *         highlighting: {}
     *       }
     *     ]
     *   }
     *   </pre>
     *
     * @param discoveryResponse
     * @name $.ui.simplicityDiscoverySearch.extractResultSet
     * @function
     */
    extractResultSet: function (discoveryResponse) {
      var resultSet = {
        startIndex: discoveryResponse.startIndex || 0,
        pageSize: discoveryResponse.pageSize || 0,
        exactSize: discoveryResponse.exactSize || 0,
        totalSize: discoveryResponse.totalSize || 0,
        datasetSize: discoveryResponse.datasetSize || 0
      };
      var rows = [];
      if ('undefined' !== typeof discoveryResponse.itemIds) {
        var itemIds = discoveryResponse.itemIds;
        var exactMatches = discoveryResponse.exactMatches;
        var relevanceValues = discoveryResponse.relevanceValues;
        var properties = discoveryResponse.properties;
        var highlighting = discoveryResponse.highlighting;
        if (!$.isArray(properties)) {
          properties = null;
        }
        if (!$.isArray(highlighting)) {
          highlighting = null;
        }
        $.each(itemIds, function (idx, itemId) {
          row = {
            id: itemId,
            exact: exactMatches[idx],
            score: relevanceValues[idx]
          };
          if (properties !== null) {
            row.properties = properties[idx];
          }
          if (highlighting !== null) {
            row.highlighting = highlighting[idx];
          }
          rows.push(row);
        });
      }
      resultSet.numRows = rows.length;
      resultSet.rows = rows;
      return resultSet;
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-discovery-search');
      $(this.options.stateElement).unbind('simplicityStateChange', this._stateChangeHandler);
      this.element.unbind('change', this._changeHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
