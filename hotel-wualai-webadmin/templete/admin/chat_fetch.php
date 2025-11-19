
<?php
include("../include/conn.php");
$job_id = $_GET['job_id'];

$sql = "SELECT * FROM chat_messages WHERE job_id = ? ORDER BY created_at ASC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $job_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
  echo '<div class="chat-msg">';
  echo '<strong>' . htmlspecialchars($row['sender_role']) . ':</strong> ';
  echo nl2br(htmlspecialchars($row['message']));
  echo '<br><small class="text-muted">' . $row['created_at'] . '</small>';
  echo '</div>';
}
