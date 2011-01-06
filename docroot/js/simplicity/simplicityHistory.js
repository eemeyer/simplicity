/**
 * @name $.ui.simplicityHistory
 * @namespace Ajax history widget for simplicityState
 */
(function ($) {
  $.widget("ui.simplicityHistory", {
    options : {
      stateController: 'body',
      noEscape: '[]',
      debug: false
    },
    _create : function () {
      this.element.addClass('ui-simplicity-history');

      if (this.options.noEscape !== '') {
        $.param.fragment.noEscape(this.options.noEscape);
      }

      this.initialState = $(this.options.stateController).simplicityState('state');
      if (this.options.debug) {
        console.log('simplicityHistory: Initial state is', this.initialState);
      }

      var fragment = $.param.fragment();
      if (fragment !== '') {
        var state = $.deparam(fragment);
        if ($.isEmptyObject(state)) {
          if (this.options.debug) {
            console.log('simplicityHistory: Hash state is deparams as empty, ignoring: "' + fragment + '"');
          }
        } else {
          if (this.options.debug) {
            console.log('simplicityHistory: Restoring hash state', state);
          }
          $(this.options.stateController).simplicityState('state', state);
        }
      }
      $(window).bind('hashchange', $.proxy(this._hashChangeHandler, this));
      $(this.options.stateController).bind('simplicityStateChange', $.proxy(this._stateChangeHandler, this));
    },
    _hashChangeHandler: function (evt) {
      var state;
      if ('' === evt.fragment) {
        state = this.initialState;
        if (this.options.debug) {
          console.log('simplicityHistory: Hash state is empty, restoring initial page state', state);
        }
      } else {
        state = $.deparam(evt.fragment);
        if (this.options.debug) {
          console.log('simplicityHistory: Back or forward button was activated, applying state', state);
        }
      }
      try {
        this._ignoreStateChange = true;
        $(this.options.stateController).simplicityState('state', state);
      } finally {
        this._ignoreStateChange = false;
      }
    },
    _stateChangeHandler: function (evt, state) {
      if (!this._ignoreStateChange) {
        var fragment = $.param.fragment();
        var fragmentState = $.deparam(fragment);
        var newFragment = undefined;
        if (fragment === '') {
          if ($.simplicityEquiv(this.initialState, state)) {
            if (this.options.debug) {
              console.log('simplicityHistory: State reset to initial page state, leaving the hash state empty');
            }
          } else {
            newFragment = $.param.fragment('', state);
          }
        } else if ($.simplicityEquiv(fragmentState, state)) {
          if (this.options.debug) {
            console.log('simplicityHistory: Ignoring state change as is matches current history, state is', state, 'fragment is', decodeURIComponent(fragment));
          }
        } else {
          newFragment = $.param.fragment('', state);
        }
        if ('undefined' !== typeof newFragment) {
          if (this.options.debug) {
            console.log('simplicityHistory: Updating hash state', state, newFragment);
          }
          $.bbq.pushState(newFragment);
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-history');
      $(window).bind('hashchange', this._hashChangeHandler);
      $(this.options.stateController).unbind('simplicityStateChange', this._stateChangeHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
