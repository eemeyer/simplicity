<?php
require("../../util.php");

error_reporting(E_WARNING);

if (array_key_exists("itemIds", $_GET)) {
    $itemIds = explode(" ", $_GET["itemIds"]);
}
if (array_key_exists("exactMatches", $_GET)) {
    $exactMatches = str_split($_GET["exactMatches"]);
}
if (array_key_exists("totalSize", $_GET)) {
    $totalSize = (int) $_GET["totalSize"];
}
if (array_key_exists("exactSize", $_GET)) {
    $exactSize = (int) $_GET["exactSize"];
}
if (array_key_exists("startIndex", $_GET)) {
    $startIndex = (int) $_GET["startIndex"];
}
if (array_key_exists("pageSize", $_GET)) {
    $pageSize = (int) $_GET["pageSize"];
}

$discoveryRequest = array(
  "ids" => $itemIds
);

$webConfig = parse_ini_file("../../web.config.ini",  true);
$engineUrl = $webConfig["Application"]["discoveryEngineUrl"];
$itemsUrl = $engineUrl . "/ws/items";
$discoveryResponse = json_post($itemsUrl, $discoveryRequest);

?><html>
<body>
  <div class="result-set ui-widget"><?php
    $items = $discoveryResponse;
    if (!empty($itemIds)) {
      for ($i = 0; $i < count($items); $i++) {
        $item = $items[$i];
        $itemId = $item["_id"];
        $exactMatch = $exactMatches[$i]; ?>
    <div  id="result-<?php echo $itemId ?>" class="result-row <?php echo $exactMatch ? 'ui-state-active' : 'ui-priority-secondary' ?> ui-widget-content ui-corner-all">
      <div class="info1">
        <span class="itemId"><?php echo $itemId ?></span>
        <span class="match"><?php echo $exactMatch ? 'exact' : 'close' ?></span>
        <span class="type"><?php echo $item['type'] ?></span>
      </div>
      <div class="info2">
        <span class="price">$<?php echo $item[type] == 'sales' ? $item['price'] : $item['lease'] ?></span>
        <span class="beds"><?php echo $item['bedroom'] ?> BR</span>
        <span class="baths"><?php echo $item['bath'] ?> BA</span>
      </div>
      <div class="info3">
        <span class="condition"><?php echo $item['condition'] ?></span>
        <span class="style"><?php echo $item['style'] ?></span>
        <span class="zipcode"><?php echo $item['zipcode'] ?></span>
      </div>
    </div><?php
      }
    } ?>
  </div>
</body>
</html>
