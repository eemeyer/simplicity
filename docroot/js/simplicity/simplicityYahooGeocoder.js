/**
 * @name $.ui.simplicityYahooGeocoder
 * @namespace A Yahoo geocoder
 */
(function ($) {
  $.widget("ui.simplicityYahooGeocoder", {
    options : {
      debug: false,
      url: '',
      requestTemplate: {
        flags: 'JX'
      }
    },
    _create: function () {
      this.element.addClass('ui-simplicity-yahoo-geocoder');
    },
    geocode: function (geocodeRequest, callback) {
      geocodeRequest = $.extend({}, this.options.requestTemplate, geocodeRequest);
      this._trigger('request', {}, geocodeRequest);
      if (this.options.debug) {
        console.log('simplicityYahooGeocoder: request', geocodeRequest);
      }
      var ajaxHandler = $.proxy(function (ajaxResponse) {
        ajaxResponse.items = this.normalizeResults(ajaxResponse);
        this._trigger('response', {}, ajaxResponse);
        if (this.options.debug) {
          console.log('simplicityYahooGeocoder: response', ajaxResponse);
        }
        callback(ajaxResponse);
      }, this);
      $.ajax({
        url: this.options.url,
        data: geocodeRequest,
        dataType: 'json',
        error: function (request, textStatus, errorThrown) {
          ajaxHandler({
            error: true,
            statusText: xhr.statusText,
            status: xhr.status
          });
        },
        success: function (data, status, xhr) {
          ajaxHandler({
            response: data,
            status: status
          });
        }
      });
    },
    autocompleteSource: function () {
      return $.proxy(function (request, responseCallback) {
        this.geocode({q: request.term}, function (response) {
          responseCallback(response.items);
        });
      }, this);
    },
    normalizeResults: function (response) {
      var items = [];
      if (response && response.response && response.response.ResultSet && response.response.ResultSet.Error === 0) {
        $.each(response.response.ResultSet.Results, $.proxy(function (i, result) {
          var value = this.normalizeAddress(result);
          if (value !== '') {
            items.push({
              value: value,
              latitude: Number(result.latitude),
              longitude: Number(result.longitude),
              response: result
            });
          }
        }, this));
      }
      return items;
    },
    normalizeAddress: function (result) {
      return result.line1 + ' ' + result.line2;
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-yahoo-geocoder');
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
