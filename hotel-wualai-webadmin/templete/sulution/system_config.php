<?php
// อัปเดตเมื่อ POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $config_value = $_POST['config_value'];

    $stmt = $conn->prepare("UPDATE system_config SET config_value = ? WHERE id = ?");
    $stmt->bind_param("si", $config_value, $id);
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

// ดึงข้อมูล
$result = $conn->query("SELECT * FROM system_config");
?>
 <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <style>
    input, select {
      padding: 5px;
      margin-bottom: 10px;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    table, th, td {
      border: 1px solid #ccc;
    }
    th, td {
      padding: 10px;
      text-align: left;
    }
    input, select {
      width: 100%;
      padding: 5px;
    }
    button {
      padding: 6px 12px;
    }
  </style>
  
 <!--**********************************
            Content body start
        ***********************************-->

            <!-- row -->
            <div class="container-fluid">
                     <h3 class="mb-4"> <i class="fa fa-user-plus"></i> ตั้งค่า Rabbit Gateway  
<br><font size="3"></font></h3>
                <div class="row">
<div class="col-md-12">

 <div class="card shadow">
        
        <div class="card-body text-dark">
<table>
  <thead>
    <tr>
      <th width="20%" >คำอธิบาย</th>
      <th>ค่า Config</th>
      <th>ดำเนินการ</th>
    </tr>
  </thead>
  <tbody>
    <?php while ($row = $result->fetch_assoc()): ?>
      <tr>
        <td><?= htmlspecialchars($row['description']) ?></td>
        <td>
          <form class="config-form" action="super_admin.php?page=system_config" medtod="POST">
            <input type="hidden" name="id" value="<?= $row['id'] ?>">

            <?php if ($row['status'] == 0): ?>
              <input type="text" name="config_value" value="<?= htmlspecialchars($row['config_value']) ?>" class="form-control">
            <?php elseif ($row['status'] == 1): ?>
              <input type="number" name="config_value" value="<?= htmlspecialchars($row['config_value']) ?>" class="form-control">
            <?php elseif ($row['status'] == 2): ?>
              <select name="config_value" class="form-control">
                <option value="จำนวนเต็ม" <?= $row['config_value'] == "จำนวนเต็ม" ? "selected" : "" ?>>จำนวนเต็ม</option>
                <option value="เปอร์เซ็นต์" <?= $row['config_value'] == "เปอร์เซ็นต์" ? "selected" : "" ?>>เปอร์เซ็นต์</option>
              </select>
            <?php endif; ?>
        </td>
        <td>
            <button type="submit" class="btn btn-success">บันทึก</button>
          </form>
        </td>
      </tr>
    <?php endwhile; ?>
  </tbody>
</table>


   </div>

   </div>
      </div>
         </div>
                   
           
<!-- Bootstrap CSS -->

<!-- Bootstrap JS (for Modal) -->




                </div>

            </div>

        <!--**********************************
            Content body end
        ***********************************-->
