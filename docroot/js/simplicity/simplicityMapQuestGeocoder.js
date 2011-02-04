/**
 * @name $.ui.simplicityMapQuestGeocoder
 * @namespace A MapQuest geocoder
 */
(function ($) {
  $.widget("ui.simplicityMapQuestGeocoder", {
    options : {
    },
    _create: function () {
      this.element.addClass('ui-simplicity-mapquest-geocoder');
    },
    geocode: function (value, options, callback) {
      MQA.Geocoder.geocode(value, options, null, $.proxy(function (response) {
        var items = this.normalizeResults(response);
        callback(items, response);
      }, this));
    },
    autocompleteSource: function (options) {
      return $.proxy(function (request, responseCallback) {
        this.geocode(request.term, options, function (items) {
          responseCallback(items);
        });
      }, this);
    },
    normalizeAddress: function (location) {
      var value = location.street;
      if (location.adminArea5 !== '') {
        if (value !== '') {
          value += ', ';
        }
        value += location.adminArea5;
      }
      if (location.adminArea4 !== '' && location.geocodeQuality === 'COUNTY') {
        if (value !== '') {
          value += ', ';
        }
        value += location.adminArea4;
      }
      if (location.adminArea3 !== '') {
        if (value !== '') {
          value += ', ';
        }
        value += location.adminArea3;
      }
      if (location.postalCode !== '') {
        if (value !== '') {
          value += ' ';
        }
        value += location.postalCode;
      }
      return value;
    },
    normalizeResults: function (response, noDisambiguate) {
      var items = [];
      if (response.info.statuscode === 0) {
        $.each(response.results, $.proxy(function (i, result) {
          $.each(result.locations, $.proxy(function (i, location) {
            var value = this.normalizeAddress(location);
            if (value !== '') {
              items.push({
                value: value,
                latitude: location.latLng.lat,
                longitude: location.latLng.lng,
                response: location
              });
            }
          }, this));
        }, this));
      }
      if (!noDisambiguate) {
        items = this.disambiguateItems(items);
      }
      return items;
    },
    disambiguateItems: function (items) {
      labelToItem = {};
      $.each(items, function (i, item) {
        var suggestionLabel = item.value;
        var duplicateItem = labelToItem[suggestionLabel];
        if (typeof duplicateItem === 'undefined') {
          if (item.response.geocodeQuality === 'STATE') {
            if (item.response.adminArea1 === 'US') {
              suggestionLabel = 'State of ' + suggestionLabel;
            }
          }
          labelToItem[suggestionLabel] = item;
        } else {
          // Duplicate label -- disambiguate via County
          suggestionLabel += ' (' + item.response.adminArea4 + ')';
          var labelToDisambiguate = duplicateItem.label;
          labelToDisambiguate += ' (' + duplicateItem.response.adminArea4 + ')';
          duplicateItem.label = labelToDisambiguate;
        }
        item.label = suggestionLabel;
      });
      return items;
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-mapquest-geocoder');
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
