

 <!--**********************************
            Content body start
        ***********************************-->

<?php
if (isset($_POST['update_status'])) {
    $jobId = (int) $_POST['job_id'];
    $newStatus = trim($_POST['status']);

    // ตรวจสอบว่าอยู่ในสถานะที่ถูกต้อง
    $validStatuses = ['current', 'upcoming', 'negotiating', 'draft', 'completed'];

    if (in_array($newStatus, $validStatuses)) {
        $stmt = $conn->prepare("UPDATE jobs SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $newStatus, $jobId);
        $stmt->execute();
        $stmt->close();
        
      echo "
<script>
  Swal.fire({
    icon: 'success',
    title: 'อัปเดตสถานะสำเร็จ',
    text: 'กำลังเปลี่ยนเส้นทาง...',
    timer: 2000,
    showConfirmButton: false
  }).then(() => {
    window.location.href = 'super_admin.php?page=edit_jobs';
  });
</script>";
    }
}
?>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

            <!-- row -->
            <div class="container-fluid">
                     <h3 class="mb-4"> <i class="fa fa-address-book-o"></i> ดูรายการจ้างงาน <br><font size="3"></font></h3>
                <div class="row">
<div class="col-md-12">

 <div class="card shadow">
        
        <div class="card-body text-dark">


   <div style='width: 100%; overflow-x: auto;'>
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css">
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>


<?php
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
if ($limit < 1) $limit = 10;
$page = isset($_GET['pagel']) ? (int)$_GET['pagel'] : 1;
if ($page < 1) $page = 1;

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$start = ($page - 1) * $limit;

$searchCondition = "";
if (!empty($search)) {
    $safeSearch = $conn->real_escape_string($search);
    $searchCondition = "WHERE 
        title LIKE '%$safeSearch%' OR
        item_type LIKE '%$safeSearch%' OR
        status LIKE '%$safeSearch%' OR
        job_type LIKE '%$safeSearch%' OR
        description LIKE '%$safeSearch%' OR
        pickup_location_text LIKE '%$safeSearch%' OR
        dropoff_location_text LIKE '%$safeSearch%' OR
        payment_method LIKE '%$safeSearch%'";
}

// Main data query
$sql = "SELECT * FROM jobs $searchCondition ORDER BY created_at DESC LIMIT $start, $limit";
$result = $conn->query($sql);

// Count for pagination
$totalResult = $conn->query("SELECT COUNT(*) AS total FROM jobs $searchCondition");
$totalRow = $totalResult->fetch_assoc();
$totalPages = ceil($totalRow['total'] / $limit);

?>
<form class="form-inline mb-3 justify-content-end" method="get" action="">
  <input type="hidden" name="page" value="view_jobs">

  <!-- ช่องค้นหา -->
  <input type="text" name="search" class="form-control form-control-sm mr-2" placeholder="ค้นหา..." 
         value="<?= isset($_GET['search']) ? htmlspecialchars($_GET['search']) : '' ?>">

  <!-- ตัวเลือก limit -->
  <select class="form-control form-control-sm mr-2" name="limit" onchange="this.form.submit()">
    <?php
      $selectedLimit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
      $options = [10, 20, 30, 50, 100];
      foreach ($options as $opt) {
        $selected = ($selectedLimit === $opt) ? 'selected' : '';
        echo "<option value=\"$opt\" $selected>$opt รายการ</option>";
      }
    ?>
  </select>

  <button type="submit" class="btn btn-sm btn-primary">ค้นหา</button>
</form>
<table id="examplecv" class="table table-bordered table-striped table-sm text-dark" style="min-width: 845px">
    <thead class="">
      <tr>
        <th>ID</th>
        <th>ผู้ส่ง</th>
        <th>คนขับ</th>
        <th>ชื่องาน</th>
        <th>วันที่รับของ</th>
        <th>ประเภท</th>
        <th>สถานะ</th>
        <th>ประเภทงาน</th>
        <th>สร้างเมื่อ</th>
        <th>แก้ไขเมื่อ</th>
     
        <th>รายละเอียด</th>
      </tr>
    </thead>
    <tbody>
      <?php while($row = $result->fetch_assoc()): ?>
        <?php ini_set('display_errors', 0);
          $images = json_decode($row['images'], true); // แปลง JSON เป็น array
        ?>
        <tr>
               <td><?= htmlspecialchars($row['id']) ?><br></td>
          <td><?php
          $sqlui = "SELECT * FROM users WHERE id = '".$row['user_id']."' ";
$queryui = mysqli_query($conn,$sqlui);

while($resultui=mysqli_fetch_array($queryui,MYSQLI_ASSOC))
{
    echo $resultui["first_name"];  echo " "; echo $resultui["last_name"];
}
          ?></td>
           <td><?php
          $sqlui = "SELECT * FROM workers WHERE id = '".$row['worker_id']."' ";
$queryui = mysqli_query($conn,$sqlui);

while($resultui=mysqli_fetch_array($queryui,MYSQLI_ASSOC))
{
    echo $resultui["first_name"];  echo " "; echo $resultui["last_name"];
}
          ?></td>
          <td><?= htmlspecialchars($row['title']) ?><br></td>
          <td><?= htmlspecialchars($row['date_dropoff']) ?></td>
          <td><?= htmlspecialchars($row['item_type']) ?></td>
          <td><?php
$status = strtolower(trim($row['status']));

if ($status == 'current') {
    echo '<span class="badge badge-info">กำลังดำเนินการ</span>';
} elseif ($status == 'upcoming') {
    echo '<span class="badge badge-warning">ใกล้เริ่มงาน</span>';
} elseif ($status == 'negotiating') {
    echo '<span class="badge badge-primary">กำลังต่อรอง</span>';
} elseif ($status == 'draft') {
    echo '<span class="badge badge-secondary">ร่าง</span>';
} elseif ($status == 'completed') {
    echo '<span class="badge badge-success">เสร็จสิ้น</span>';
} else {
    echo '<span class="badge badge-dark">' . htmlspecialchars($row['status']) . '</span>';
}
?></td>
          <td><?= htmlspecialchars($row['job_type']) ?></td>
          <td><?= htmlspecialchars($row['created_at']) ?></td>
          <td><?= htmlspecialchars($row['updated_at']) ?></td>
         
          <td>
  <button class="btn btn-warning btn-sm" data-toggle="modal" data-target="#editStatusModal<?= $row['id'] ?>">แก้ไขสถานะ</button>
</td>
        </tr>

       <!-- MODAL: แก้ไขสถานะ -->
<div class="modal fade" id="editStatusModal<?= $row['id'] ?>" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <form method="post" action="">
        <div class="modal-header">
          <h5 class="modal-title">แก้ไขสถานะงาน: <?= htmlspecialchars($row['title']) ?></h5>
          <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>

        <div class="modal-body">
          <input type="hidden" name="job_id" value="<?= $row['id'] ?>">
          
          <div class="form-group">
            <label for="status">สถานะใหม่:</label>
            <select name="status" class="form-control" required>
              <option value="current" <?= $row['status'] == 'current' ? 'selected' : '' ?>>กำลังดำเนินการ</option>
              <option value="upcoming" <?= $row['status'] == 'upcoming' ? 'selected' : '' ?>>ใกล้เริ่มงาน</option>
              <option value="negotiating" <?= $row['status'] == 'negotiating' ? 'selected' : '' ?>>กำลังต่อรอง</option>
              <option value="draft" <?= $row['status'] == 'draft' ? 'selected' : '' ?>>ร่าง</option>
              <option value="completed" <?= $row['status'] == 'completed' ? 'selected' : '' ?>>เสร็จสิ้น</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
           <button type="submit" name="update_status" class="btn btn-success">บันทึก</button>
        </div>
      </form>
    </div>
  </div>
</div>


       
      <?php endwhile; ?>
    </tbody>
  </table>

<nav>
  <ul class="pagination justify-content-start">
    <?php if ($page > 1): ?>
      <li class="page-item">
        <a class="page-link" href="super_admin.php?page=edit_jobs&pagel=<?= $page - 1 ?>&search=<?= urlencode($search) ?>&limit=<?= $limit ?>">« ก่อนหน้า</a>
      </li>
    <?php endif; ?>

    <?php for ($i = 1; $i <= $totalPages; $i++): ?>
      <li class="page-item <?= ($i == $page) ? 'active' : '' ?>">
        <a class="page-link" href="super_admin.php?page=edit_jobs&pagel=<?= $i ?>&search=<?= urlencode($search) ?>&limit=<?= $limit ?>"><?= $i ?></a>
      </li>
    <?php endfor; ?>

    <?php if ($page < $totalPages): ?>
      <li class="page-item">
        <a class="page-link" href="super_admin.php?page=edit_jobs&pagel=<?= $page + 1 ?>&search=<?= urlencode($search) ?>&limit=<?= $limit ?>">ถัดไป »</a>
      </li>
    <?php endif; ?>
  </ul>
</nav>

</div>
</div>
<!-- GOOGLE MAP API -->
<script src="https://maps.googleapis.com/maps/api/js?key="></script>
   </div>
      </div>
         </div>
                   
           
<!-- Bootstrap CSS -->

<!-- Bootstrap JS (for Modal) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>



                </div>

            </div>

        <!--**********************************
            Content body end
        ***********************************-->
