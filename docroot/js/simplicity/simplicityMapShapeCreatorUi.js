/**
 * @name $.ui.simplicityMapShapeCreatorUi
 * @namespace A user interface for a simplicityMapShapeCreator. Saves its UI state
 * in cookies.
 * @example
 *
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;div id="ui">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMap();
 *     $('#map').simplicityGoogleMapShapeCreator({
 *       input: $('<input name="placemark"/>').simplicityInputs()
 *     });
 *     $('#ui').simplicityMapShapeCreatorUi({
 *       shapeCreator: '#map'
 *     });
 *   &lt;/script>

 * <p>Triggers a <code>simplicitymapshapecreatoruiedit</code> event which other components can use to
 * react to changes in drawing state.</p>
 *
 */
(function ($) {
  $.widget("ui.simplicityMapShapeCreatorUi", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt><code>shapeCreator</code></dt>
     *   <dd>
     *     Required shape creator instance.
     *   </dd>
     *   <dt><code>allowMultiPoint</code></dt>
     *   <dd>
     *     Determines if the shape creator can be used to generate a MultiPoint shape.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt><code>helpPosition</code></dt>
     *   <dd>
     *     The relative css position of the help popup
     *     Defaults to <code>
     *     {
     *       left: 300,
     *       top: -148
     *     }</code>.
     *   </dd>
     *   <dt><code>radiusElement</code></dt>
     *   <dd>
     *     The selector to use for identify simplicity radius selection control. The selector's element
     *     moved to the DOM location via <code>$(this.options.template).find('.radius .control')</code>.
     *     <p>Defaults to</p>
     *     <code>
     *       &lt;select class="radius"><br/>
     *          &nbsp;&nbsp;&lt;option value="0.5">½ mile&lt;/option><br/>
     *          &nbsp;&nbsp&lt;option value="1">1 mile&lt;/option><br/>
     *          &nbsp;&nbsp&lt;option value="5">5 miles&lt;/option><br/>
     *          &nbsp;&nbsp&lt;option value="10">10 miles&lt;</option><br/>
     *          &nbsp;&nbsp&lt;option value="20">20 miles&lt;/option><br/>
     *          &nbsp;&nbsp&lt;option value="50">50 miles&lt;/option><br/>
     *          &nbsp;&nbsp&lt;option value="0">None&lt;/option><br/>
     *       &lt;/select></code>
     *   </dd>
     *   <dt><code>geocoderInput</code></dt>
     *   <dd>
     *     The selector to use for identify the input for the geocoder. The selector's element
     *     will be configured using jQuery UI <code>.autocomplete()</code> and
     *     moved to the DOM location via <code>$(this.options.template).find('.geocoder')</code>.
     *     <p>Defaults to</p>
     *     <code>&lt;input class="geocoder" type="text" placeholder="Enter city, state, zip or location" /></code>
     *   </dd>
     *   <dt><code>geocoder</code></dt>
     *   <dd>
     *     The selector to use for identify the simplicity map vendor geocoder. If not specified, the appropriate
     *     map vendor geocoder widget will be applied to option <code>geocoderInput</code>.
     *     <p>Defaults to ''</code>
     *   </dd>
     *   <dt><code>template</code></dt>
     *   <dd>
     *     The html template to use for the UI.
     *     <p>Defaults to</p>
     *     <code>
     *       &lt;div class="ui"><br/>
     *          &nbsp;&nbsp;&lt;span class="geocoder"/><br/>
     *          &nbsp;&nbsp;&lt;span class="radius">Radius&lt;span class="control"/>&lt;/span><br/>
     *          &nbsp;&nbsp;&lt;span class="tbBox"><br/>
     *            &nbsp;&nbsp;&nbsp;&lt;button class="drawBtn btn" title="Start drawing a shape to search on the map.">&lt;i class="icon-edit">&lt;/i>&lt;span>Draw&lt;/span>&lt;/button><br/>
     *            &nbsp;&nbsp;&nbsp;&lt;button class="linkerBtn btn" title="Click to draw points only">&lt;span>●­­–●–●&lt;/span>&lt;/button><br/>
     *            &nbsp;&nbsp;&nbsp;&lt;button class="clear btn" title="Clear any drawn shape">&lt;i class="icon-remove">&lt;/i> Clear&lt;/button><br/>
     *            &nbsp;&nbsp;&nbsp;&lt;button class="showhelp btn" title="Show help">&lt;i class="icon-info-sign">&lt;/i> Help&lt;/button><br/>
     *          &nbsp;&nbsp;&lt;/span><br/>
     *       &lt;/div></code>
     *   </dd>
     *   <dt><code>helpTemplate</code></dt>
     *   <dd>
     *     The html template to use for the help popup.
     *   </dd>
     *   <dt><code>updateBounds</code></dt>
     *   <dd>
     *     Determines if the shape creator visible shape areas should be used
     *     when calculating the maps bounds. When this option is enabled, all visible
     *     shapes will be displayed without having to pan or zoom the map.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt><code>searchElement</code></dt>
     *   <dd>
     *     The <code>simplicityDiscoverySearch</code> widget selector.
     *     Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt><code>debug</code></dt>
     *   <dd>
     *     Enables debug mode. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityMapShapeCreatorUi.options
     */
    options: {
      shapeCreator: '',
      allowMultiPoint: false,
      helpPosition: '',
      geocoderInput: '<input class="geocoder" type="text" placeholder="Enter city, state, zip or location" />',
      geocoderElement: '',
      radiusElement: '<select class="radius">' +
          '<option value="0.5">½ mile</option>' +
          '<option value="1">1 mile</option>' +
          '<option value="5">5 miles</option>' +
          '<option value="10">10 miles</option>' +
          '<option value="20">20 miles</option>' +
          '<option value="50">50 miles</option>' +
          '<option value="0">None</option>' +
        '</select>',
      template:
        '<div class="ui">' +
           ' <span class="geocoder"/>' +
           ' <span class="radius">Radius <span class="control"/></span>' +
           ' <span class="tbBox">' +
           '  <button class="drawBtn btn" title="Start drawing a shape to search on the map."><i class="icon-edit"></i> <span>Draw</span></button>' +
           '  <button class="linkerBtn btn" title="Click to draw points only"><span>●­­–●–●</span></button>' +
           '  <button class="clear btn" title="Clear any drawn shape"><i class="icon-remove"></i> Clear</button>' +
           '  <button class="showhelp btn" title="Show help"><i class="icon-info-sign"></i> Help</button>' +
           ' </span>' +
        '</div>',
      helpTemplate:
          '<div class="help ui-corner-all ui-helper-clearfix">' +
             '<div class="text">' +
                '<div class="background ui-corner-all"></div>' +
                '<p>To draw or edit a shape, click to draw the first point. ' +
                'Click in another spot to draw a new point or drag a vertex.</p>' +
                '<p>To draw a closed shape, add 3 points then click the first point. ' +
                'To end drawing, click Stop.</p>' +
             '</div>' +
             '<div class="closer ui-corner-all" title="Close this help message"><a class="close" title="Close this help message">&times;</a></div>' +
         '</div>',
      updateBounds: false,
      searchElement: 'body',
      debug: false
    },
    _create: function () {
      this._shapeCreator = this._locateShapeCreator();
      if ('undefined' === typeof this._shapeCreator) {
        if (this.options.debug) {
          throw new Error("ShapeCreator selector is required.");
        }
        return;
      }
      if (this.options.helpPosition === '') {
        this.options.helpPosition = {left: 300, top: -148};
      }
      this._settings_COOKIE = "__t11e_pd_st";
      this._settings = {};
      this._settings.helpHidden = false;
      this._getSettings();
      this._geoJson = {}; //this._newGeoJson();
      var widgetNames = this._shapeCreator("getMappingProviderWidgetNames");
      this
        ._addClass('ui-simplicity-map-shape-creator-ui')
        ._bind(this._shapeCreator, widgetNames.shapeCreator.toLowerCase() + 'shapechange', this._shapeChangedHandler);
      if (this.options.updateBounds) {
        this._bind(this._shapeCreator, widgetNames.boundsCoordinator.toLowerCase() + 'calculatebounds', this._shapeCreator("boundsHandler"));
      }
      this._createUi();
      this._shapeCreator("option", "radius", this._radius);
    },
    _setOption: function (key, value) {
      $.ui.simplicityWidget.prototype._setOption.apply(this, arguments);
      if (key === "geocoderInput") {
        this._geocoderInput = $(value);
        this._configureGeocoder();
      } else if (key === "radiusElement") {
        this._radiusInput.remove();
        this._radiusInput = $(value).appendTo(this.element.find('.radius .control'));
        this._geoJson.properties.radius = this._radius;
        this._configureRadiusInput();
      }
    },
    _locateShapeCreator: function () {
      var target = $(this.options.shapeCreator);
      var candidateCreatorNames = $.map(target.data(), function (value, key) {
        return (/[^A-Z]MapShapeCreator$/).test(key) ? key : undefined;
      });
      if (candidateCreatorNames.length !== 1) {
        if (this.options.debug) {
          if (candidateCreatorNames.length === 0) {
            throw new Error('Missing shape creator widget');
          } else {
            throw new Error('Ambigious shape creator widget: ' + candidateCreatorNames);
          }
        }
        return;
      }
      var widget = target[candidateCreatorNames[0]];
      return function () {
        return widget.apply(target, arguments);
      };
    },
    /**
     * Handler for dealing with changes to the radius.
     * @name $.ui.simplicityMapShapeCreatorUi._radiusChangedHandler
     * @function
     * @private
     */
    _radiusChangedHandler: function (evt) {
      this._radius = evt.currentTarget.value ? +evt.currentTarget.value : 0;
      this._shapeCreator("option", "radius", this._radius);
    },
    /**
     * Handler for dealing with changes to the underlying geoJson shape.
     * @name $.ui.simplicityMapShapeCreatorUi._shapeChangedHandler
     * @function
     * @private
     */
    _shapeChangedHandler: function (evt, ui) {
      var geoJson = ui.geoJson;
      if (geoJson.placemarks.coordinates.length > 0) {
        if (geoJson.placemarks.type === 'Polygon' && this._mapclicklabel.prop('checked')) {
          this._disable();
          if (this._shapeCreator("option", "editMode")) {
            this._shapeCreator("option", "editMode", false);
          }
        }
        this.element.find('.clear').fadeIn();
        this._radiusInput.prop("disabled", geoJson.placemarks.type === 'Polygon');
        if (!this._radiusInput.prop("disabled")) {
          if (this._radius !== geoJson.properties.radius) {
            this._radiusInput.val(this._radius);
            this._radius = this._radiusInput.val();
            this._geoJson.properties.radius = this._radius;
          }
        }
        this._geocoderInput.val(
          'undefined' !== typeof geoJson.properties.geocoder ? geoJson.properties.geocoder.addr || '' : '');
        if (geoJson.properties.editMode) {
          this._enable();
        }
      } else {
        this.element.find('.clear').fadeOut();
        this._geocoderInput.val('');
        this._radiusInput.prop("disabled", false);
      }
      this._geoJson = geoJson;
    },
    /**
     * Builds the Ui.
     * @name $.ui.simplicityMapShapeCreatorUi._createUi
     * @function
     * @private
     */
    _createUi: function () {
      this._helpMsg = $(this.options.helpTemplate).draggable().hide().css(this.options.helpPosition);
      this._helpMsg.find(".background").css({ opacity: 0.5});
      this._bind(this._helpMsg.find(".closer"), 'click',
        function (evt) {
          evt.preventDefault();
          this._helpButton.fadeIn();
          this._helpMsg.fadeOut('slow', $.proxy(function () {
            this._helpMsg.detach();
            this._settings.helpHidden = true;
            this._saveSettings();
          }, this));
        });

      this.element
        .data('previousHTML', this.element.html())
        .html(this.options.template);

      this._mapclicklabel = this.element.find('.drawBtn')
        .prop('checked', false);

      this._bind(this._mapclicklabel, 'click',
        function (evt) {
          if (this._mapclicklabel.prop('checked')) {
            this._mapclicklabel.prop('checked', false);
            this._disable();
            this._shapeCreator("option", "editMode", false);
            this._trigger('edit', {}, {edit: false});
          } else {
            this._mapclicklabel.prop('checked', true);
            if ('Polygon' === this._shapeCreator("geometry")) {
              this._shapeCreator("convertPolygonToLineString", this._radius);
            }
            this._shapeCreator("option", "editMode", true);
            this._enable();
            this._radius = this._radiusInput.val() ? +this._radiusInput.val() : 0;
            if (this._radius !== this._shapeCreator("option", "radius")) {
              this._shapeCreator("option", "radius", this._radius);
            }
            this._shapeCreator("updateBounds"); // show whole shape
            this._trigger('edit', {}, {edit: true});
          }
        });

      this._helpButton = this.element.find('.showhelp').hide();
      this._bind(this._helpButton, 'click',
        function () {
          if (this._settings.helpHidden) {
            this._helpMsg.appendTo(this.element);
            this._helpMsg.fadeIn('slow');
            this._helpButton.fadeOut();
            this._settings.helpHidden = false;
            this._saveSettings();
          }
        });

      this._bind(this.element.find('.clear').hide(), 'click',
        function (evt) {
          this.element.find('.clear').fadeOut();
          this._shapeCreator("reset");
          this._geocoderInput.val('');
        });

      if (this.options.allowMultiPoint) {
        this._bind(this.element.find('.linkerBtn'), 'click',
          function (evt) {
            var connected = !this._shapeCreator("option", "connected");
            this.element.find('.linkerBtn').prop('checked', connected);
            this._setConnected(connected);
            this._shapeCreator("option", "radius", this._radius);
            this._shapeCreator("option", "connected", connected);
          });
        this.element.find('.linkerBtn').hide();
      } else {
        this.element.find('.linkerBtn').remove();
      }

      // radius
      this._radiusInput = $(this.options.radiusElement).appendTo(this.element.find('.radius .control'));
      this._configureRadiusInput();

      // geocoder
      if ('string' === typeof this.options.geocoderInput) {
        this._geocoderInput = $(this.options.geocoderInput)
          .autocomplete({
            autoFocus: true
          });
      } else {
        this._geocoderInput = $(this.options.geocoderInput);
      }
      this._configureGeocoder();

      if (this._shapeCreator("option", "editMode")) {
        this._enable();
      }
      this._setConnected(this._shapeCreator("geometry") !== 'MultiPoint');
    },
    /**
     * Helper method that configures a simplicity radius control.
     * @name $.ui.simplicityMapShapeCreatorUi._configureRadiusInput
     * @function
     * @private
     */
    _configureRadiusInput: function () {
      if (this._radiusInput.length > 0) {
        this._radius = this._radiusInput.val() ? +this._radiusInput.val() : 0;
        this._bind(this._radiusInput, 'change', this._radiusChangedHandler);
      } else {
        this._radiusInput.appendTo(this.element.find('.radius').children().remove());
      }
    },
    /**
     * Helper method that configures a simplicity geocoder control.
     *
     * <p>Triggers a simplicitymapshapecreatoruigeocodedpoint event. Handlers for that event receive a ui
     * object with geoJson and geocoderCallbackData members.</p>
     *
     * @name $.ui.simplicityMapShapeCreatorUi._configureGeocoder
     * @function
     * @private
     */
    _configureGeocoder: function () {
      if (this._geocoderInput.length > 0) {
        this.element.find('.geocoder')
          .append(this._geocoderInput);
        var selectCallback = $.proxy(function (evt, ui) {
          if (ui.item) {
            var changed = true;
            try {
              if ('undefined' !== typeof this._geoJson.properties.geocoder) {
                changed = ui.item.value !== this._geoJson.properties.geocoder.addr;
              }
            } finally {
              if (changed) {
                this._shapeCreator("reset", false);
                this._shapeCreator("option", "radius", this._radius);
                var marker = this._shapeCreator("newGeocodedPoint", ui);
                this._shapeCreator("setMapCenterFromMarker", marker);
                var geo_ui = {geoJson: this._shapeCreator("geoJson"), geocoderCallbackData: ui};
                this._trigger('geocodedpoint', {}, geo_ui);
              }
            }
          }
        }, this);
        var autocompleteMenu = $('<span/>')
          .addClass("ui-simplicity-map-shape-creator-ui-geocoder-menu")
          .appendTo($('body'));
        var simplicityGeocoder = this._shapeCreator("getMappingProviderWidgetNames").geocoder;
        var geocoder = (this.options.geocoderElement === '' ?
          this._geocoderInput : $(this.options.geocoderElement))[simplicityGeocoder]();
        this._geocoderInput
          .autocomplete({
            source: geocoder[simplicityGeocoder]("autocompleteSource"),
            select: selectCallback,
            change: selectCallback,
            appendTo: autocompleteMenu
          });
        if (this._geocoderInput.watermark) {
          this._geocoderInput.watermark(this._geocoderInput.attr("placeholder"));
        }
      }
    },
    /**
     * Helper method that enables the Ui for editing shapes
     * @name $.ui.simplicityMapShapeCreatorUi._enable
     * @function
     * @private
     */
    _enable: function () {
      if ($(this.options.searchElement).data("simplicityDiscoverySearch")) {
        $(this.options.searchElement).simplicityDiscoverySearch("option", "searchOnStateChange", false);
      }
      this._mapclicklabel
        .prop('checked', true)
        .attr("title", "Stop drawing.")
        .find('span')
        .text('Stop');
      if (!this._settings.helpHidden) {
        this._helpMsg.appendTo(this.element);
        this._helpMsg.fadeIn('slow');
      }
      this._radiusInput.prop("disabled", false);
      this.element.find(".linkerBtn").fadeIn();
      this._geocoderInput.attr("disabled", "true").addClass("disabled");
      this._helpButton[this._settings.helpHidden ? "fadeIn" : "fadeOut"]();
    },
    /**
     * Helper method that disables (stops) editing
     * @name $.ui.simplicityMapShapeCreatorUi._disable
     * @function
     * @private
     * @param {boolean} [forceChange] Determines if editing should be force stopped on the shape. Defaults to <code>true</code>
     */
    _disable: function () {
      if ($(this.options.searchElement).data("simplicityDiscoverySearch")) {
        $(this.options.searchElement)
          .simplicityDiscoverySearch("option", "searchOnStateChange", true)
          .simplicityDiscoverySearch("search");
      }
      this._mapclicklabel
        .prop('checked', false)
        .attr("title", "Start drawing a shape to search on the map.")
        .find('span')
        .text('Draw');
      this._helpMsg.fadeOut('slow', $.proxy(function () {
        this._helpMsg.detach();
      }, this));
      this.element.find(".linkerBtn").fadeOut();
      this._geocoderInput.removeAttr("disabled").removeClass("disabled");
      this._helpButton.fadeOut();
    },
    /**
     * Handler for dealing with changes to the connected/disconnected status of a series of points
     * @name $.ui.simplicityMapShapeCreatorUi._setConnected
     * @function
     * @private
     * @param {boolean} value Determines if the points should be displayed as a LineString (<code>true</code>) or
     * as individual points (<code>false</code>).
     */
    _setConnected: function (value) {
      this.element.find(".linkerBtn")
        .attr("title", value ? 'Click to draw points only' : 'Click to draw lines and closed shapes')
        .find('span')
        .text(value ? '●­­–●–●' : '● ● ●')
        .prop("checked", value);
    },
    /**
     * Saves UI state to a cookie
     * @name $.ui.simplicityMapShapeCreatorUi._saveSettings
     * @function
     * @private
     * @param {String} cookiename The name of the cookie in which to store the state.
     */
    _saveSettings: function () {
      var cookieName = this._settings_COOKIE;
      var expiresDays = 6;
      var exdate = new Date();
      exdate.setDate(exdate.getDate() + expiresDays);
      var persistValue = {
        h: this._settings.helpHidden ? 1 : 0
      };
      document.cookie = cookieName + "=" + escape(JSON.stringify(persistValue)) + "; expires=" + exdate.toUTCString();
    },
    /**
     * Sets the UI state from a cookie
     * @name $.ui.simplicityMapShapeCreatorUi._getSettings
     * @function
     * @private
     * @param {String} cookiename The name of the cookie from which to retrieve the state.
     */
    _getSettings: function () {
      var key, val, p, settings, cookies = document.cookie.split(";");
      var cookieName = this._settings_COOKIE;
      $.each(cookies, $.proxy(function (i, cookie) {
        p = cookies[i].indexOf("=");
        key = cookies[i].substr(0, p);
        val = cookies[i].substr(p + 1);
        key = key.replace(/^\s+|\s+$/g, "");
        if (key === cookieName) {
          settings = JSON.parse(unescape(val));
          if ('undefined' !== typeof settings.h) {
            this._settings.helpHidden = settings.h === 1;
          }
        }
      }, this));
    },
    destroy: function () {
      this._helpMsg.remove();
      this.element.html(this.element.data('previousHTML'));
      this.element.removeData('previousHTML');

      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
