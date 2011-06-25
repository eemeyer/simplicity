/**
 * @name $.ui.simplicityPagination
 * @namespace Pagination widget for simplicityDiscoverySearch.
 * <p>
 * Pagination widget bound to the <code>simplicityResultSet</code> event.
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
  $.widget("ui.simplicityPagination", {
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
     *     When set binds the current page to an <code>input</code> element instead of directly
     *     to the state via <code>pageParam</code>. Defaults to <code>''</code>.
     *   <dd>
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
      debug: false
    },
    _create : function () {
      this.element.addClass('ui-simplicity-pagination');
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
      $(this.options.stateElement).bind('simplicityStateReset', $.proxy(this._stateResetHandler, this));
    },
    /**
     * Event handler for the <code>simplicityResultSet</code> event. Recreates
     * the pagination widget to reflect the current search response.
     *
     * @name $.ui.simplicityPagination._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, resultSet) {
      var target = $('<div/>');
      var numItems = resultSet.totalSize;
      var itemsPerPage = resultSet.pageSize;
      var currentPage = resultSet.startIndex / itemsPerPage;
      try {
        this._ignoreCallback = true;
        target.pagination(
          numItems,
          {
            current_page: currentPage,
            items_per_page: itemsPerPage,
            callback: $.proxy(this._paginationCallback, this)
          }
        );
        target.find('a').addClass('ui-corner-all ui-state-default');
        target.find('span.current').addClass('ui-corner-all ui-state-active');
        this.element.find('div.pagination').remove();
        this.element.append(target.find('div.pagination'));
      } finally {
        this._ignoreCallback = false;
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
          state[this.options.pageParam] = page + 1;
          $(this.options.stateElement).simplicityState('state', state);
        }
        if (this.options.search !== '') {
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
    },
    destroy : function () {
      this.element.removeClass('ui-simplicity-pagination');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $(this.options.stateElement).unbind('simplicityStateReset', this._stateResetHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
