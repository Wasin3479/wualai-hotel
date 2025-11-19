<?php
// webhook.php - endpoint สำหรับ Rabbit POST notification
require 'config.php';
// อ่าน raw body
$raw = file_get_contents('php://input');
file_put_contents('webhook_debug.log', date('c') . " - " . $raw . PHP_EOL, FILE_APPEND);

// บันทึก log ใน DB
$stmt = $mysqli->prepare("INSERT INTO webhook_logs (payload) VALUES (?)");
$stmt->bind_param('s', $raw);
$stmt->execute();
$stmt->close();

// ตรวจสอบและอัพเดตสถานะรายการ
// โครงสร้าง JSON ของ webhook ขึ้นกับ Rabbit (ตัวอย่างทั่วไป)
$data = json_decode($raw, true);
if ($data && isset($data['data'])) {
    $tx = $data['data'];
    $order_id = $tx['order_id'] ?? null;
    $rabbit_txn_id = $tx['id'] ?? null;
    $status = $tx['status'] ?? null; // เช่น 'paid', 'failed', 'expired'

    if ($order_id) {
        $stmt = $mysqli->prepare("UPDATE transactions SET status=?, rabbit_txn_id=?, payload=JSON_MERGE_PATCH(payload, ?), updated_at=NOW() WHERE order_id=?");
        $payload_json = json_encode($tx, JSON_UNESCAPED_UNICODE);
        $stmt->bind_param('ssss', $status, $rabbit_txn_id, $payload_json, $order_id);
        $stmt->execute();
        $stmt->close();
    }
}

// ตอบกลับ 200 OK เพื่อบอก Rabbit ว่าเรารับข้อมูลแล้ว
http_response_code(200);
echo json_encode(['ok'=>true]);
