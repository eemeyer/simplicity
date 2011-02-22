(function ($) {
  var degreesToRadians = function (v) {
    return v * Math.PI / 180.0;
  };
  $.simplicityHaversineRadiusMiles = 3956;
  $.simplicityHaversineRadiusKm = 6367;
  $.simplicityHaversineDistanceRadians = function (lat1, lng1, lat2, lng2) {
    lat1 = degreesToRadians(lat1);
    lng1 = degreesToRadians(lng1);
    lat2 = degreesToRadians(lat2);
    lng2 = degreesToRadians(lng2);
    var dLat = lat2 - lat1;
    var dLng = lng2 - lng1;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return c;
  };
  /**
   * @name $.fn.simplicityHaversineDistanceMiles
   * @function
   * @private
   * @description
   *
   * Calculates the distance between two coordinates in miles.
   *
   * @param lat1
   * @param lng1
   * @param lat2
   * @param lng2
   */
  $.simplicityHaversineDistanceMiles = function (lat1, lng1, lat2, lng2) {
    return $.simplicityHaversineRadiusMiles * $.simplicityHaversineDistanceRadians(lat1, lng1, lat2, lng2);
  };
  /**
   * @name $.fn.simplicityHaversineDistanceKm
   * @function
   * @private
   * @description
   *
   * Calculates the distance between two coordinates in kilometers.
   *
   * @param lat1
   * @param lng1
   * @param lat2
   * @param lng2
   */
  $.simplicityHaversineDistanceKm = function (lat1, lng1, lat2, lng2) {
    return $.simplicityHaversineRadiusKm * $.simplicityHaversineDistanceRadians(lat1, lng1, lat2, lng2);
  };
}(jQuery));
