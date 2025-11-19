<?php
include("../include/conn.php");
$request = $_GET;

$columns = ["sender","driver","title","date_dropoff","item_type","status","job_type","created_at","updated_at","actions"];
$idx = $request['order'][0]['column'];
$col = $columns[$idx];
$dir = $request['order'][0]['dir'];
$search = $conn->real_escape_string($request['search']['value']);

$searchSQL = "";
if ($search !== '') {
  $searchSQL = " AND (title LIKE '%$search%' OR status LIKE '%$search%' OR job_type LIKE '%$search%')";
}

$total = $conn->query("SELECT COUNT(*) AS cnt FROM jobs")->fetch_assoc()['cnt'];
$filtered = $conn->query("SELECT COUNT(*) AS cnt FROM jobs WHERE 1=1 $searchSQL")->fetch_assoc()['cnt'];

$start = intval($request['start']);
$length = intval($request['length']);
$sql = "SELECT * FROM jobs WHERE 1=1 $searchSQL ORDER BY $col $dir LIMIT $start, $length";
$res = $conn->query($sql);

$data = [];
while ($row = $res->fetch_assoc()) {
  $u = $conn->query("SELECT first_name, last_name FROM users WHERE id={$row['user_id']}")->fetch_assoc();
  $row['sender'] = $u ? "{$u['first_name']} {$u['last_name']}" : '';

  $w = $conn->query("SELECT first_name, last_name FROM workers WHERE id={$row['worker_id']}")->fetch_assoc();
  $row['driver'] = $w ? "{$w['first_name']} {$w['last_name']}" : '';

  $row['actions'] = "<button class='btn btn-info btn-sm' onclick='showJobDetail({$row['id']})'>ดูเพิ่มเติม</button>";
  $data[] = $row;
}

echo json_encode([
  "draw" => intval($request['draw']),
  "recordsTotal" => $total,
  "recordsFiltered" => $filtered,
  "data" => $data
]);
