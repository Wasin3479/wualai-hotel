<?php
include("../include/conn.php");

$request = $_GET;

// คอลัมน์ที่ DataTables ใช้
$columns = [
    "id", "tel", "pin", "verify", "logintype", "first_name", "last_name",
    "birth_date", "gender", "email", "worker_type", "individual_document",
    "company_name", "company_document", "profile_picture", "createAt", "updateAt",
    "workers_carbrand", "workers_carlicense"
];

// เงื่อนไขการเรียง
$columnIndex = $request['order'][0]['column'];
$columnName = $columns[$columnIndex];
$columnSortOrder = $request['order'][0]['dir'];
$searchValue = $request['search']['value'];

// เงื่อนไขค้นหา
$searchQuery = "";
if ($searchValue != '') {
    $searchValueEscaped = $conn->real_escape_string($searchValue); // ป้องกัน SQL Injection
    $searchQuery = " AND (
        tel LIKE '%$searchValueEscaped%' OR 
        first_name LIKE '%$searchValueEscaped%' OR 
        last_name LIKE '%$searchValueEscaped%' OR 
        email LIKE '%$searchValueEscaped%' OR 
        workers_carlicense LIKE '%$searchValueEscaped%' OR 
        workers_carbrand LIKE '%$searchValueEscaped%'
    )";
}

// จำนวนทั้งหมดก่อนกรอง
$totalRecordsQuery = "SELECT COUNT(*) as total FROM workers";
$totalRecordsResult = $conn->query($totalRecordsQuery);
$totalRecords = $totalRecordsResult->fetch_assoc()['total'];

// จำนวนทั้งหมดหลังกรอง
$totalFilteredQuery = "SELECT COUNT(*) as total FROM workers WHERE 1=1 $searchQuery";
$totalFilteredResult = $conn->query($totalFilteredQuery);
$totalFiltered = $totalFilteredResult->fetch_assoc()['total'];

// ดึงข้อมูลจริง
$start = $request['start'];
$length = $request['length'];

$sql = "SELECT * FROM workers WHERE 1=1 $searchQuery
        ORDER BY $columnName $columnSortOrder
        LIMIT $start, $length";

$data = [];
$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {
    $row['verify'] = $row['verify'] == 1
        ? "<button style='background-color: green; color: white; border: none; padding: 5px 10px; border-radius: 4px;'>ยืนยันแล้ว</button>"
        : "<button style='background-color: red; color: white; border: none; padding: 5px 10px; border-radius: 4px;'>ยังไม่ยืนยัน</button>";

    $row['profile_picture'] = "<img src='../img/{$row['profile_picture']}' width='50' height='50'>";

    $data[] = $row;
}

// Output JSON สำหรับ DataTables
$response = [
    "draw" => intval($request['draw']),
    "recordsTotal" => $totalRecords,
    "recordsFiltered" => $totalFiltered,
    "data" => $data
];

echo json_encode($response);
?>
