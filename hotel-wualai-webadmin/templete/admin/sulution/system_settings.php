

<!-- SweetAlert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<?php

// ตรวจสอบว่ามีการส่งข้อมูลหรือไม่
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $value = $_POST['value'];

    // อัปเดตค่าลงในฐานข้อมูล
    $stmt = $conn->prepare("UPDATE system_settings SET value = ? WHERE id = ?");
    $stmt->bind_param("si", $value, $id);
    $result = $stmt->execute();

    // แสดง SweetAlert
    if ($result) {
        echo "<script>
            window.onload = function() {
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ!',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = '?page=system_settings';
                });
            };
        </script>";
    } else {
        echo "<script>
            window.onload = function() {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: 'ไม่สามารถบันทึกข้อมูลได้'
                });
            };
        </script>";
    }
}

// ดึงข้อมูลทั้งหมด
$result = $conn->query("SELECT * FROM system_settings");
?>


 <!--**********************************
            Content body start
        ***********************************-->

            <!-- row -->
            <div class="container-fluid">
               <h3 class="mb-4">  <i class="fa fa-cog"></i> ตั้งค่าระบบ   

                 </h3>
<!-- ตัวอย่างปุ่มสวิต -->

<div class="row">
<div class="col-md-12">

 <div class="card shadow">
        
        <div class="card-body text-dark">
        
 <div class="table-responsive">
    
   <form method="post">
       <table id="example" class="display text-dark" style="min-width: 845px">
        <thead>
            <tr>
                <th>รายละเอียด</th>
                <th>ตั้งค่า</th>
                <th>จัดการ</th>
            </tr>
</thead>
  <tbody>
            <?php while ($row = $result->fetch_assoc()) { ?>
                <tr>
                    <form method="post">
                        <td><?php echo htmlspecialchars($row['description']); ?></td>
                        <td>
                            <?php if ($row['typedata'] == 'select') { ?>
                                <select name="value" class="form-control">
                                    <option value="true" <?php if ($row['value'] == 'true') echo 'selected'; ?>>true</option>
                                    <option value="false" <?php if ($row['value'] == 'false') echo 'selected'; ?>>false</option>
                                </select>
                            <?php } elseif ($row['typedata'] == 'number') { ?>
                                <input type="number" name="value" value="<?php echo htmlspecialchars($row['value']); ?>" class="form-control">
                            <?php } else { ?>
                                <input type="text" name="value" value="<?php echo htmlspecialchars($row['value']); ?>" class="form-control">
                            <?php } ?>
                        </td>
                        <td>
                            <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                            <button type="submit" class="btn btn-success">บันทึก</button>
                        </td>
                    </form>
                </tr>
            <?php } ?>
                            </tbody>
        </table>
    </form>


    
</div>
</div>


            </div>
     </div>
          </div>

                  </div>        </div>
        <!--**********************************
            Content body end
        ***********************************-->
