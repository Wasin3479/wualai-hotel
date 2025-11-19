
  <div style='width: 100%; overflow-x: auto;'>
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css">
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>

<?php
$message = "";
$type = "";

if (isset($_POST['add'])) {
    $name_th = $_POST['name_th'];
	$name_en = $_POST['name_en'];
     $content = $_POST['content'];
      $detail = $_POST['detail'];
    if ($conn->query("INSERT INTO vehicle_categories (name_th,name_en,content,detail) VALUES ('$name_th','$name_en','$content','$detail')")) {
        $message = "เพิ่มข้อมูลสำเร็จ";
        $type = "success";
    } else {
        $message = "เกิดข้อผิดพลาดในการเพิ่มข้อมูล";
        $type = "error";
    }
}

if (isset($_POST['edit'])) {
    $id = $_POST['id'];
    $name_th = $_POST['name_th'];
	$name_en = $_POST['name_en'];
         $content = $_POST['content'];
      $detail = $_POST['detail'];
    if ($conn->query("UPDATE vehicle_categories SET name_th = '$name_th',name_en = '$name_en',content = '$content',detail = '$detail' WHERE id = $id")) {
        $message = "แก้ไขข้อมูลสำเร็จ";
        $type = "success";
    } else {
        $message = "เกิดข้อผิดพลาดในการแก้ไขข้อมูล";
        $type = "error";
    }
}

// ลบข้อมูล
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $conn->query("DELETE FROM vehicle_categories WHERE id = $id");
    echo "<script>
        window.onload = function() {
            Swal.fire('ลบแล้ว', 'ข้อมูลถูกลบเรียบร้อย', 'success')
            .then(() => window.location.href = '?page=car_settings&status=typecar');
        }
    </script>";
}
?>






    <button class="btn btn-primary my-3" data-toggle="modal" data-target="#addModal">+ เพิ่มกลุ่ม</button>

  <table id="example" class="display text-dark" style="min-width: 845px">
        <thead>
            <tr>
                <th>#</th>
                <th>ชื่อกลุ่ม</th>
				    <th>name</th>
                <th>การจัดการ</th>
            </tr>
        </thead>
        <tbody>
            <?php $v=0;
            $result = $conn->query("SELECT * FROM vehicle_categories");
            while ($row = $result->fetch_assoc()) { $v++;
            ?>
            <tr>
                <td><?= $v ?></td>
                <td><?= htmlspecialchars($row['name_th']) ?></td>
                 <td><?= htmlspecialchars($row['name_en']) ?></td>
                <td>

<a href="?page=car_settings&status=listtypecar&id_code=<?= htmlspecialchars($row['id']) ?>"  class="btn btn-info btn-sm">ประเภทรถ</a>

                    <button type="button" class="btn btn-warning btn-sm" data-toggle="modal" data-target="#editModal<?= $row['id'] ?>">
แก้ไข
</button>
                
                    
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete(<?= $row['id'] ?>)">ลบ</button>
                </td>
            </tr>

            <!-- Button trigger modal -->


<!-- Modal -->
<div class="modal fade" id="editModal<?= $row['id'] ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">แก้ไขกลุ่มรถ</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body"> <form method="post" class="modal-content">
        <input type="hidden" name="id" value="<?= $row['id'] ?>">
                            <div class="form-group">
                                <label>ชื่อกลุ่ม</label>
                                <input type="text" name="name_th" class="form-control" value="<?= htmlspecialchars($row['name_th']) ?>" required>
                            </div>
		   <div class="form-group">
                                <label>name</label>
                                <input type="text" name="name_en" class="form-control" value="<?= htmlspecialchars($row['name_en']) ?>" required>
                            </div>
                                  <div class="form-group">
                                <label>รายละเอียด</label>
                                  <textarea class="summernote" name="content" rows="3"><?= htmlspecialchars($row['content']) ?></textarea>
                           
                            </div>
                                  <div class="form-group">
                                <label>หมายเหตุ</label>
                                   <textarea class="summernote" name="detail" rows="3"><?= htmlspecialchars($row['detail']) ?></textarea>
                             
                            </div>
                        </div>
 
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">ปิด</button>
            <button type="submit" name="edit" class="btn btn-success">บันทึก</button>        </form>
      </div>
    </div>
  </div>
</div>
           
            <?php } ?>
        </tbody>
    </table>
</div>

<!-- Add Modal -->
<div class="modal fade" id="addModal" tabindex="-1">
    <div class="modal-dialog">
        <form method="post" class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">เพิ่มกลุ่มรถ</h5>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>ชื่อกลุ่ม</label>
                    <input type="text" name="name_th" class="form-control" required>
                </div>
				   <div class="form-group">
                    <label>name</label>
                    <input type="text" name="name_en" class="form-control" required>
                </div>
                 <div class="form-group">
                                <label>รายละเอียด</label>
                                  <textarea class="summernote" name="content" rows="3"></textarea>
                           
                            </div>
                                  <div class="form-group">
                                <label>หมายเหตุ</label>
                                   <textarea class="summernote" name="detail" rows="3"></textarea>
                             
                            </div>
            </div>
            <div class="modal-footer">
              
                <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                  <button type="submit" name="add" class="btn btn-primary">เพิ่ม</button>
            </div>
        </form>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap.bundle.min.js"></script>

<script>
function confirmDelete(id) {
    Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "หากลบแล้วจะไม่สามารถกู้คืนได้!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '?page=car_settings&status=typecar&delete=' + id;
        }
    });
}
</script>













<?php if ($message): ?>
<script>
window.onload = function() {
    Swal.fire({
        icon: '<?= $type ?>',
        title: '<?= $message ?>',
        showConfirmButton: false,
        timer: 1500
    }).then(() => {
        window.location.href = '?page=car_settings&status=typecar'; // ล้าง POST
    });
};
</script>
<?php endif; ?>