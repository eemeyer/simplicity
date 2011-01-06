/**
 * @name $.ui.simplicityPagination
 * @namespace Pagination widget for simplicityDiscoverySearch
 */
(function ($) {
  $.widget("ui.simplicityPagination", {
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
