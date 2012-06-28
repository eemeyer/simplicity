/**
 * @name $.ui.simplicityPagination
 * @namespace Pagination widget for simplicityDiscoverySearch.
 * <p>
 * Pagination widget bound to the <code>simplicitySearchResponse</code> event.
 * <p>
 * The current page can be bound either via an <code>input</code> element or
 * directly to the <code>simplicityState</code>.
 *
 * @example
 *   // Bound directly to simplicityState
 *   &lt;div id="pagination">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#pagination').simplicityPagination();
 *   &lt;/script>
 *
 * @example
 *   // Bound to an input
 *   &lt;input id="page" name="page" />
 *   &lt;div id="pagination">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#page').simplicityInputs();
 *     $('#pagination').simplicityPagination({
 *       input: '#page'
 *     });
 *   &lt;/script>
 */
(function ($) {
  $.widget("ui.simplicityPagination", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>stateElement</dt>
     *   <dd>
     *     The location of the simplicityState widget. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The location of the simplicityDiscoverySearch widget. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>pageParam</dt>
     *   <dd>
     *     Used when binding directly to the <code>simplicityState</code> and determines which
     *     field the state holds the current page number. Defaults to <code>'page'</code>.
     *   </dd>
     *   <dt>input</dt>
     *   <dd>
     *     When set binds the current page to an <code>input</code> element instead of directly
     *     to the state via <code>pageParam</code>. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>applyClass</dt>
     *   <dd>
     *     Classes to apply to the Next, Prev and Page elements. Defaults to <code>ui-corner-all</code>.
     *   </dd>
     *   <dt>debug</dt>
     *   <dd>
     *     Enable logging of key events to <code>console.log</code>. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityPagination.options
     */
    options : {
      stateElement: 'body',
      searchElement: 'body',
      pageParam: 'page',
      input: '',
      applyClass: 'ui-corner-all',
      debug: false
    },
    _create : function () {
      this
        ._addClass('ui-simplicity-pagination')
        ._bind(this.options.searchElement, 'simplicitySearchResponse', this._searchResponseHandler)
        ._bind(this.options.stateElement, 'simplicityStateReset', this._stateResetHandler);
    },
    /**
     * Event handler for the <code>simplicitySearchResponse</code> event. Recreates
     * the pagination widget to reflect the current search response.
     *
     * @name $.ui.simplicityPagination._searchResponseHandler
     * @function
     * @private
     */
    _searchResponseHandler: function (evt, searchResponse) {
      var target = $('<div/>');
      if (searchResponse) {
        var discoveryResponse = searchResponse._discovery || {};
        var resultSet = discoveryResponse.response || {};
        var numItems = resultSet.totalSize;
        var itemsPerPage = resultSet.pageSize;
        var currentPage = resultSet.startIndex / itemsPerPage;
        try {
          this._ignoreCallback = true;
          target.pagination(
            numItems,
            $.extend({
              current_page: currentPage,
              items_per_page: itemsPerPage,
              callback: $.proxy(this._paginationCallback, this)
            }, this.options)
          );
          target.find('a')
            .addClass('ui-state-default')
            .addClass(this.options.applyClass);
          target.find('span.current').each($.proxy(function (idx, ele) {
            var span = $(ele);
            if (span.hasClass("prev") || span.hasClass("next")) {
              span
                .addClass('ui-state-disabled ui-priority-primary')
                .addClass(this.options.applyClass);
            } else {
              span
                .addClass('ui-state-active ui-priority-primary')
                .addClass(this.options.applyClass);
            }
          }, this));
          this.element.find('div.pagination').remove();
          this.element.append(target.find('div.pagination'));
        } finally {
          this._ignoreCallback = false;
        }
      }
    },
    /**
     * Callback for the upstream pagination widget that gets called when a page change action
     * has been taken.
     *
     * @name $.ui.simplicityPagination._paginationCallback
     * @function
     * @private
     */
    _paginationCallback: function (page) {
      if (!this._ignoreCallback) {
        if (this.options.input !== '') {
          // Store the page in an input
          $(this.options.input).val(page + 1);
          $(this.options.input).change();
        } else {
          // Store the page directly in the search state
          var state = $(this.options.stateElement).simplicityState('state');
          state[this.options.pageParam] = String(page + 1);
          $(this.options.stateElement).simplicityState('state', state);
        }
        if (this.options.searchElement !== '') {
          if (false === $(this.options.searchElement).simplicityDiscoverySearch('option', 'searchOnStateChange')) {
            $(this.options.searchElement).simplicityDiscoverySearch('search');
          }
        }
      }
      return false;
    },
    /**
     * Event handler for the <code>simplicityStateReset</code> event. Resets the current page
     * if the <code>pageParam</code> option is set.
     *
     * @name $.ui.simplicityPagination._stateResetHandler
     * @function
     * @private
     */
    _stateResetHandler: function (evt, state) {
      if (this.options.input === '') {
        if (this.options.debug) {
          console.log('simplicityPagination: Resetting state parameter', name, 'for', this.element);
        }
        delete state[this.options.pageParam];
      }
    }
  });
}(jQuery));
