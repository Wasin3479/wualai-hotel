<?php
require 'config.php';
date_default_timezone_set("Asia/Bangkok");
$order_id = $_GET["order_id"];
// เริ่ม cURL
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, "https://api.pgw.rabbit.co.th/public/v2/transactions");
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
// 🔐 ใส่ token ของคุณที่นี่
curl_setopt($curl, CURLOPT_HTTPHEADER, [
    "Accept: application/json",
    "Content-Type: application/json",
    "Authorization: $authToken"
]);
// ดึงข้อมูลจาก API
$responseja = curl_exec($curl);
// เช็คว่า cURL ทำงานสำเร็จหรือไม่
if (curl_errno($curl)) {
    echo 'cURL Error: ' . curl_error($curl);
    exit;
}
curl_close($curl);
// แปลง JSON response ให้เป็น array
$data = json_decode($responseja, true);
foreach ($data['items'] as $item) {
    if (isset($item['localId']) && $item['localId'] === $order_id) {
        // แสดงเฉพาะข้อมูลรายการที่ตรงกับ localId
        $datanow=date("Y-m-d H:i:s");
	$sql = "UPDATE transactions SET 
			status = '".$item['state']."' ,
			datepay_a = '".$datanow."'
			WHERE order_id = '".$order_id."' ";
	$query = mysqli_query($mysqli,$sql);
        echo $item['state'];
        $found = true;
        break;
    }
}
?>
