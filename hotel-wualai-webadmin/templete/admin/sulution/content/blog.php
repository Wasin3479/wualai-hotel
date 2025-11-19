<?php

// เพิ่มข้อมูล
if (isset($_POST['add'])) {
    $title = $_POST['title'];
    $author = $_POST['author'];
    $publish_date = $_POST['publish_date'];
    $typedata = $_POST['typedata'];
    $content = $_POST['content'];
    $image = '';

    if ($_FILES['image']['name']) {
        $image = '../img/' . time() . '_' . basename($_FILES["image"]["name"]);
        move_uploaded_file($_FILES["image"]["tmp_name"], $image);
    }

    $stmt = $conn->prepare("INSERT INTO blog_posts (title, image, author, publish_date, typedata, content, codelist) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $title, $image, $author, $publish_date, $typedata, $content, $HTTP_HOST);
    $stmt->execute();
    echo "<script>
    Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        showConfirmButton: true,
        confirmButtonText: 'ตกลง',
        timer: 3000,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            window.location.href = '?page=editcontent&id=$strid';
        }
    });
</script>";
}

// ลบข้อมูล
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $conn->query("DELETE FROM blog_posts WHERE id=$id");
     echo "<script>
    Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        showConfirmButton: true,
        confirmButtonText: 'ตกลง',
        timer: 3000,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            window.location.href = '?page=editcontent&id=$strid';
        }
    });
</script>";
}

// แก้ไขข้อมูล
if (isset($_POST['edit'])) {
    $id = $_POST['id'];
    $title = $_POST['title'];
    $author = $_POST['author'];
    $publish_date = $_POST['publish_date'];
    $typedata = $_POST['typedata'];
    $content = $_POST['content'];
    
    $image = $_POST['old_image'];
    if ($_FILES['image']['name']) {
        $image = 'uploads/' . time() . '_' . basename($_FILES["image"]["name"]);
        move_uploaded_file($_FILES["image"]["tmp_name"], $image);
    }

    $stmt = $conn->prepare("UPDATE blog_posts SET title=?, image=?, author=?, publish_date=?, typedata=?, content=? WHERE id=?");
    $stmt->bind_param("ssssssi", $title, $image, $author, $publish_date, $typedata, $content, $id);
    $stmt->execute();
      echo "<script>
    Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        showConfirmButton: true,
        confirmButtonText: 'ตกลง',
        timer: 3000,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            window.location.href = '?page=editcontent&id=$strid';
        }
    });
</script>";
}
?>
  <div align="right"> <button class="btn btn-success mb-2" data-toggle="modal" data-target="#addModal">+ เพิ่มโพสต์</button>
<a href="?page=webcontent" class="btn btn-danger mb-2">ย้อนกลับ</a>
</div>

       <div class="table-responsive">
      <table id="example" class="display" style="min-width: 845px">
        <thead>
            <tr>
                <th width="20%">รูป</th>
                <th>ชื่อเรื่อง</th>
                <th>ผู้เขียน</th>
                <th>วันที่เผยแพร่</th>
                <th>ประเภท</th>
                <th>การจัดการ</th>
            </tr>
        </thead>
        <tbody>
        <?php
        $res = $conn->query("SELECT * FROM blog_posts WHERE codelist = '".$HTTP_HOST."' and typedata = '".$code_content."' ORDER BY id DESC");
        while ($row = $res->fetch_assoc()):
        ?>
            <tr>
                <td><img src="<?= $row['image'] ?>" width="100%"></td>
                <td><?= $row['title'] ?></td>
                <td><?= $row['author'] ?></td>
                <td><?= $row['publish_date'] ?></td>
                <td><?= $row['typedata'] ?></td>
                <td>
                    <button class="btn btn-warning btn-sm" data-toggle="modal" data-target="#editModal<?= $row['id'] ?>">แก้ไข</button>
                    <a href="?delete=<?= $row['id'] ?>" class="btn btn-danger btn-sm" onclick="return confirm('ยืนยันการลบ?')">ลบ</a>
                </td>
            </tr>

            <!-- Edit Modal -->
            <div class="modal fade" id="editModal<?= $row['id'] ?>">
                <div class="modal-dialog modal-xl">
                    <form method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="id" value="<?= $row['id'] ?>">
                        <input type="hidden" name="old_image" value="<?= $row['image'] ?>">
                        <div class="modal-content text-dark">
                            <div class="modal-header"><h5 class="modal-title">แก้ไขโพสต์</h5></div>
                            <div class="modal-body">
                                <div class="form-group">
                                    <label>ชื่อเรื่อง</label>
                                    <input type="text" name="title" class="form-control" value="<?= $row['title'] ?>" required>
                                </div>
                                <div class="form-group">
                                    <label>ผู้เขียน</label>
                                    <input type="text" name="author" class="form-control" value="<?= $row['author'] ?>" required>
                                </div>
                                <div class="form-group">
                                    <label>วันที่เผยแพร่</label>
                                    <input type="date" name="publish_date" class="form-control" value="<?= $row['publish_date'] ?>" required>
                                </div>
                                <div class="form-group">
                                    <label>ประเภท</label>
                                    <input type="text" name="typedata" class="form-control" value="<?= $row['typedata'] ?>" required>
                                </div>
                                <div class="form-group">
                                    <label>เนื้อหา</label>
                                    <textarea name="content" class="summernote form-control" rows="4"><?= $row['content'] ?></textarea>
                                </div>
                                <div class="form-group">
                                    <label>รูปภาพ</label>
                                    <input type="file" name="image" class="form-control">
                                    <img src="<?= $row['image'] ?>" width="100" class="mt-2">
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="submit" name="edit" class="btn btn-primary">บันทึก</button>
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

        <?php endwhile; ?>
        </tbody>
    </table>
</div>
</div>
<!-- Add Modal -->
<div class="modal fade" id="addModal">
    <div class="modal-dialog modal-xl">
        <form method="POST" enctype="multipart/form-data">
            <div class="modal-content text-dark">
                <div class="modal-header"><h5 class="modal-title">เพิ่มโพสต์ใหม่</h5></div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>ชื่อเรื่อง</label>
                        <input type="text" name="title" class="form-control" required>
                           <input type="hidden" name="typedata" class="form-control" value="<?php echo $code_content;?>" required>
                    </div>
                    <div class="form-group">
                        <label>ผู้เขียน</label>
                        <input type="text" name="author" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>วันที่เผยแพร่</label>
                        <input type="date" name="publish_date" class="form-control" required>
                    </div>
                 
                    <div class="form-group">
                        <label>เนื้อหา</label>
                        <textarea name="content" class="summernote form-control" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label>รูปภาพ</label>
                        <input type="file" name="image" class="form-control" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" name="add" class="btn btn-success">บันทึก</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                </div>
            </div>
        </form>
    </div>
</div>
