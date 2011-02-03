/**
 * @name $.ui.simplicityFacetedInput
 * @namespace Combines simplicityInputs and simplicityBucketCount
 */
(function ($) {
  $.widget("ui.simplicityFacetedInput", {
    options : {
      dimension: '',
      template: '<span/>',
      placement: 'after-label'
    },
    _create : function () {
      this.element.addClass('ui-simplicity-faceted-input');
      this.element.simplicityInputs($.extend({}, this.options));
      if (this.element[0].nodeName === 'SELECT') {
        var options = this.element.find('option');
        this.element.find('option').each($.proxy(function (i, option) {
          $(option).simplicityBucketCount($.extend({}, this.options, {
            bucketId: $(option).val()
          }));
        }, this));
      } else {
        var countElement = $(this.options.template);
        countElement.simplicityBucketCount($.extend({}, this.options, {
          bucketId: this.element.val()
        }));
        if (this.options.placement === 'before-input') {
          this.element.before(countElement);
        } else if (this.options.placement === 'after-input') {
          this.element.after(countElement);
        } else {
          var inputId = this.element.attr('id');
          if ('undefined' !== typeof inputId) {
            var label = $('label[for="' + inputId + '"]');
            if (label.length > 0) {
              if (this.options.placement === 'before-label') {
                label.before(countElement);
              } else if (this.options.placement === 'after-label') {
                label.after(countElement);
              } else if (this.options.placement === 'append-label') {
                label.append(countElement);
              } else if (this.options.placement === 'prepend-label') {
                label.prepend(countElement);
              }
            }
          }
        }
      }
    },
    destroy : function () {
      this.element.removeClass('ui-simplicity-faceted-input');
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
