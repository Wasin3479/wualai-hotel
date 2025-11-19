<?php
include("include/conn.php");

$id = intval($_POST['id']);
$verify = intval($_POST['verify']);

if ($id && ($verify === 0 || $verify === 1)) {
    $stmt = $conn->prepare("UPDATE workers SET verify = ? WHERE id = ?");
    $stmt->bind_param("ii", $verify, $id);
    if ($stmt->execute()) {
       echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
       echo json_encode(['success' => false, 'message' => 'อัพเดตข้อมูลล้มเหลว']);
    }
    $stmt->close();
} else {
    http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'ข้อมูลไม่ครบถ้วน']);
}

$conn->close();
?>
