/**
 * @name $.simplicityLoadJs
 * @function
 * @description
 *
 * Poor mans dynamic JavaScript injection. A lot of upstream vendors use document.write
 * in their script resources which prevents the scripts from being dynamically loaded. This
 * plugin tries to load the script and overrides the document.write and document.writeln functions
 * to pick up any injected scripts and detect when all asynchronous scripts have been loaded.
 * <p>
 * It is not intended to be used for production, instead it is a development only solution.
 * <p>
 * Possible bugs include:
 * <ul>
 *   <li>
 *     Failure to detect failed script loads. This would invalidate the nested counter
 *     and not replace the original document.write function correctly.
 *   </li>
 *   <li>
 *     Failure to deal with calls to document.write which do more than add a single simple
 *     script element.
 *   </li>
 * </ul>
 *
 * @param url
 *   The URL to dynamically load.
 * @param callback
 *   Callback that is called after the JavaScript and any depedent scripts have all
 *   been loaded. Called with no arguments.
 *
 */
(function ($) {
  var nestingCounter = 0;
  var oldDocumentWrite;
  var oldDocumentWriteln;

  var uninstall = function () {
    if ('undefined' !== typeof oldDocumentWrite) {
      /*jslint evil: true */
      document.write = oldDocumentWrite;
      oldDocumentWrite = undefined;
    }
    if ('undefined' !== typeof oldDocumentWriteln) {
      document.writeln = oldDocumentWriteln;
      oldDocumentWriteln = undefined;
    }
  };

  var scriptCompleteCallback = function (url, callback) {
    return function () {
      if ($.simplicityLoadJs.debug) {
        console.log('simplicityLoadJs: Loaded script ' + url);
      }
      nestingCounter -= 1;
      if (nestingCounter === 0) {
        if ($.simplicityLoadJs.debug) {
          console.log('simplicityLoadJs: Restoring original document.write');
        }
        uninstall();
        if ($.isFunction(callback)) {
          setTimeout(callback, 0);
        }
      }
    };
  };

  var loadScript = function (url, callback) {
    nestingCounter += 1;
    if ($.simplicityLoadJs.debug) {
      console.log('simplicityLoadJs: Loading script ' + url);
    }
    $.ajax({
      url: url,
      dataType: 'script',
      complete: scriptCompleteCallback(url, callback)
    });
  };

  var customDocumentWrite = function (callback) {
    return function () {
      $.each(arguments, function (i, arg) {
        var contentHtml = arg;
        var content = $(contentHtml);
        $(content).each(function (i, elem) {
          if (elem.nodeName === 'SCRIPT') {
            loadScript(elem.src, callback);
          }
        });
      });
    };
  };

  $.simplicityLoadJs = function (url, callback) {
    if (nestingCounter === 0) {
      if ($.simplicityLoadJs.debug) {
        console.log('simplicityLoadJs: Saving original document.write and installing custom version');
      }
      oldDocumentWrite = document.write;
      oldDocumentWriteln = document.writeln;
      document.write = customDocumentWrite(callback);
      document.writeln = customDocumentWrite(callback);
    }
    loadScript(url, callback);
  };
  $.simplicityLoadJs.uninstall = uninstall;
}(jQuery));
