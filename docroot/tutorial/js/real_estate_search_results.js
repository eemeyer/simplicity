(function (window) {
  window.real_estate_search_results = function (ele, searchResponse) {
    var discoveryResponse = searchResponse._discovery || {};
    var response = discoveryResponse.response || {};
    if ('undefined' !== typeof response.itemIds) {
      var itemIds = response.itemIds,
        exactMatches = response.exactMatches;
      var results = $('<div/>').addClass("result-set ui-widget");
      $.each(itemIds, function (i, item) {
        var properties = response.properties[i];
        $('<div/>')
          .attr({id: "result-" + itemIds[i]})
          .addClass("result-row ui-widget-content ui-corner-all " + (exactMatches[i] ? 'ui-state-active' : 'ui-priority-secondary'))
          .append(
            $('<div/>')
              .addClass("info1")
              .append($('<span/>').addClass("itemId").text(itemIds[i]))
              .append($('<span/>').addClass("match").text(exactMatches[i] ? ' exact' : ' close'))
              .append($('<span/>').addClass("type").text(" " + properties.type)))
          .append(
              $('<div/>')
                .addClass("info2")
                .append($('<span/>').addClass("price").text(properties.type === 'sales' ? properties.price : properties.lease))
                .append($('<span/>').addClass("beds").text(" " + properties.bedroom + " BR"))
                .append($('<span/>').addClass("baths").text(" " + properties.bath + " BA")))
          .append(
              $('<div/>')
                .addClass("info3")
                .append($('<span/>').addClass("condition").text(properties.condition))
                .append($('<span/>').addClass("style").text(" " + properties.style))
                .append($('<span/>').addClass("zipcode").text(" " + properties.zipcode)))
          .appendTo(results);
      });
      ele.html(results);
    }
  };
}(window));
