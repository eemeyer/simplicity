<?php
$webConfig = parse_ini_file("../../web.config.ini",  true);
$engineUrl = $webConfig["Application"]["discoveryEngineUrl"];
$queryUrl = $engineUrl . "/json/query";

$json_data = file_get_contents('php://input');

$c = curl_init($queryUrl);
curl_setopt($c, CURLOPT_RETURNTRANSFER,true);
curl_setopt($c, CURLOPT_POST, true);
curl_setopt($c, CURLOPT_POSTFIELDS, $json_data);
curl_setopt($c, CURLOPT_FAILONERROR,true);
curl_setopt($c, CURLOPT_HTTPHEADER,array('Content-Type: application/json'));

$response = curl_exec($c);
header('Content-Type: application/json');
echo $response;
