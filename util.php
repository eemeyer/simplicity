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

/**
 * Enable CORS for the current request
 *
 * See: http://www.w3.org/TR/cors/
 * See: http://www.html5rocks.com/en/tutorials/cors/#toc-cors-server-flowchart
 */
function enable_cors() {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        // CORS detected
        header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
        // Uncomment to allow cookies
        //header('Access-Control-Allow-Credentials: true');
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
                // Pre-flight request
                header('Access-Control-Allow-Headers: Content-Type,X-Requested-With');
                // Can optionally consume the following request headers:
                //     Access-Control-Request-Method
                //     Access-Control-Request-Headers
                // Can optionally produce the following response headers:
                //     Access-Control-Allow-Methods
                //     Access-Control-Max-Age
            }
            exit;
        } else {
            // Regular request
            // Can optionally produce the following response headers:
            //     Access-Control-Expose-Headers
        }
    }
}