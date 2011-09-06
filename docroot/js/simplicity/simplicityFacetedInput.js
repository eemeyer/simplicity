/**
 * @name $.ui.simplicityFacetedInput
 * @namespace Combines simplicityInputs and simplicityFacetCount.
 * <p>
 * Convenience wrapper around <code>simplicityInputs</code> and <code>simplicityFacetCount</code>.
 * <p>
 * The options for this widget are passed through to both of the contained widgets.
 * Additionally, the option <code>facetId</code> is automatically created for the
 * <code>simplicityFacetCount</code> widget from attributes on the wrapped input.
 */
(function ($) {
  $.widget("ui.simplicityFacetedInput", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>dimension</dt>
     *   <dd>
     *     Mandatory option, used to determine which dimension is used for facet counts.
     *     Defaults to <code>''</code>.
     *   </dd>
     *   <dt>template</dt>
     *   <dd>
     *     For when this widget is bound to an <code>input</code> other than <code>select</code>.
     *     Is used as the element for the <code>simplicityFacetCount</code> widget.
     *     Defaults to <code>&lt;span/></code>.
     *   </dd>
     *   <dt>placement</dt>
     *   <dd>
     *     For when this widget is bound to an <code>input</code> other than <code>select</code>.
     *     Determines where to place the automatically created <code>simplicityFacetCount</code>
     *     widget. Defaults to <code>after-label</code>. Possible options are
     *     <dl>
     *       <dt>before-input</dt>
     *       <dd>
     *         Immediately before the <code>input</code> element.
     *         <pre>
     *            HERE
     *            &lt;input type="checkbox" id="large" name="size" value="large">
     *            &lt;label for="large">Large&lt;/label>
     *         </pre>
     *       </dd>
     *       <dt>after-input</dt>
     *       <dd>
     *         Immediately after the <code>input</code> element.
     *         <pre>
     *            &lt;label for="large">Large&lt;/label>
     *            &lt;input type="checkbox" id="large" name="size" value="large">
     *            HERE
     *         </pre>
     *       </dd>
     *       <dt>before-label</dt>
     *       <dd>
     *         Immediately before the <code>label</code> associated with the <code>input</code> element.
     *         <pre>
     *            HERE
     *            &lt;label for="large">Large&lt;/label>
     *            &lt;input type="checkbox" id="large" name="size" value="large">
     *         </pre>
     *       </dd>
     *       <dt>after-label</dt>
     *       <dd>
     *         Immediately after the <code>label</code> associated with the <code>input</code> element.
     *         <pre>
     *            &lt;input type="checkbox" id="large" name="size" value="large">
     *            &lt;label for="large">Large&lt;/label>
     *            HERE
     *         </pre>
     *       </dd>
     *       <dt>append-label</dt>
     *       <dd>
     *         Appended into the <code>label</code> associated with the <code>input</code> element.
     *         <pre>
     *            &lt;input type="checkbox" id="large" name="size" value="large">
     *            &lt;label for="large">Large HERE&lt;/label>
     *         </pre>
     *       </dd>
     *       <dd></dd>
     *       <dt>prepend-label</dt>
     *       <dd>
     *         Prepended into the <code>label</code> associated with the <code>input</code> element.
     *         <pre>
     *            &lt;input type="checkbox" id="large" name="size" value="large">
     *            &lt;label for="large">HERE Large&lt;/label>
     *         </pre>
     *       </dd>
     *     </dl>
     *   </dd>
     * </dl>
     * @name $.ui.simplicityFacetedInput.options
     */
    options: {
      dimension: '',
      template: '<span/>',
      placement: 'after-label'
    },
    _create: function () {
      this._addClass('ui-simplicity-faceted-input');
      this.element.simplicityInputs($.extend({}, this.options));
      if (this.element[0].nodeName === 'SELECT') {
        this.element.find('option').each($.proxy(function (i, option) {
          $(option).simplicityFacetCount($.extend({}, this.options, {
            facetId: $(option).val()
          }));
        }, this));
      } else {
        var countElement = $(this.options.template);
        countElement.simplicityFacetCount($.extend({}, this.options, {
          facetId: this.element.val()
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
    }
  });
}(jQuery));
