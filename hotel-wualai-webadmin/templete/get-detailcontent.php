<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title></title>
    <!-- Favicon icon -->
    <link rel="icon" type="image/png" sizes="16x16" href="./images/favicon.png">
    <link rel="stylesheet" href="./vendor/select2/css/select2.min.css">


</head>

<body>
<?php
$HTTP_HOST="localhost";
include("../include/conn.php");
$res = $conn->query("SELECT id, titlethai FROM detailcontent WHERE codelist = '".$HTTP_HOST."'");
echo ' <div class="form-group">
          เลือกเนื้อหา <select class="form-control mb-2" id="single-select" name="linkdata">';
while ($r = $res->fetch_assoc()) {
  echo "<option value='{$r['id']}'>{$r['titlethai']}</option>";
}
echo '</select> </div>';

?>
    <script src="./vendor/global/global.min.js"></script>
    <script src="./js/quixnav-init.js"></script>
    <script src="./js/custom.min.js"></script>
    

    <script src="./vendor/select2/js/select2.full.min.js"></script>
    <script src="./js/plugins-init/select2-init.js"></script>

</body>

</html>