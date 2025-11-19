
<?php
include("../include/conn.php");

$job_id = $_POST['job_id'];
$sender_id = $_POST['sender_id'];
$sender_role = $_POST['sender_role'];
$message = $_POST['message'];
$type = 'text';

$stmt = $conn->prepare("INSERT INTO chat_messages (job_id, sender_id, sender_role, type, message) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iisss", $job_id, $sender_id, $sender_role, $type, $message);
$stmt->execute();
?>
