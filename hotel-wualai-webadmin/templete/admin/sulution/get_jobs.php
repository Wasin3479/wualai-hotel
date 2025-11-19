<?php
include("../include/conn.php");// เชื่อมต่อฐานข้อมูล

$sql = "SELECT * FROM jobs";
$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()) {
    $row['images'] = json_decode($row['images'], true);

    // ดึงชื่อผู้ส่ง
    $user = $conn->query("SELECT first_name, last_name FROM users WHERE id = '{$row['user_id']}'")->fetch_assoc();
    $row['user_name'] = $user['first_name'] . ' ' . $user['last_name'];

    // ดึงชื่อคนขับ
    $worker = $conn->query("SELECT first_name, last_name FROM workers WHERE id = '{$row['worker_id']}'")->fetch_assoc();
    $row['worker_name'] = $worker['first_name'] . ' ' . $worker['last_name'];

    $data[] = $row;
}

echo json_encode($data);
?>