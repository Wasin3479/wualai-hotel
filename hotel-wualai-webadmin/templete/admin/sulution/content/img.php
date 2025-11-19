<?php


// เพิ่มข้อมูล
if (isset($_POST['add'])) {
    $stmt = $conn->prepare("INSERT INTO testimonials_type (codedata_tm, nameth, nameeng, codelist, codedata) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $_POST['codedata_tm'], $_POST['nameth'], $_POST['nameeng'], $HTTP_HOST, $codedata);
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

// แก้ไขข้อมูล
if (isset($_POST['edit'])) {
    $stmt = $conn->prepare("UPDATE testimonials_type SET codedata_tm=?, nameth=?, nameeng=?, codelist=?, codedata=? WHERE id=?");
    $stmt->bind_param("sssssi", $_POST['codedata_tm'], $_POST['nameth'], $_POST['nameeng'], $HTTP_HOST, $codedata, $_POST['id']);
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
    $conn->query("DELETE FROM testimonials_type WHERE id=" . $_GET['delete']);
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


<div class="row mb-3">
 <div class="col-md-6"> <h3 class="mb-0">จัดการประเภท </h3> </div>
 <div class="col-md-6" align="right"> <button class="btn btn-success" data-toggle="modal" data-target="#addModal">+ เพิ่มประเภท</button> </div>
</div>
    <table class="table table-bordered table-sm text-dark">
        <thead>
            <tr>
                  <th>code</th>
                <th>ชื่อภาษาไทย</th>
                <th>ชื่อภาษาอังกฤษ</th>
                <th>จัดการ</th>
            </tr>
        </thead>
        <tbody>
        <?php
        $res = $conn->query("SELECT * FROM testimonials_type WHERE codedata = '".$codedata."' and codelist = '".$HTTP_HOST."'");
        while ($row = $res->fetch_assoc()):
        ?>
            <tr>
              <td><?= $row['codedata_tm'] ?></td>
                <td><?= $row['nameth'] ?></td>
                <td><?= $row['nameeng'] ?></td>
                <td>
                    <button class="btn btn-warning btn-sm" data-toggle="modal" data-target="#editModal<?= $row['id'] ?>">แก้ไข</button>
                  <a href="?page=editcontent&id=<?php echo $strid;?>&delete=<?= $row['id'] ?>" 
   class="btn btn-danger btn-sm btn-delete" 
   data-id="<?= $row['id'] ?>">ลบ</a>
                </td>
            </tr>

            <!-- Modal แก้ไข -->
            <div class="modal fade" id="editModal<?= $row['id'] ?>">
                <div class="modal-dialog">
                    <form method="POST">
                        <input type="hidden" name="id" value="<?= $row['id'] ?>">
                        <div class="modal-content text-dark">
                            <div class="modal-header"><h5 class="modal-title">แก้ไขข้อมูล</h5></div>
                            <div class="modal-body">
                    
                                <div class="form-group">
                                    <label>nameth</label>
                                    <input type="text" name="nameth" class="form-control" value="<?= $row['nameth'] ?>" required>
                                           <input type="hidden" name="codedata_tm" class="form-control" value="<?= $row['codedata_tm'] ?>" required>
                                              <input type="hidden" name="codelist" class="form-control" value="<?= $row['codelist'] ?>" required>
                                                 <input type="hidden" name="codedata" class="form-control" value="<?= $row['codedata'] ?>" required>
                                </div>
                                <div class="form-group">
                                    <label>nameeng</label>
                                    <input type="text" name="nameeng" class="form-control" value="<?= $row['nameeng'] ?>" required>
                                </div>
                               
                            </div>
                            <div class="modal-footer">
                          
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                                      <button type="submit" name="edit" class="btn btn-primary">บันทึก</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        <?php endwhile; ?>
        </tbody>
    </table>
</div>

<!-- Modal เพิ่มข้อมูล -->
<div class="modal fade" id="addModal">
    <div class="modal-dialog">
        <form method="POST">
            <div class="modal-content text-dark">
                <div class="modal-header"><h5 class="modal-title">เพิ่มข้อมูล</h5></div>
                <div class="modal-body">
                  <div class="form-group">
                        <label>code</label>
                          <input type="text" name="codedata_tm" class="form-control" value="<?php
function randtext($range){
	$char = 'abcdefghijklmnopqrstuvwxyz123456789';
	$start = rand(1,(strlen($char)-$range));
	$shuffled = str_shuffle($char);
	return substr($shuffled,$start,$range);
}

echo randtext(5);
?>" required>
                        
                    </div>
                    <div class="form-group">
                        <label>ชื่อภาษาไทย</label>
                   
                        <input type="text" name="nameth" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>ชื่อภาษาอังกฤษ</label>
                        <input type="text" name="nameeng" class="form-control" required>
                    </div>
                  
                </div>
                <div class="modal-footer">
                
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                        <button type="submit" name="add" class="btn btn-success">บันทึก</button>
                </div>
            </div>
        </form>
    </div>
</div>



<!-- Bootstrap และ jQuery -->
<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>

<script>
document.addEventListener("DOMContentLoaded", function () {
  const deleteButtons = document.querySelectorAll('.btn-delete');

  deleteButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const deleteUrl = this.getAttribute('href');

      Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "ข้อมูลจะถูกลบและไม่สามารถกู้คืนได้!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = deleteUrl;
        }
      });
    });
  });
});
</script>


<?php
// โหลดรายการ detailcontent
$detailcontentOptions = '';
$resDetail = $conn->query("SELECT id, titlethai FROM detailcontent WHERE codelist = '".$HTTP_HOST."' ");
while ($d = $resDetail->fetch_assoc()) {
    $detailcontentOptions .= "<option value='{$d['id']}'>{$d['titlethai']}</option>";
}


$detailcontentOptions2 = '';
$resDetail2 = $conn->query("SELECT codedata_tm, nameth FROM testimonials_type WHERE codedata = '".$codedata."' and codelist = '".$HTTP_HOST."'");
while ($d2 = $resDetail2->fetch_assoc()) {
     $detailcontentOptions2 .= "<option value='{$d2['codedata_tm']}'>{$d2['nameth']}</option>";
}


if (isset($_POST['add'])) {
    $titlethai = $_POST['titlethai'];
    $titleeng = $_POST['titleeng'];
    $typedata = $_POST['typedata'];
    $codelist = $_POST['codelist'];
    $codedata = $_POST['codedata'];
    $typelink = $_POST['typelink'];

    $linkdata = ($typelink == '1') ? $_POST['linkdata_select'] : $_POST['linkdata_text'];

    // Upload Image
    $targetDir = "../img/";
    $imageName = basename($_FILES["image_url"]["name"]);
    $targetFile = $targetDir . time() . "_" . $imageName;
    move_uploaded_file($_FILES["image_url"]["tmp_name"], $targetFile);

    $stmt = $conn->prepare("INSERT INTO testimonials (titlethai, titleeng, image_url, typedata, codelist, codedata, linkdata, typelink)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssi", $titlethai, $titleeng, $targetFile, $typedata, $codelist, $codedata, $linkdata, $typelink);
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



if (isset($_POST['edit'])) {
  $id = $_POST['id'];
  $titlethai = $_POST['titlethai'];
  $titleeng = $_POST['titleeng'];
  $typedata = $_POST['typedata'];
  $codelist = $_POST['codelist'];
  $codedata = $_POST['codedata'];
  $typelink = $_POST['typelink'];
  $linkdata = ($typelink == '1') ? $_POST['linkdata_select'] : $_POST['linkdata_text'];

  // ตรวจสอบการอัปโหลดไฟล์
  if ($_FILES["image_url"]["name"] != "") {
    $targetDir = "../img/";
    $imageName = time() . "_" . basename($_FILES["image_url"]["name"]);
    $targetFile = $targetDir . $imageName;
    move_uploaded_file($_FILES["image_url"]["tmp_name"], $targetFile);
    $updateImage = ", image_url = '$targetFile'";
  } else {
    $updateImage = "";
  }

  $conn->query("UPDATE testimonials SET 
    titlethai = '$titlethai',
    titleeng = '$titleeng',
    typedata = '$typedata',
    codelist = '$codelist',
    codedata = '$codedata',
    linkdata = '$linkdata',
    typelink = '$typelink'
    $updateImage
    WHERE id = '$id'");

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


if (isset($_GET['deletem'])) {
  $id = $_GET['deletem'];
  $conn->query("DELETE FROM testimonials WHERE id = '$id'");
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

<div class="container">
<div class="row ">
 <div class="col-md-6"> <h3 class="mb-0">จัดการประเภท </h3> </div>
 <div class="col-md-6" align="right"> <button class="btn btn-success" data-toggle="modal" data-target="#addModalm">+ เพิ่มภาพ</button> </div>
</div>
<!-- Modal: เพิ่มข้อมูล -->
<div class="modal fade" id="addModalm">
  <div class="modal-dialog modal-lg">
    <form method="POST" enctype="multipart/form-data">
      <div class="modal-content text-dark">
        <div class="modal-header"><h5 class="modal-title">เพิ่มภาพ</h5></div>
        <div class="modal-body">
          <div class="form-group">
            <label>ชื่อเรื่องภาษาไทย</label>
            <input type="text" name="titlethai" class="form-control" required>
               <input type="hidden" name="codedata" class="form-control" value="<?php echo $codedata;?>" required>
             <input type="hidden" name="codelist" class="form-control" value="<?php echo $HTTP_HOST;?>" required>
          </div>
          <div class="form-group">
            <label>ชื่อเรื่องภาษาอังกฤษ</label>
            <input type="text" name="titleeng" class="form-control">
          </div>
          <div class="form-group">
            <label>ภาพ</label>
            <input type="file" name="image_url" class="form-control-file" accept="image/*" required>
          </div>
          <div class="form-group"> 
            <label>ประเภท</label>
           
              <select name="typedata" class="form-control">
                    <option value="">เลือกรายการ</option>
              <?= $detailcontentOptions2 ?>
            </select>
          </div>
         
          <div class="form-group">
            <label>ประเภทลิงก์</label>
            <select name="typelink" class="form-control" onchange="toggleLinkData(this.value)">
              <option value="0">ลิงก์เอง (พิมพ์)</option>
              <option value="1">เลือกจากข้อมูล</option>
            </select>
          </div>
          <div class="form-group" id="linkdata_text">
            <label>ลิงก์ (พิมพ์)</label>
            <input type="text" name="linkdata_text" class="form-control">
          </div>
          <div class="form-group d-none" id="linkdata_select">
            <label>เลือกลิงก์</label>
            <select name="linkdata_select" class="form-control">
              <?= $detailcontentOptions ?>
            </select>
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

<script>
function toggleLinkData(val) {
  if (val == '0') {
    document.getElementById('linkdata_text').classList.remove('d-none');
    document.getElementById('linkdata_select').classList.add('d-none');
  } else {
    document.getElementById('linkdata_text').classList.add('d-none');
    document.getElementById('linkdata_select').classList.remove('d-none');
  }
}
</script>


       <div class="table-responsive">
      <table id="example" class="display text-dark" style="min-width: 845px">
  <thead>
    <tr>
      <th width="10%">ภาพ</th>
      <th>ชื่อเรื่องไทย</th>
      <th>ชื่อเรื่องอังกฤษ</th>
      <th>ลิงก์</th>
      <th>ประเภทลิงก์</th>
      <th>จัดการ</th>
    </tr>
  </thead>
  <tbody>
    <?php
    $result = $conn->query("SELECT * FROM testimonials WHERE codedata = '".$codedata."' and codelist = '".$HTTP_HOST."'");
    while ($row = $result->fetch_assoc()):
    ?>
      <tr>
        <td><img src="../img/<?= $row['image_url'] ?>" width="100%"></td>
        <td><?= htmlspecialchars($row['titlethai']) ?></td>
        <td><?= htmlspecialchars($row['titleeng']) ?></td>
        <td><?= htmlspecialchars($row['linkdata']) ?></td>
        <td><?= $row['typelink'] == 0 ? 'พิมพ์เอง' : 'เลือกจากรายการ' ?></td>
        <td>
          <button class="btn btn-warning btn-sm" data-toggle="modal" data-target="#editModaltwo<?= $row['id'] ?>">แก้ไข</button>
          <button class="btn btn-danger btn-sm" onclick="deleteData(<?= $row['id'] ?>)">ลบ</button>
        </td>
      </tr>

      <!-- Modal แก้ไข -->
      <div class="modal fade" id="editModaltwo<?= $row['id'] ?>">
        <div class="modal-dialog modal-lg">
          <form method="POST" enctype="multipart/form-data">
            <div class="modal-content text-dark">
              <div class="modal-header"><h5 class="modal-title">แก้ไข Testimonial</h5></div>
              <div class="modal-body">
                <input type="hidden" name="id" value="<?= $row['id'] ?>">
                <div class="form-group">
                  <label>ชื่อไทย</label>
                  <input type="text" name="titlethai" class="form-control" value="<?= $row['titlethai'] ?>">
                </div>
                <div class="form-group">
                  <label>ชื่ออังกฤษ</label>
                  <input type="text" name="titleeng" class="form-control" value="<?= $row['titleeng'] ?>">
                </div>
                <div class="form-group">
                  <label>ภาพปัจจุบัน</label><br>
                  <img src="<?= $row['image_url'] ?>" width="100">
                  <input type="file" name="image_url" class="form-control mt-2">
                </div>
                <div class="form-group">
                  <label>typedata</label>
                  <input type="text" name="typedata" class="form-control" value="<?= $row['typedata'] ?>">
                </div>
                <div class="form-group">
                  <label>codelist</label>
                  <input type="text" name="codelist" class="form-control" value="<?= $row['codelist'] ?>">
                </div>
                <div class="form-group">
                  <label>codedata</label>
                  <input type="text" name="codedata" class="form-control" value="<?= $row['codedata'] ?>">
                </div>
                <div class="form-group">
                  <label>ประเภทลิงก์</label>
                  <select name="typelink" class="form-control" onchange="toggleEditLink(this.value, <?= $row['id'] ?>)">
                    <option value="0" <?= $row['typelink'] == 0 ? 'selected' : '' ?>>พิมพ์</option>
                    <option value="1" <?= $row['typelink'] == 1 ? 'selected' : '' ?>>เลือกจากรายการ</option>
                  </select>
                </div>
                <div class="form-group" id="linktext<?= $row['id'] ?>" <?= $row['typelink'] == 1 ? 'style="display:none;"' : '' ?>>
                  <label>ลิงก์ (Text)</label>
                  <input type="text" name="linkdata_text" class="form-control" value="<?= $row['typelink']==0 ? $row['linkdata'] : '' ?>">
                </div>
                <div class="form-group" id="linkselect<?= $row['id'] ?>" <?= $row['typelink'] == 0 ? 'style="display:none;"' : '' ?>>
                  <label>ลิงก์ (เลือก)</label>
                  <select name="linkdata_select" class="form-control">
                    <?php
                    $resDetail = $conn->query("SELECT id, titlethai FROM detailcontent");
                    while ($opt = $resDetail->fetch_assoc()) {
                      $sel = ($opt['id'] == $row['linkdata']) ? 'selected' : '';
                      echo "<option value='{$opt['id']}' $sel>{$opt['titlethai']}</option>";
                    }
                    ?>
                  </select>
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

      <script>
      function toggleEditLink(val, id) {
        document.getElementById('linktext' + id).style.display = val == '0' ? 'block' : 'none';
        document.getElementById('linkselect' + id).style.display = val == '1' ? 'block' : 'none';
      }
      </script>
    <?php endwhile; ?>
  </tbody>
</table>
<br>
   </div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
function deleteData(id) {
  Swal.fire({
    title: 'ยืนยันการลบ?',
    text: "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location = '?page=editcontent&id=<?php echo $strid;?>&deletem=' + id;
    }
  });
}
</script>



</div>