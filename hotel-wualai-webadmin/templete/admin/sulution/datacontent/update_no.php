<?php
include("../../include/conn.php"); // เชื่อมต่อฐานข้อมูล

if (isset($_POST['order'])) {
    foreach ($_POST['order'] as $item) {
        $id = intval($item['id']);
        $no = intval($item['no']);
        $stmt = $conn->prepare("UPDATE contentweb SET no = ? WHERE id = ?");
        $stmt->bind_param("ii", $no, $id);
        $stmt->execute();
    }
    echo 'success';
} else {
    echo 'no data';
}
?>
