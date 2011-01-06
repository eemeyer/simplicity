<?php

error_reporting('E_WARNING');

/**
* Posts $data to $url and expects JSON data in return
*/
function json_post($url, $data) {
  $json_data = json_encode($data);
  $c = curl_init($url);
  curl_setopt($c, CURLOPT_RETURNTRANSFER,true);
  curl_setopt($c, CURLOPT_POST, true);
  curl_setopt($c, CURLOPT_POSTFIELDS, $json_data);
  curl_setopt($c, CURLOPT_FAILONERROR,true);
  curl_setopt($c, CURLOPT_HTTPHEADER,array('Content-Type: application/json'));

  $response = curl_exec($c);
  $http_status = curl_getinfo($c, CURLINFO_HTTP_CODE);
  $error = curl_error($c);
  curl_close($c);

  if ($http_status >= 200 && $http_status < 300 ) {
    // 200 - 299 inclusive
    return json_decode($response, true);
  } else {
    throw new Exception($error, $http_status);
  }
}

