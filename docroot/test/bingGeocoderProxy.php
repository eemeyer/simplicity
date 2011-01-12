<?php
$url = 'http://dev.virtualearth.net/REST/v1/Locations?' . $_SERVER['QUERY_STRING'];
$c = curl_init($url);
curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
curl_setopt($c, CURLOPT_FAILONERROR,true);
$response = curl_exec($c);
echo $response;
