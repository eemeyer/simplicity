<?php
require("../../util.php");

error_reporting(E_WARNING);

$pageSize = 5;
$startIndex = 0;
$renderParameters = false;
if (array_key_exists("renderParameters", $_GET)) {
  $renderParameters = $_GET["renderParameters"];
}

if (array_key_exists("pageSize", $_GET)) {
     $pageSize = (int)  $_GET["pageSize"];
     if ($pageSize <= 0 || $pageSize > 50) {
         $pageSize = 10;
     }
}
if (array_key_exists("page", $_GET)) {
     $page = (int)  $_GET["page"];
     $startIndex = ($page - 1) * $pageSize;
}

$drillDown = array(
  array("dimension" => "type"),
  array("dimension" => "condition"),
  array("dimension" => "bedroom"),
  array(
    "dimension" => "style",
    "ids" => array(
      "multi-family", "apartment", "condo", "co-op", "townhome",
      "single-family", "colonial", "classical", "victorian", "contemporary"
    )
  )
);

$criteria = array();

if (array_key_exists("type", $_GET)) {
    $criteria[] = array(
        "dimension" => "type",
        "id" => $_GET["type"]
    );
}

if (array_key_exists("condition", $_GET)) {
    $criteria[] = array(
        "dimension" => "condition",
        "id" => $_GET["condition"],
    );
}

if (array_key_exists("bed", $_GET)) {
    $criteria[] = array(
        "dimension" => "bedroom",
        "value" => $_GET["bed"],
    );
}

if (array_key_exists("bath", $_GET)) {
    $criteria[] = array(
        "dimension" => "bath",
        "value" => $_GET["bath"],
    );
}

if (array_key_exists("priceMin", $_GET) ||
    array_key_exists("priceMax", $_GET)) {
    $value = array("[");
    if (array_key_exists("priceMin", $_GET)) {
        $value[] = $_GET["priceMin"];
    };
    $value[] = ",";
    if (array_key_exists("priceMax", $_GET)) {
        $value[] = $_GET["priceMax"];
    };
    $value[] = "]";
    $criteria[] = array(
        "dimension" => "price",
        "value" => implode($value,""),
        "nullExactMatch" => true
    );
}

if (array_key_exists("leaseMin", $_GET) ||
    array_key_exists("leaseMax", $_GET)) {
    $value = array("[");
    if (array_key_exists("leaseMin", $_GET)) {
        $value[] = $_GET["leaseMin"];
    };
    $value[] = ",";
    if (array_key_exists("leaseMax", $_GET)) {
        $value[] = $_GET["leaseMax"];
    };
    $value[] = "]";
    $criteria[] = array(
        "dimension" => "lease",
        "value" => implode($value,""),
        "nullExactMatch" => true
    );
}

if (array_key_exists("style", $_GET)) {
    $criteria[] = array(
        "dimension" => "style",
        "id" => $_GET["style"],
    );
}

$discoveryRequest = array(
    "startIndex" => $startIndex,
    "pageSize" => $pageSize,
    "properties" => $properties
);
if ($renderParameters) {
  $discoveryRequest["renderParameters"] = true;
} else {
  $discoveryRequest["properties"] = array();
}

if (!empty($criteria)) {
    $discoveryRequest["criteria"] = $criteria;
}
if (!empty($drillDown)) {
    $discoveryRequest["drillDown"] = $drillDown;
}

$error = false;
try {
  $webConfig = parse_ini_file("../../web.config.ini",  true);
  $engineUrl = $webConfig["tutorial"]["discoveryEngineUrl"];
  $queryUrl = $engineUrl . "/json/query";
  $discoveryResponse = json_post($queryUrl, $discoveryRequest);
}
catch (Exception $e)
{
  $error = true;
  echo $e;
}

if (!$error) {
  try {
    $response = array(
      '_discovery' => array(
        'request' => $discoveryRequest,
        'response' => $discoveryResponse
      )
    );

    if (!$renderParameters) {
      // Build results
      $resultsHtml ='<html><body>';
      $resultsHtml = '<div class="result-set ui-widget">';
      $itemIds = $discoveryResponse['itemIds'];
      if (!empty($itemIds)) {
        for ($i = 0; $i < count($itemIds); $i++) {
          $itemId = $itemIds[$i];
          $properties = $discoveryResponse['properties'][$i];
          $exactMatch = $discoveryResponse['exactMatches'][$i];
          $relevance = $discoveryResponse['relevanceValues'][$i];
          $resultsHtml .= '<div class="result-row ' . ($exactMatch ? 'ui-state-active' : 'ui-priority-secondary') .' ui-widget-content ui-corner-all">';
          $resultsHtml .= '  <div class="info1">';
          $resultsHtml .= '    <span class="itemId">' . $itemId . '</span>';
          $resultsHtml .= '    <span class="match">' . ($exactMatch ? 'exact' : 'close') . '</span>';
          $resultsHtml .= '    <span class="type">' . $properties['type'] . '</span>';
          $resultsHtml .= '  </div>';
          $resultsHtml .= '  <div class="info2">';
          $resultsHtml .= '    <span class="price">$' . ($properties[type] == 'sales' ? $properties['price'] : $properties['lease']). '</span>';
          $resultsHtml .= '    <span class="beds">' . $properties['bedroom'] . ' BR</span>';
          $resultsHtml .= '    <span class="baths">' . $properties['bath'] . ' BA</span>';
          $resultsHtml .= '  </div>';
          $resultsHtml .= '  <div class="info3">';
          $resultsHtml .= '    <span class="condition">' . $properties['condition'] . '</span>';
          $resultsHtml .= '    <span class="style">' . $properties['style'] . '</span>';
          $resultsHtml .= '    <span class="zipcode">' . $properties['zipcode'] . '</span>';
          $resultsHtml .= '  </div>';
          $resultsHtml .= '</div>';
        }
      }
      $resultsHtml .= '</div>';
      $resultsHtml .= '</body></html>';
      $response['resultsHtml'] = $resultsHtml;
    }

    echo json_encode($response);
  } catch (Exception $e) {
    echo $e;
  }
}
