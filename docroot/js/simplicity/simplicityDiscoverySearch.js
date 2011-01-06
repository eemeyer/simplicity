/**
 * @name $.ui.simplicityDiscoverySearch
 * @namespace Performs a search against the Discovery Search Engine
 */
(function ($) {
  $.widget("ui.simplicityDiscoverySearch", {
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
            'error': true,
            'statusText': xhr.statusText,
            'status': xhr.status,
            'resultsHtml': xhr.responseText
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
      this.bucketCounts(this._extractBucketCounts(discoveryResponse), triggerEvent);
      this.resultSet(this._extractResultSet(discoveryResponse), triggerEvent);
    },
    bucketCounts: function (bucketCounts, triggerEvent) {
      if (arguments.length === 0) {
        return JSON.parse(this._bucketCounts);
      }
      this._bucketCounts = JSON.stringify(bucketCounts);
      if (triggerEvent !== false) {
        this.element.triggerHandler('simplicityBucketCounts', [JSON.parse(this._bucketCounts)]);
      }
    },
    resultSet: function (resultSet, triggerEvent) {
      if (arguments.length === 0) {
        return JSON.parse(this._resultSet);
      }
      this._resultSet = JSON.stringify(resultSet);
      if (triggerEvent !== false) {
        this.element.triggerHandler('simplicityResultSet', [JSON.parse(this._resultSet)]);
      }
    },
    // Converts facet counts to a more simple format
    // From:
    // {
    //   drillDown: [
    //     {
    //       dimension: shape,
    //       ids: ['abc'],
    //       exactCounts: [1],
    //       fuzzyCounts: [1]
    //     }
    //   ]
    // }
    // To:
    // {
    //   shape: {
    //     exact: {'abc': 1},
    //     fuzzy: {'abc': 1},
    //     isolatedExact: {'abc': 1},
    //     fuzzyExact: {'abc': 1},
    //   }
    // }
    _extractBucketCounts: function (discoveryResponse) {
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
    // Converts
    // {
    //   startIndex: 0
    //   pageSize: 10,
    //   currentPageSize: 10,
    //   exactSize: 2,
    //   totalSize: 120,
    //   datasetSize: 55000,
    //   itemIds: ['a', 'b', 'c'],
    //   relevanceValues: [1.0, 1.0, 0.9],
    //   exactMatches: [true, true, false],
    //   properties: [
    //     {title: 'aaa'},
    //     {title: 'bbb'},
    //     {title: 'ccc'}
    //   ],
    //   highlighting: [
    //     {},
    //     {'title': '<b>bbb</b>'},
    //     {}
    //   ]
    // }
    // To
    // {
    //   startIndex: 0,
    //   pageSize: 10,
    //   exactSize: 2,
    //   totalSize: 120,
    //   datasetSize: 55000,
    //   numRows: 10,
    //   rows: [
    //     {
    //       id: 'a',
    //       exact: true,
    //       score: 1.0
    //       properties: {
    //         title: 'aaa'
    //       },
    //       highlighting: {}
    //     },
    //     {
    //       id: 'b',
    //       exact: true,
    //       score: 1.0
    //       properties: {
    //         title: 'bbb'
    //       },
    //       highlighting: {
    //         title: '<b>bbb</b>'
    //       }
    //     },
    //     {
    //       id: 'c',
    //       exact: false,
    //       score: 0.9
    //       properties: {
    //         title: 'ccc'
    //       },
    //       highlighting: {}
    //     }
    //   ]
    // }
    _extractResultSet: function (discoveryResponse) {
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
