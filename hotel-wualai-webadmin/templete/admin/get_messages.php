
<?php
$job_id = $_GET['job_id'];

include("../include/conn.php");

$stmt = $conn->prepare("SELECT * FROM chat_messages WHERE job_id = ? ORDER BY created_at ASC");
$stmt->bind_param("i", $job_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    echo '<div><strong>' . htmlspecialchars($row['sender_role']) . ':</strong> ';
    echo htmlspecialchars($row['message']) . '<br><small>' . $row['created_at'] . '</small></div><hr>';
}

