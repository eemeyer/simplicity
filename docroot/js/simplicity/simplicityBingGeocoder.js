/**
 * @name $.ui.simplicityBingGeocoder
 * @namespace A Bing geocoder
 */
(function ($) {
  $.widget("ui.simplicityBingGeocoder", {
    options : {
      debug: false,
      url: '',
      requestTemplate: {
      }
    },
    _create: function () {
      this.element.addClass('ui-simplicity-bing-geocoder');
    },
    geocode: function (geocodeRequest, callback) {
      geocodeRequest = $.extend({}, this.options.requestTemplate, geocodeRequest);
      this._trigger('request', {}, geocodeRequest);
      if (this.options.debug) {
        console.log('simplicityBingGeocoder: request', geocodeRequest);
      }
      var ajaxHandler = $.proxy(function (ajaxResponse) {
        ajaxResponse.items = this.normalizeResults(ajaxResponse);
        this._trigger('response', {}, ajaxResponse);
        if (this.options.debug) {
          console.log('simplicityBingGeocoder: response', ajaxResponse);
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
        this.geocode({query: request.term}, function (response) {
          responseCallback(response.items);
        });
      }, this);
    },
    normalizeResults: function (response) {
      var items = [];
      if (response && response.response && response.response.statusCode === 200) {
        $.each(response.response.resourceSets, $.proxy(function (i, resourceSet) {
          $.each(resourceSet.resources, $.proxy(function (j, result) {
            var value = this.normalizeAddress(result);
            if (value !== '') {
              items.push({
                value: value,
                latitude: result.point.coordinates[0],
                longitude: result.point.coordinates[1],
                response: result
              });
            }
          }, this));
        }, this));
      }
      return items;
    },
    normalizeAddress: function (result) {
      return result.address.formattedAddress;
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-bing-geocoder');
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
