<?php
require 'config.php';

// รับข้อมูลจากฟอร์ม
$order_id = $_POST['order_id'] ?? null;
$amount = intval($_POST['totalAmount']*100 ?? 0); // ระบุเป็นสตางค์ (เช่น 10000 = 100.00 THB)
$payment_method = $_POST['payment_method'] ?? 'card';
$customerId = $_POST['customerId'] ?? null;
$type = $_POST['type'] ?? null;
$payerBank = $_POST['payerBank'] ?? null;
$difference = $_POST['difference'] ?? null;
$redirectUrl = "https://panel.buntook.com/payment/success.php?order_id=$order_id";
if (!$order_id || $amount <= 0) {
    die('Invalid request');
}

/*
  เตรียม payload สำหรับ Rabbit.
  NOTE: ฟิลด์ต่อไปนี้เป็นตัวอย่างแบบทั่วไป — 
  ชื่อฟิลด์จริงอาจแตกต่างกันตาม API spec ของ Rabbit (ตรวจสอบกับ docs)
*/
$payload = [
    "localId" => $order_id,
    "amount" => $amount,
    "currency" => "THB",
    "localData" => "Payment for order " . $order_id,
    // ตัวเลือก payment method — ปรับให้ตรงกับของ Rabbit
    "provider" => $payment_method,
    // callback / return url ที่ Rabbit จะ redirect กลับ
    "redirectUrl" => $redirectUrl,
    "webhook" => $redirectUrl,    // หากต้องการตั้งค่าเพิ่มเติม เช่น customer, metadata etc.
    "metadata" => [
      "client_ip" => $_SERVER['REMOTE_ADDR'],
    ]
];

$userAgent = $_SERVER['HTTP_USER_AGENT']; // ดึงค่า User-Agent
$os = "Unknown OS Platform";

// ตรวจจับระบบปฏิบัติการจาก User-Agent
if (preg_match('/android/i', $userAgent)) {
    $os = "android";
} elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
    $os = "ios";
}  elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
    $os = "ios";
}
// เพิ่ม metadata เฉพาะกรณี mobile_banking
if ($payment_method === 'mobile_banking') {
    $payload['metadata']['payerBank'] = $payerBank;         // หรือ 'bbl_mobile_banking'
    $payload['metadata']['osPlatform'] = $os;    // หรือ 'ios'
}

$upmoony="0";
// บันทึกรายการเป็น pending ใน DB ก่อน
$stmt = $mysqli->prepare("INSERT INTO transactions (order_id, amount, currency, payment_method, status, payload, useradd, typeuser, upmoony, difference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$payload_json = json_encode($payload, JSON_UNESCAPED_UNICODE);
$status = 'pending';
$stmt->bind_param('sissssssis', $order_id, $amount, $payload['currency'], $payment_method, $status, $payload_json, $customerId, $type, $upmoony, $difference);
$stmt->execute();
$local_txn_id = $stmt->insert_id;
$stmt->close();

// เรียก Rabbit API เพื่อสร้าง transaction
$ch = curl_init();
$apiUrl = RABBIT_API_BASE . ''; // endpoint ตัวอย่าง
$body = json_encode($payload, JSON_UNESCAPED_UNICODE);

$headers = [
    'Accept: application/json',
    'Content-Type: application/json',
    'Authorization: ' . RABBIT_API_KEY
];

curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);


// หากใช้ environment ที่มี self-signed cert, ระวังเรื่อง CURLOPT_SSL_VERIFYHOST/PEER
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($response === false) {
    // cURL error
    $mysqli->query("UPDATE transactions SET status='error', updated_at=NOW() WHERE id=".$local_txn_id);
    die("cURL error: " . $err);
}
  "<hr>"; echo $response; echo "<hr>";
// พยายาม decode response (Rabbit จะส่ง json)
$response_data = json_decode($response, true);

// บันทึก response ดิบไว้ใน payload (เพื่อ debug)
$resp_json = json_encode($response_data, JSON_UNESCAPED_UNICODE);

// ตรวจสอบ response แล้ว redirect user ไปช่องทางชำระ (เช่น checkout_url หรือ qr data)
if ($httpcode >= 200 && $httpcode < 300 && isset($response_data)) {
    // โครงสร้าง response ขึ้นกับ Rabbit — ตัวอย่างใช้ data.id และ data.checkout_url
    $rabbit_txn_id = $response_data['localId'] ?? null;
    $checkout_url = $response_data['checkout_url'] ?? ($response_data['url'] ?? null);
    // อาจได้ qr code หรือ qr payload สำหรับ PromptPay
$qr_data = $response_data['vendorQrCode'] ?? null; 
$expires = $response_data['expires'] ?? null; 



// แปลงเป็น DateTime object
$date = new DateTime($expires);

// แสดงในรูปแบบ "Y-m-d H:i:s"
$normal_datetime = $date->format('Y-m-d H:i:s');

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
      //  echo "<pre>";
       // print_r($item); // หรือแสดงเฉพาะ field ที่คุณต้องการ เช่น echo $item['qr']['url'];
      //  echo "</pre>";
      $qr_qr = $item['qr']['url'];
        $vendorUrl = $item['vendorUrl'];
        $found = true;
        break;
    }
}

    // Update DB
    $stmt = $mysqli->prepare("UPDATE transactions SET rabbit_txn_id=?, checkout_url=?, payload=?, status='created', qr_data=?, qr_image=?, expires_at=?, qr_data=? WHERE id=?");
    $stmt->bind_param('sssssssi', $rabbit_txn_id, $checkout_url, $resp_json, $qr_data, $qr_qr, $normal_datetime, $vendorUrl, $local_txn_id);
    $stmt->execute();
    $stmt->close();

    // ถ้ามี checkout_url ให้ redirect ไป
    if ($checkout_url) {

     echo "<meta http-equiv='refresh' content='0;url=pay.php?order_id=$order_id&customerId=$customerId&type=$type'>";
       
    }

    // ถ้าเป็น PromptPay และได้ qr data ให้แสดงหน้า QR (ง่ายสุด: แสดง qr_data เป็น text ให้ user สแกน)
    if ($payment_method === 'prompt_pay' && $qr_data) {
        // แสดง QR page (simple)
        echo "<h3>สแกน QR เพื่อจ่าย</h3>";
        echo "<p>ข้อมูล QR: " . htmlspecialchars($qr_data) . "</p>";
        // คุณอาจใช้ library สร้าง QR code image จาก $qr_data
        exit;
    }

    // ถ้าไม่มี redirect url ให้แสดง response เพื่อ debug
    echo "<pre>";
    echo "Created: \n";
   // print_r($response_data);
    echo "</pre>";
    exit;
} else {
     // เกิดข้อผิดพลาดจาก API
    $mysqli->query("UPDATE transactions SET status='failed', payload='". $mysqli->real_escape_string($resp_json) ."' WHERE id=".$local_txn_id);
    // แสดง error ให้ user (ดีขึ้น: ใช้ SweetAlert)
    echo "<h3>สร้างคำขอชำระไม่สำเร็จ</h3>";
    echo "HTTP: $httpcode<br>";
    echo htmlspecialchars($response);

    exit;
}
