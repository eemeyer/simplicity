/**
 * @name $.ui.simplicityGoogleGeocoder
 * @namespace A Google geocoder
 */
(function ($) {
  $.widget("ui.simplicityGoogleGeocoder", {
    options : {
      debug: false
    },
    _create: function () {
      this.element.addClass('ui-simplicity-google-geocoder');
      this._geocoder = new google.maps.Geocoder();
    },
    geocode: function (geocodeRequest, callback) {
      this._trigger('request', {}, geocodeRequest);
      if (this.options.debug) {
        console.log('simplicityGoogleGeocoder: request', geocodeRequest);
      }
      this._geocoder.geocode(geocodeRequest, $.proxy(function (results, status) {
        var items = this.normalizeResults(results, status);
        var response = {
          results: results,
          status: status,
          items: items
        };
        this._trigger('response', {}, response);
        if (this.options.debug) {
          console.log('simplicityGoogleGeocoder: response', response);
        }
        callback(response);
      }, this));
    },
    autocompleteSource: function () {
      return $.proxy(function (request, responseCallback) {
        this.geocode({address: request.term}, function (response) {
          responseCallback(response.items);
        });
      }, this);
    },
    normalizeResults: function (results, status) {
      var items = [];
      if (status === google.maps.GeocoderStatus.OK) {
        $.each(results, $.proxy(function (i, result) {
          var value = this.normalizeAddress(result);
          if (value !== '') {
            items.push({
              value: value,
              latitude: result.geometry.location.lat(),
              longitude: result.geometry.location.lng(),
              response: result
            });
          }
        }, this));
      }
      return items;
    },
    normalizeAddress: function (result) {
      return result.formatted_address;
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-google-geocoder');
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
