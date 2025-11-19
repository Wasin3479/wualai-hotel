<?php
include("include/conn.php");

$request = $_GET;

// คอลัมน์ที่ DataTables ใช้
$columns = [
    "id", "tel", "pin", "verify", "logintype", "first_name", "last_name",
    "birth_date", "gender", "email", "user_type", "individual_document",
    "company_name", "company_document", "profile_picture", "createAt", "updateAt"
];

// เงื่อนไขการเรียง
$columnIndex = $request['order'][0]['column'];
$columnName = $columns[$columnIndex];
$columnSortOrder = $request['order'][0]['dir'];
$searchValue = $request['search']['value'];

// เงื่อนไขค้นหา
$searchQuery = "";
if ($searchValue != '') {
    $searchQuery = " AND (tel LIKE '%$searchValue%' OR first_name LIKE '%$searchValue%' OR last_name LIKE '%$searchValue%')";
}

// จำนวนทั้งหมดก่อนกรอง
$totalRecordsQuery = "SELECT COUNT(*) as total FROM users";
$totalRecordsResult = $conn->query($totalRecordsQuery);
$totalRecords = $totalRecordsResult->fetch_assoc()['total'];

// จำนวนทั้งหมดหลังกรอง
$totalFilteredQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1 $searchQuery";
$totalFilteredResult = $conn->query($totalFilteredQuery);
$totalFiltered = $totalFilteredResult->fetch_assoc()['total'];

// ดึงข้อมูลจริง
$start = $request['start'];
$length = $request['length'];

$sql = "SELECT * FROM users WHERE 1=1 $searchQuery
        ORDER BY $columnName $columnSortOrder
        LIMIT $start, $length";

$data = [];
$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {
    $row['verify'] = $row['verify'] == 1
        ? "<button style='background-color: green; color: white; border: none; padding: 5px 10px; border-radius: 4px;'>ยืนยันแล้ว</button>"
        : "<button style='background-color: red; color: white; border: none; padding: 5px 10px; border-radius: 4px;'>ยังไม่ยืนยัน</button>";

    $row['profile_picture'] = "<button type='button' class='btn btn-lignt' data-toggle='modal' data-target='#picModal{$row['id']}'>
<img src='https://api.buntook.com{$row['profile_picture']}' width='50' height='50'>
</button>

<!-- Modal -->
<div class='modal fade' id='picModal{$row['id']}' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
  <div class='modal-dialog' role='document'>
    <div class='modal-content'>
      <div class='modal-header'>
        <h5 class='modal-title' id='exampleModalLabel'>ภาพโปรไฟล์</h5>
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'>
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
      <div class='modal-body'>
       <img src='https://api.buntook.com{$row['profile_picture']}' width='100%' height=''>
      </div>
      <div class='modal-footer'>
        <button type='button' class='btn btn-secondary' data-dismiss='modal'>ปิด</button>
      </div>
    </div>
  </div>
</div>";

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
