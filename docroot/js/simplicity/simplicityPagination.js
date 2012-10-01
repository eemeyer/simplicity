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
(function ($, window) {
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
     *   <dt>scrollTopSelector</dt>
     *   <dd>
     *     Determines the jQuery selector to apply <code>$(window).scrollTop(0)</code> when
     *     a page changes. Defaults to <code>window</code>.
     *   </dd>
     *   <dt>scrollTopPosition</dt>
     *   <dd>
     *     Determines the scroll top position to use for <code>$(window).scrollTop(0)</code>. Defaults to <code>0</code>.
     *   </dd>
     *   <dt>num_display_entries</dt>
     *   <dd>
     *     Maximum number of pagination links to display.
     *     Setting to <code>0</code> will trim the navigation down to simply, "Previous" and "Next" links.
     *     Use an odd number so the current page will be displayed in the center of the
     *     page links when there are more than <code>num_display_entries</code> pages. Defaults to <code>11</code>.
     *   </dd>
     *   <dt>num_edge_entries</dt>
     *   <dd>
     *     Number of page links to show at the min and max range regardless of other constraints.
     *     If this number is set to 1, then links to the first and the last page are shown regardless of the current page
     *     and the visibility constraints set by num_display_entries. Setting to a larger number shows more links.
     *     Defaults to  <code>0</code>.
     *   </dd>
     *   <dt>link_to</dt>
     *   <dd>
     *     <code>href</code> template for the pagination links. The special value <code>__id__</code> will be replaced by the
     *     page number. Defaults to <code>#</code>.
     *   </dd>
     *   <dt>prev_text</dt>
     *   <dd>
     *     Text for the "previous" link. Setting to an empty string will omit the link. Defaults to <code>Prev</code>.
     *   </dd>
     *   <dt>next_text</dt>
     *     Text for the "next" link. Setting to an empty string will omit the link. Defaults to <code>Next</code>.
     *   <dd>
     *   </dd>
     *   <dt>ellipse_text</dt>
     *   <dd>
     *      When there is a gap between the numbers created by num_edge_entries and the displayed number interval,
     *      this text is inserted into the gap (in a span tag). Setting to an empty string omits the additional tag.
     *      Defaults to <code>...</code>.
     *   </dd>
     *   <dt>prev_show_always</dt>
     *   <dd>
     *     When set to false, the "previous"-link is only shown if there is a previous page. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>next_show_always</dt>
     *   <dd>
     *     When set to false, the "next"-link is only shown if there is a next page. Defaults to <code>true</code>.
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
      scrollTopSelector: window,
      scrollTopPosition: 0,
      // for compatibility with jquery.pagination
      num_display_entries: 11,
      num_edge_entries: 0,
      link_to: '#',
      prev_text: 'Prev',
      next_text: 'Next',
      ellipse_text: '...',
      prev_show_always: true,
      next_show_always: true,
      debug: false
    },
    _create : function () {
      this
        ._addClass('ui-simplicity-pagination')
        ._bind(this.options.searchElement, 'simplicitySearchResponse', this._searchResponseHandler)
        ._bind(this.options.stateElement, 'simplicityStateReset', this._stateResetHandler)
        ._bind(this.element, 'setPage', this.setPage)
        ._bind(this.element, 'prevPage', this.prevPage)
        ._bind(this.element, 'nextPage', this.nextPage);
      this.element.append($('<div class="pagination"/>'));
    },
    /**
     * Move to a specific page in the results. Causes a new search.
     *
     * @name $.ui.simplicityPagination.setPage
     * @function
     */
    setPage: function (evt, page) {
      this._setPage(page);
    },
    /**
     * Move to the next page in the results. Causes a new search if the last search indicated that there will be a next page.
     *
     * @name $.ui.simplicityPagination.nextPage
     * @function
     */
    nextPage: function (evt) {
      var page = (this.element.data('currentPage')  || 0) + 1;
      this._setPage(page);
    },
    /**
     * Move to the previous page in the results. Causes a new search if the current page is not the first page.
     *
     * @name $.ui.simplicityPagination.prevPage
     * @function
     */
    prevPage: function (evt) {
      var page = (this.element.data('currentPage')  || 0) - 1;
      this._setPage(page);
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
        var resultSet = discoveryResponse.response || {startIndex: 0, pageSize: 0, totalSize: 0};
        var numPages = Math.ceil(resultSet.totalSize / resultSet.pageSize);
        var currentPage = resultSet.startIndex / resultSet.pageSize;
        this.element.data('currentPage', currentPage);
        try {
          this._ignoreCallback = true;
          var startEnd = this._getStartEnd(currentPage, numPages);
          var start = startEnd[0];
          var end = startEnd[1];
          if (this.options.prev_text && (this.options.prev_show_always || currentPage > 0)) {
            target.append(this._makeLink(currentPage - 1, currentPage, numPages, this.options.prev_text, 'prev'));
          }
          if (start > 0 && this.options.num_edge_entries > 0) {
            var lowEnd = Math.min(this.options.num_edge_entries, start);
            this._makeLinks(target, currentPage, numPages, 0, lowEnd, 'sp');
            if (this.options.ellipse_text && this.options.num_edge_entries < start) {
              $('<span/>').text(this.options.ellipse_text).appendTo(target);
            }
          }
          this._makeLinks(target, currentPage, numPages, start, end);
          if (end > numPages && this.options.num_edge_entries > 0) {
            if (this.options.ellipse_text && numPages - this.options.num_edge_entries > end) {
              $('<span/>').text(this.options.ellipse_text).appendTo(target);
            }
            var startHigh = Math.max(numPages - this.options.num_edge_entries, end);
            this._makeLinks(target, currentPage, numPages, startHigh, numPages, 'ep');
          }
          if (this.options.next_text && (this.options.next_show_always || currentPage < numPages - 1)) {
            target.append(this._makeLink(currentPage + 1, currentPage, numPages, this.options.next_text, 'next'));
          }
          this.element.find('div.pagination').html(target);
        } finally {
          this._ignoreCallback = false;
        }
      }
    },
    /**
     * Helper that makes a range of pagination links, appending them to the parent.
     *
     * @name $.ui.simplicityPagination._makeLinks
     * @function
     * @private
     */
    _makeLinks: function (parent, currentPage, numPages, start, end, classes) {
      var i = start;
      for (; i < end; i += 1) {
        this._makeLink(i, currentPage, numPages, i + 1, classes).appendTo(parent);
      }
    },
    /**
     * Helper that makes a pagination link. All element event handlers and data are set in this method, so returned link is ready
     * to be used.
     *
     * @name $.ui.simplicityPagination._makeLink
     * @function
     * @private
     */
    _makeLink: function (page, currentPage, numPages, text, classes) {
      if (page < 0) {
        page = 0;
      } else if (page >= numPages) {
        page = numPages - 1;
      }
      var result = $('<a/>');
      if (page === currentPage) {
        result = $('<span/>').addClass('current ui-priority-primary').text(text);
      } else {
        result = $('<a/>')
          .attr('href', this.options.link_to.replace(/__id__/, page))
          .text(text)
          .addClass('ui-state-default')
          .click($.proxy(this._paginationCallback, this));
      }
      if (classes) {
        result.addClass(classes);
      }
      result.addClass(this.options.applyClass);
      result.data('page', page);
      if (page === currentPage) {
        cssClass = ((result.attr('class') || '').match(/\bprev\b|\bnext\b/g)) ? 'ui-state-disabled' : 'ui-state-active';
        result.addClass(cssClass);
      }
      return result;
    },
    /**
     * Calculates the range of pagination links that might be displayed based on <code>num_display_entries</code>,
     * <code>currentPage</code>, and <code>numPages</code>.
     *
     * @name $.ui.simplicityPagination._getStartEnd
     * @function
     * @private
     */
    _getStartEnd: function (currentPage, numPages) {
      var halfNumEntries = Math.floor(this.options.num_display_entries / 2);
      var max = numPages - this.options.num_display_entries;
      var start = 0;
      if (currentPage > halfNumEntries) {
        start = Math.max(Math.min(currentPage - halfNumEntries, max), 0);
      }
      var end = 0;
      if (currentPage > halfNumEntries) {
        end = Math.min(currentPage + halfNumEntries + this.options.num_display_entries % 2, numPages);
      } else {
        end = Math.min(this.options.num_display_entries, numPages);
      }
      return [start, end];
    },
    /**
     * Callback for when a pagination link is clicked.
     *
     * @name $.ui.simplicityPagination._paginationCallback
     * @function
     * @private
     */
    _paginationCallback: function (evt) {
      var page = $(evt.target).data('page');
      this._setPage(page);
      return false;
    },
    /**
     * Changes the underlying search to reflect the requested page if page is different from the current page.
     *
     * @name $.ui.simplicityPagination._setPage
     * @function
     * @private
     */
    _setPage: function (page) {
      var currentPage = this.element.data('currentPage');
      if (page !== currentPage && page >= 0) {
        if (!this._ignoreCallback) {
          if (this.options.scrollTopSelector !== '') {
            $(this.options.scrollTopSelector).scrollTop(this.options.scrollTopPosition);
          }
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
      }
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
}(jQuery, window));
