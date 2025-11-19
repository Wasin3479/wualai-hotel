
 
 <!--**********************************
            Content body start
        ***********************************-->

            <!-- row -->
            <div class="container-fluid">
                     <h3 class="mb-4"> <i class="fa fa-file-image-o"></i> ภาพแบนเนอร์ <br><font size="3"></font></h3>
                <div class="row">
<div class="col-md-12">

 <div class="card shadow">
        
        <div class="card-body text-dark">
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
 <?php
// db.php

// ฟังก์ชันช่วย
function alert($msg) {
    echo "
    <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
    <script>
        Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: '".addslashes($msg)."',
            confirmButtonText: 'ตกลง'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location = 'super_admin.php?page=view_banners';
            }
        });
    </script>
    ";
}

// เพิ่มข้อมูล
if (isset($_POST['add'])) {
     $target_dir = "../img/storage/banner/";
    $filename = basename($_FILES["image_url"]["name"]);
    $target_file = $target_dir . time() . "_" . $filename;
     $urlfile="https://panel.buntook.com/$target_file";

    if (move_uploaded_file($_FILES["image_url"]["tmp_name"], $target_file)) {
        $stmt = $conn->prepare("INSERT INTO banners (title, description, image_url, link_url, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssss", $_POST['title'], $_POST['description'], $urlfile, $_POST['link_url'], $_POST['start_date'], $_POST['end_date'], $_POST['status']);
        $stmt->execute();
        alert("เพิ่มข้อมูลเรียบร้อยแล้ว");
    } else {
        alert("อัปโหลดรูปภาพไม่สำเร็จ");
    }
}

// แก้ไขข้อมูล
if (isset($_POST['edit'])) {
    $image_path = $_POST['old_image'];

    if (!empty($_FILES["image_url"]["name"])) {
        $target_dir = "../img/storage/banner/";
        $filename = basename($_FILES["image_url"]["name"]);
        $image_path = $target_dir . time() . "_" . $filename;
        move_uploaded_file($_FILES["image_url"]["tmp_name"], $image_path);
        $urlfile="https://panel.buntook.com/$image_path";
    }

    $stmt = $conn->prepare("UPDATE banners SET title=?, description=?, image_url=?, link_url=?, start_date=?, end_date=?, status=? WHERE id=?");
    $stmt->bind_param("sssssssi", $_POST['title'], $_POST['description'], $urlfile, $_POST['link_url'], $_POST['start_date'], $_POST['end_date'], $_POST['status'], $_POST['id']);
    $stmt->execute();
    alert("แก้ไขข้อมูลเรียบร้อยแล้ว");
}

// ลบข้อมูล
if (isset($_POST['delete'])) {
    $stmt = $conn->prepare("DELETE FROM banners WHERE id=?");
    $stmt->bind_param("i", $_POST['id']);
    $stmt->execute();
    alert("ลบข้อมูลเรียบร้อยแล้ว");
}

// ดึงข้อมูลทั้งหมด
$banners = $conn->query("SELECT * FROM banners");
?>


   <button class="btn btn-primary mb-3" data-toggle="modal" data-target="#addModal">+ เพิ่มแบนเนอร์</button>

      <table id="example" class="display text-dark" style="min-width: 845px">
            <thead>
                <tr>
                     <th>แสดงใน</th><th>ชื่อ</th><th>คำอธิบาย</th><th>ภาพ</th><th>ลิงก์</th>
                    <th>เริ่ม</th><th>สิ้นสุด</th><th>สถานะ</th><th>การกระทำ</th>
                </tr>
            </thead>
            <tbody>
                <?php while($row = $banners->fetch_assoc()): ?>
                <tr>
                      <td><?= $row['type'] ?></td>
                    <td><?= $row['title'] ?></td>
                    <td><?= $row['description'] ?></td>
                    <td><img src="<?= $row['image_url'] ?>" width="100px" height="" border="0" alt=""></td>
                    <td><?= $row['link_url'] ?></td>
                    <td><?= $row['start_date'] ?></td>
                    <td><?= $row['end_date'] ?></td>
                    <td><?= $row['status'] ?></td>
                    <td>
                      

<button type="button" class="btn btn-warning btn-sm" data-toggle="modal" data-target="#editModal<?= $row['id'] ?>">
แก้ไข
</button>


                        <form method="post" style="display:inline;" onsubmit="return confirm('ยืนยันการลบ?')" action="?page=view_banners">
                            <input type="hidden" name="id" value="<?= $row['id'] ?>">
                            <button type="submit" name="delete" class="btn btn-danger btn-sm">ลบ</button>
                        </form>
                    </td>
                </tr>


                <!-- Modal -->
<div class="modal fade" id="editModal<?= $row['id'] ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">แก้ไขแบนเนอร์</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
      <form method="post" class="modal-content text-dark" action="?page=view_banners" enctype="multipart/form-data">
      <input type="hidden" name="id" value="<?= $row['id'] ?>">
                              <div class="form-group">
    <label>ชื่อ</label>
    <input type="text" name="title" class="form-control" value="<?= @$row['title'] ?>" required>
</div>
<div class="form-group">
    <label>คำอธิบาย</label>
    <textarea name="description" class="form-control" required><?= @$row['description'] ?></textarea>
</div>
<div class="form-group">
    <label>อัปโหลดภาพ (ถ้าไม่เลือกจะใช้ภาพเดิม)</label>
    <input type="file" name="image_url" class="form-control-file" accept="image/*">
    <br><img src="<?= @$row['image_url'] ?>" width="100px">
    <input type="hidden" name="old_image" value="<?= @$row['image_url'] ?>">
</div>
<div class="form-group">
    <label>ลิงก์ URL</label>
    <input type="text" name="link_url" class="form-control" value="<?= @$row['link_url'] ?>" required>
</div>
<div class="form-group">
    <label>เริ่มแสดง</label>
    <input type="datetime-local" name="start_date" class="form-control" value="<?= @$row['start_date'] ? date('Y-m-d\TH:i', strtotime($row['start_date'])) : '' ?>" required>
</div>
<div class="form-group">
    <label>สิ้นสุดการแสดง</label>
    <input type="datetime-local" name="end_date" class="form-control" value="<?= @$row['end_date'] ? date('Y-m-d\TH:i', strtotime($row['end_date'])) : '' ?>" required>
</div>
<div class="form-group">
    <label>สถานะ</label>
    <select name="status" class="form-control" required>
        <option value="active" <?= @$row['status']=='active' ? 'selected' : '' ?>>แสดง</option>
        <option value="inactive" <?= @$row['status']=='inactive' ? 'selected' : '' ?>>ไม่แสดง</option>
    </select>
</div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">ปิด</button>
    <button type="submit" name="edit" class="btn btn-success">บันทึก</button></form>
      </div>
    </div>
  </div>
</div>    
                <!-- Modal Edit -->
             
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>





    <!-- Modal Add -->
<div class="modal fade" id="addModal" tabindex="-1">
    <div class="modal-dialog">
        <form method="post" class="modal-content text-dark" action="?page=view_banners" enctype="multipart/form-data">
            <div class="modal-header"><h5 class="modal-title">เพิ่มแบนเนอร์</h5></div>
            <div class="modal-body">
                <div class="form-group">
                    <label>ชื่อ</label>
                    <input type="text" name="title" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>คำอธิบาย</label>
                    <textarea name="description" class="form-control" required></textarea>
                </div>
                <div class="form-group">
                    <label>อัปโหลดภาพ</label>
                    <input type="file" name="image_url" class="form-control-file" accept="image/*" required>
                </div>
                <div class="form-group">
                    <label>ลิงก์ URL</label>
                    <input type="text" name="link_url" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>เริ่มแสดง</label>
                    <input type="datetime-local" name="start_date" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>สิ้นสุดการแสดง</label>
                    <input type="datetime-local" name="end_date" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>สถานะ</label>
                    <select name="status" class="form-control" required>
                        <option value="active">แสดง</option>
                        <option value="inactive">ไม่แสดง</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="submit" name="add" class="btn btn-primary">เพิ่ม</button>
            </div>
        </form>
    </div>
</div>


    <!-- Bootstrap Script -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
    

   </div>

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
