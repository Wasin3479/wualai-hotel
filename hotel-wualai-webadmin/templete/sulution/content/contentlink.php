<?php


// ดึงข้อมูลทั้งหมด
$result = $conn->query("SELECT * FROM linkdatawb WHERE codelist = '".$HTTP_HOST."'  and codedata_tm = '".$codedata."' ");
$detailcontent = $conn->query("SELECT * FROM detailcontent WHERE codelist = '".$HTTP_HOST."' ");
$detailOptions = "";
while ($row = $detailcontent->fetch_assoc()) {
    $detailOptions .= "<option value='{$row['id']}'>{$row['titlethai']}</option>";
}






if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['adddata'] === 'addtat') {


$styeimg = $_POST['styeimg'];
$statuslink = $_POST['statuslink'];

$content = '';
if ($styeimg == '0') {
    $content = $_POST['content_text'];
} else {
    $file = $_FILES['content_file'];
    $filename = uniqid() . "_" . $file['name'];
    move_uploaded_file($file['tmp_name'], "../img/" . $filename);
    $content = $filename;
}

$linkdata = ($statuslink == '0') ? $_POST['linkdata_text'] : $_POST['linkdata_select'];

$conn->query("INSERT INTO linkdatawb (styeimg, content, statuslink, linkdata, codelist, codedata_tm)
              VALUES ('$styeimg', '$content', '$statuslink', '$linkdata','$HTTP_HOST','$codedata')");

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


if ($_GET['iddel'] != '') {
    $iddel = $_GET['iddel'];
$conn->query("DELETE FROM linkdatawb WHERE id = '$iddel'");
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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['idedit'] !== '') {
    $idedit = $_POST['idedit'];
$styeimg = $_POST['styeimg'];
$statuslink = $_POST['statuslink'];
$no = $_POST['no'];

$content = '';
if ($styeimg == '0') {
    $content = $_POST['content_text'];
} else {
    if (!empty($_FILES['content_file']['name'])) {
        $file = $_FILES['content_file'];
        $filename = uniqid() . "_" . $file['name'];
        move_uploaded_file($file['tmp_name'], "../img/" . $filename);
        $content = $filename;
    } else {
        // ดึงของเก่าถ้าไม่ได้อัปโหลดใหม่
        $res = $conn->query("SELECT content FROM linkdatawb WHERE id = '$idedit'");
        $content = $res->fetch_assoc()['content'];
    }
}

$linkdata = ($statuslink == '0') ? $_POST['linkdata_text'] : $_POST['linkdata_select'];

$conn->query("UPDATE linkdatawb SET 
  styeimg = '$styeimg', 
  content = '$content', 
  statuslink = '$statuslink', 
  no = '$no',
  linkdata = '$linkdata' 
  WHERE id = '$idedit'");

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



   <div align="right"><button class="btn btn-primary my-3" data-toggle="modal" data-target="#addModal">+ เพิ่มข้อมูล</button>
            <a href="?page=webcontent" class="btn btn-warning">ย้อนกลับ</a> </div>
      <table id="example" class="display" style="min-width: 845px">
        
      <thead>
        <tr class="text-dark">
             <th>ลำดับ</th>
          <th>ชื่อเมนู</th>
          <th>ลิงค์</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      
      <tbody>
        
        <?php while($row = $result->fetch_assoc()): ?>
        <tr class="text-dark">
          <td>
            <?= htmlspecialchars($row['no']) ?>
            </td>
          <td>
            <?php if ($row['styeimg'] == 0): ?>
              <?= htmlspecialchars($row['content']) ?>
            <?php else: ?>
              <img src="../img/<?= $row['content'] ?>" width="100">
            <?php endif; ?>
          </td>
          <td>
            <?php if ($row['statuslink'] == 0): ?>
              <?= htmlspecialchars($row['linkdata']) ?>
            <?php else: ?>
              <?php
              $sel = $conn->query("SELECT titlethai FROM detailcontent WHERE id = '{$row['linkdata']}'")->fetch_assoc();
              echo $sel ? $sel['titlethai'] : 'ลิงค์ภายใน';
              ?>
            <?php endif; ?>
          </td>
          <td>
        <button class="btn btn-warning btn-sm editBtn" 
  data-id="<?= $row['id'] ?>"
  data-styeimg="<?= $row['styeimg'] ?>"
  data-content="<?= $row['content'] ?>"
  data-statuslink="<?= $row['statuslink'] ?>"
  data-linkdata="<?= $row['linkdata'] ?>"
    data-no="<?= $row['no'] ?>"
  >แก้ไข</button>
            <button class="btn btn-danger btn-sm deleteBtn" data-id="<?= $row['id'] ?>">ลบ</button>
          </td>
        </tr>
        <?php endwhile; ?>
      </tbody>
    </table>
  </div>

<!-- Modal เพิ่ม -->
<div class="modal fade" id="addModal" tabindex="-1">
  <div class="modal-dialog">
    <form id="addForm" method="POST" enctype="multipart/form-data" action="?page=editcontent&id=<?php echo $strid;?>">
      <div class="modal-content">
        <div class="modal-header"><h5>เพิ่มข้อมูล</h5></div>
        <div class="modal-body text-dark">
                <input type="hidden" name="adddata" value="addtat">
          <div class="form-group">
            <label>ประเภท</label>
            <select name="styeimg" class="form-control" id="add_styeimg">
              <option value="0">ข้อความ</option>
              <option value="1">ภาพ</option>
            </select>
          </div>
          <div class="form-group" id="add_content_text">
            <label>ชื่อเมนู</label>
            <input type="text" name="content_text" class="form-control">
          </div>
          <div class="form-group d-none" id="add_content_file">
            <label> (ไฟล์)</label>
            <input type="file" name="content_file" class="form-control-file">
          </div>
          <div class="form-group">
            <label>สถานะลิงค์</label>
            <select name="statuslink" class="form-control" id="add_statuslink">
              <option value="0">ลิงค์ภายนอก</option>
              <option value="1">ลิงค์ภายใน</option>
            </select>
          </div>
          <div class="form-group" id="add_linkdata_text">
            <label>URL ลิงค์</label>
            <input type="text" name="linkdata_text" class="form-control">
          </div>
          <div class="form-group d-none" id="add_linkdata_select">
            <label>เลือกลิงค์ภายใน</label>
            <select name="linkdata_select" id="single-select" class="form-control">
              <?= $detailOptions ?>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-success">บันทึก</button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="editModal" tabindex="-1">
  <div class="modal-dialog">
    <form id="editForm" method="POST" enctype="multipart/form-data" action="?page=editcontent&id=<?php echo $strid;?>">
      <input type="hidden" name="idedit" id="edit_id">
      <div class="modal-content">
        <div class="modal-header"><h5>แก้ไขข้อมูล</h5></div>
        <div class="modal-body text-dark">
           <div class="form-group" id="edit_content_text">
            <label>ลำดับ</label>
            <input type="number" name="no" id="edit_no" class="form-control">
          </div>
          <div class="form-group">
            <label>ประเภท</label>
            <select name="styeimg" class="form-control" id="edit_styeimg">
              <option value="0">ข้อความ</option>
              <option value="1">ภาพ</option>
            </select>
          </div>
          <div class="form-group" id="edit_content_text">
            <label>ชื่อเมนู</label>
            <input type="text" name="content_text" id="edit_content_text_val" class="form-control">
          </div>
          <div class="form-group d-none" id="edit_content_file">
            <label>(ไฟล์ใหม่)</label>
            <input type="file" name="content_file" class="form-control-file">
            <div id="current_image"></div>
          </div>
          <div class="form-group">
            <label>สถานะลิงค์</label>
            <select name="statuslink" class="form-control" id="edit_statuslink">
              <option value="0">ข้อความ</option>
              <option value="1">แบบเลือกt</option>
            </select>
          </div>
          <div class="form-group" id="edit_linkdata_text">
            <label>Link Data</label>
            <input type="text" name="linkdata_text" id="edit_linkdata_text_val" class="form-control">
          </div>
          <div class="form-group d-none" id="edit_linkdata_select">
            <label>Link Data (Select)</label>
            <select name="linkdata_select"  class="form-control" id="edit_linkdata_select_val">
              <?= $detailOptions ?>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-success">อัปเดต</button>
        </div>
      </div>
    </form>
  </div>
</div>


<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script>
$('#add_styeimg').on('change', function() {
  if (this.value == '0') {
    $('#add_content_text').show();
    $('#add_content_file').hide().addClass('d-none');
  } else {
    $('#add_content_text').hide();
    $('#add_content_file').show().removeClass('d-none');
  }
});

$('#add_statuslink').on('change', function() {
  if (this.value == '0') {
    $('#add_linkdata_text').show();
    $('#add_linkdata_select').hide().addClass('d-none');
  } else {
    $('#add_linkdata_text').hide();
    $('#add_linkdata_select').show().removeClass('d-none');
  }
});

$('.editBtn').click(function () {
  const id = $(this).data('id');
  const styeimg = $(this).data('styeimg');
  const content = $(this).data('content');
  const statuslink = $(this).data('statuslink');
  const linkdata = $(this).data('linkdata');
    const no = $(this).data('no');

  $('#edit_id').val(id);
  $('#edit_styeimg').val(styeimg);
  $('#edit_statuslink').val(statuslink);
    $('#edit_no').val(no);

  // ปรับเนื้อหา content
  if (styeimg == 0) {
    $('#edit_content_text').show();
    $('#edit_content_file').hide().addClass('d-none');
    $('#edit_content_text_val').val(content);
  } else {
    $('#edit_content_text').hide();
    $('#edit_content_file').show().removeClass('d-none');
    $('#current_image').html(`<p>ภาพเดิม: <br><img src="../img/${content}" width="200"></p>`);
  }

  // ปรับเนื้อหา linkdata
  if (statuslink == 0) {
    $('#edit_linkdata_text').show();
    $('#edit_linkdata_select').hide().addClass('d-none');
    $('#edit_linkdata_text_val').val(linkdata);
  } else {
    $('#edit_linkdata_text').hide();
    $('#edit_linkdata_select').show().removeClass('d-none');
    $('#edit_linkdata_select_val').val(linkdata);
  }

  $('#editModal').modal('show');
});

// toggle สำหรับแก้ไข manual
$('#edit_styeimg').on('change', function () {
  if (this.value == '0') {
    $('#edit_content_text').show();
    $('#edit_content_file').hide().addClass('d-none');
  } else {
    $('#edit_content_text').hide();
    $('#edit_content_file').show().removeClass('d-none');
  }
});

$('#edit_statuslink').on('change', function () {
  if (this.value == '0') {
    $('#edit_linkdata_text').show();
    $('#edit_linkdata_select').hide().addClass('d-none');
  } else {
    $('#edit_linkdata_text').hide();
    $('#edit_linkdata_select').show().removeClass('d-none');
  }
});
// ลบข้อมูล
$('.deleteBtn').click(function() {
  let id = $(this).data('id');
  Swal.fire({
    title: 'ลบข้อมูล?',
    text: "คุณแน่ใจหรือไม่?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ลบเลย'
    
  }).then((result) => {
    if (result.isConfirmed) {
      window.location = "?page=editcontent&id=<?php echo $strid;?>&iddel=" + id;
    }
  });
});
</script>

 <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
