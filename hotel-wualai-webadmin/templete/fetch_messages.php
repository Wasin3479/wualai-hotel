
<?php
include("../include/conn.php");

$job_id = intval($_GET['job_id']);

$query = $conn->prepare("SELECT * FROM chat_messages WHERE job_id = ? ORDER BY created_at ASC");
$query->bind_param("i", $job_id);
$query->execute();
$result = $query->get_result();

while ($row = $result->fetch_assoc()) {
    echo '<div><strong>' . htmlspecialchars($row['sender_role']) . ':</strong> ' . 
         htmlspecialchars($row['message']) . 
         ' <small class="text-muted">(' . $row['created_at'] . ')</small></div>';
}
