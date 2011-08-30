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

$facets = array(
  "type" => array("includeLabel" => false),
  "condition"=> array("includeLabel" => false),
  "bedroom" => array("includeLabel" => false),
  "style" => array(
      "ids"=> array(
          "multi-family", "apartment", "condo", "co-op", "townhome",
          "single-family", "colonial", "classical", "victorian", "contemporary"
       ),
       "includeLabel" => false
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

if (array_key_exists("n", $_GET) && array_key_exists("e", $_GET) && array_key_exists("s", $_GET) && array_key_exists("w", $_GET)) {
    $north = $_GET["n"];
    $east = $_GET["e"];
    $south = $_GET["s"];
    $west = $_GET["w"];
    $criteria[] = array(
        "dimension" => "location",
        "shapes" => array(
          array(
            // ne, nw, sw, se, ne
            "latitude" => array($north, $north, $south, $south, $north),
            "longitude" => array($east, $west, $west, $east, $east))));
}

if (array_key_exists("lat", $_GET) && array_key_exists("lon", $_GET)) {
    $criteria[] = array(
        "dimension" => "location",
        "latitude" => $_GET["lat"],
        "longitude" => $_GET["lon"],
        "exactDistance" => 0.5,
    );
}

$discoveryRequest = array(
    "startIndex" => $startIndex,
    "pageSize" => $pageSize,
    "properties" => $properties,
    "explain" => "criterionValue"
);

if ($renderParameters) {
  $discoveryRequest["renderParameters"] = true;
} else {
  $discoveryRequest["properties"] = array();
}

if (!empty($criteria)) {
    $discoveryRequest["criteria"] = $criteria;
}
if (!empty($facets)) {
    $discoveryRequest["facets"] = $facets;
}

$webConfig = parse_ini_file("../../web.config.ini",  true);
$engineUrl = $webConfig["Application"]["discoveryEngineUrl"];
$queryUrl = $engineUrl . "/json/query";
$discoveryResponse = json_post($queryUrl, $discoveryRequest);

$response = array(
  '_discovery' => array(
    'request' => $discoveryRequest,
    'response' => $discoveryResponse
  )
);

if (!$renderParameters) {
  // Build results.
  // Start buffering all output so it can be captured in a variable and put into the JSON response
  ob_start();
?>
<html>
  <body>
    <div class="result-set ui-widget"><?php
  $itemIds = $discoveryResponse['itemIds'];
  if (!empty($itemIds)) {
    for ($i = 0; $i < count($itemIds); $i++) {
      $itemId = $itemIds[$i];
      $properties = $discoveryResponse['properties'][$i];
      $exactMatch = $discoveryResponse['exactMatches'][$i];
      $relevance = $discoveryResponse['relevanceValues'][$i]; ?>
      <div id="result-<?php echo $itemId ?>" class="result-row <?php echo $exactMatch ? 'ui-state-active' : 'ui-priority-secondary' ?> ui-widget-content ui-corner-all">
        <div class="info1">
          <span class="itemId"><?php echo $itemId ?></span>
          <span class="match"><?php echo $exactMatch ? 'exact' : 'close' ?></span>
          <span class="type"><?php echo $properties['type'] ?></span>
        </div>
        <div class="info2">
          <span class="price">$<?php echo $properties[type] == 'sales' ? $properties['price'] : $properties['lease'] ?></span>
          <span class="beds"><?php echo $properties['bedroom'] ?> BR</span>
          <span class="baths"><?php echo $properties['bath'] ?> BA</span>
        </div>
        <div class="info3">
          <span class="condition"><?php echo $properties['condition'] ?></span>
          <span class="style"><?php echo $properties['style'] ?></span>
          <span class="zipcode"><?php echo $properties['zipcode'] ?></span>
        </div>
      </div><?php
    }
  } ?>
    </div>
  </body>
</html>
<?php
  // Capture the buffered output and drop the temporary buffering
  $response['resultsHtml'] = ob_get_contents();
  ob_end_clean();
}

$json = json_encode($response);
if (isset($_GET['callback'])) {
  header("Content-Type: application/javascript; charset=utf-8");
  echo "{$_GET['callback']}($json)";
} else {
  header("Content-Type: application/json; charset=utf-8");
  echo $json;
}
