(function (window) {
  window.real_estate_search_controller = function (state) {
    var discoveryRequest = {
        criteria: [],
        properties: []
      };
    if ('undefined' === typeof state || 'undefined' === typeof state.pageSize) {
      discoveryRequest.pageSize = 5;
    } else {
      discoveryRequest.pageSize = state.pageSize;
    }
    var minMaxCriteria = {
        price: {},
        lease: {}
      },
      latLngCriteria = {
        location: {}
      },
      shapesCriteria = {
        location: {}
      };
    $.each(state, $.proxy(function (key, val) {
      switch (key) {
      case "page":
        discoveryRequest.startIndex =  (val - 1) * discoveryRequest.pageSize;
        break;
      case "pageSize":
        discoveryRequest.pageSize =  state.pageSize;
        break;
      case "type":
      case "style":
      case "condition":
        discoveryRequest.criteria.push({
          dimension: key,
          id: val
        });
        break;
      case "bath":
        discoveryRequest.criteria.push({
          dimension: key,
          value: val
        });
        break;
      case "bedroom":
        discoveryRequest.criteria.push({
          dimension: "bed",
          value: val
        });
        break;
      case "placemark":
      case "bounds":
        var criterion = JSON.parse(val);
        criterion.dimension = "location";
        if (criterion.placemarks.type === 'Polygon') {
          criterion.exactDistance = 0.5;
        }
        if (key === "bounds") {
          criterion.cullDistance = 0;
        }
        discoveryRequest.criteria.push(criterion);
        break;
      case "lat":
      case "lon":
        latLngCriteria.location[key] = val;
        break;
      case "n":
      case "e":
      case "s":
      case "w":
        // Build shapes criterion values
        shapesCriteria.location[key] = val;
        break;
      case "priceMin":
      case "priceMax":
      case "leaseMin":
      case "leaseMax":
        // Look for min/max valus for interval notation
        var m = key.search(/Max|Min$/);
        if (m.length > -1) {
          var dim = key.substr(0, m - 1),
            minMax = key.substr(m).toLowerCase();
          minMaxCriteria[dim][minMax] = val;
        }
      }
    }, this));
    // Resolve min/max interval notation queries
    $.each(minMaxCriteria, function (key, val) {
      if ('undefined' !== typeof val.min || 'undefined' !== typeof val.max) {
        var v = ["["];
        $.each([val.min, val.max], function (idx, f) {
          v.push(f || "");
          v.push(idx === 0 ? "," : "");
        });
        v.push("]");
        discoveryRequest.criteria.push({
          dimension: key,
          value: v.join("")
        });
      }
    });
    // Resolve Latitude/Longitude query
    $.each(latLngCriteria, function (key, val) {
      if ('undefined' !== typeof val.lat && 'undefined' !== typeof val.lon) {
        discoveryRequest.criteria.push({
          dimension: key,
          latitude: val.lat,
          longitude: val.lon,
          exactDistance: 0.5
        });
      }
    });
    // Resolve shapes query
    $.each(shapesCriteria, function (key, val) {
      if ('undefined' !== typeof val.n &&
          'undefined' !== typeof val.e &&
          'undefined' !== typeof val.s &&
          'undefined' !== typeof val.w) {
        discoveryRequest.criteria.push({
          dimension: "location",
          shapes: {
            // ne, nw, sw, se, ne
            latitude: [val.n, val.n, val.s, val.s, val.n],
            longitude: [val.e, val.w, val.w, val.e, val.e]
          }
        });
      }
    });
    discoveryRequest.facets = {
      type: {includeLable: false},
      condition: {includeLable: false},
      bedroom: {includeLable: false},
      style: {
        includeLable: false,
        ids: ["multi-family", "apartment", "condo", "co-op", "townhome",
              "single-family", "colonial", "classical", "victorian", "contemporary"]
      }
    };
    if (discoveryRequest.criteria.length === 0) {
      delete discoveryRequest.criteria;
    }
    discoveryRequest.explain = "criterionValue";
    return discoveryRequest;
  };
}(window));
