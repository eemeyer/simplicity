<?php
require("../../util.php");

error_reporting(E_WARNING);

$pageSize = 5;
$startIndex = 0;

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

$criteria = array();

if (array_key_exists("category_type", $_GET)) {
  $criteria[] = array(
    "dimension" => "data_category_type_id",
    "value" => $_GET["category_type"]
  );
}

if (array_key_exists("dataset_freetext", $_GET)) {
  $ft = array(
    "dimension" => "freetext",
    "value" => $_GET["dataset_freetext"],
    "cull" => "true",
    "fieldBoosts" => array
    (
        "title" => 1.1,
        "keywords" => 0.9,
    )
  );
  if (array_key_exists("startsWith", $_GET)) {
    $ft["searchStyle"] = "startsWith";
  }
  $criteria[] = $ft;
}

if (array_key_exists("formats_avail", $_GET)) {
  $formats = $_GET["formats_avail"];
  $formats = is_array($formats) ? $formats : array($formats);
  foreach ($formats as $format) {
    $criteria[] = array(
      "dimension" => "formats_avail",
      "id" => $format
    );
  }
}

if (array_key_exists("agency", $_GET)) {
  $criteria[] = array(
    "dimension" => "agency",
    "id" => $_GET["agency"]
  );
}

if (array_key_exists("privacy", $_GET)) {
  $criteria[] = array(
    "dimension" => "privacy_and_confidentiality",
    "id" => $_GET["privacy"]
  );
}

$facets = array(
  "data_category_type_id" => array("includeLabel" => true),
  "agency" => array("minCount"=>1, "includeLabel" => true, "depth" => 1, "sortBy" => "labelAsc"),
  "formats_avail" => array("minCount"=>1),
  "privacy" => array("dimension" => "privacy_and_confidentiality")
);

$discoveryRequest = array(
    "startIndex" => $startIndex,
    "pageSize" => $pageSize,
    "highlighting" => array(
      "merge" => "properties",
      "template" => array("<span class=\"ui-state-highlight\">", "</span>")
    ),
    "explain" => "criterionValue"
);

$discoveryRequest["properties"] = array();

if (!empty($criteria)) {
    $discoveryRequest["criteria"] = $criteria;
}
if (!empty($facets)) {
    $discoveryRequest["facets"] = $facets;
}

$webConfig = parse_ini_file("../../web.config.ini",  true);
$engineUrl = $webConfig["Application"]["discoveryEngineGsaUrl"];
$queryUrl = $engineUrl . "/json/query";
$discoveryResponse = json_post($queryUrl, $discoveryRequest);

$response = array(
  '_discovery' => array(
    'request' => $discoveryRequest,
    'response' => $discoveryResponse
  )
);

// Build results.
// Start buffering all output so it can be captured in a variable and put into the JSON response
ob_start();
?>
<html>
  <body>
    <div class="result-set ui-widget"><?php
  $itemIds = $discoveryResponse['itemIds'];
  if (!empty($itemIds)) {
    $formats =array('has_csv', 'has_xls','has_kml'. 'has_pdf', 'has_rss','has_rdf', 'has_esri', 'has_map');
    for ($i = 0; $i < count($itemIds); $i++) {
      $itemId = $itemIds[$i];
      $properties = $discoveryResponse['properties'][$i];
      $exactMatch = $discoveryResponse['exactMatches'][$i];
      $relevance = $discoveryResponse['relevanceValues'][$i]; ?>
      <div id="result-<?php echo $itemId ?>" class="result-row <?php echo $exactMatch ? 'ui-state-active' : 'ui-priority-secondary' ?> ui-widget-content ui-corner-all">
        <div class="info1">
          <label>Item Id: <span class="itemId"><?php echo $itemId ?></span> <span class="match"><?php echo $exactMatch ? 'exact' : 'close' ?></span></label>
          <label>Title: <span class="title"><?php echo $properties['title']  ?></span></label>
        </div>
        <div class="info2">
          <label>Category: <span class="category"><?php echo $properties['category_name'] ?></span></label>
          <label>Agency: <span class="agency"><?php echo $properties['agency_name'] ?></span></label>
          <label>Sub Agency: <span class="subagency"><?php echo $properties['subagency_name'] ?></span></label>
        </div>
        <div class="info3">
          <label>Description:<span class="description"><?php echo $properties['description'] ?></span></label>
          <label>Keywords: <span class="keywords"><?php echo $properties['keywords'] ?></span></label>
          <label>Formats: <span class="formats_avail"><?php
            foreach ($formats as $fmt) {
             if ($properties[$fmt] == 1) {
               echo $fmt . " ";
             }
            }
          ?></span></label>
          <label>Privacy:<span class="privacy_and_confidentiality"><?php echo $properties['privacy_and_confidentiality'] ?></span></label>
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

$json = json_encode($response);
if (isset($_GET['callback'])) {
  header("Content-Type: application/javascript; charset=utf-8");
  echo "{$_GET['callback']}($json)";
} else {
  header("Content-Type: application/json; charset=utf-8");
  echo $json;
}
