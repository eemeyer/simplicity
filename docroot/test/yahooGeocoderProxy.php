<?php
$url = 'http://where.yahooapis.com/geocode?' . $_SERVER['QUERY_STRING'];
$c = curl_init($url);
curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
curl_setopt($c, CURLOPT_FAILONERROR,true);
$response = curl_exec($c);
echo $response;
