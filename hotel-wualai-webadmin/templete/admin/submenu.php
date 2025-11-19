<?php
$HTTP_HOST=$_GET["codelist"];
 $idmenu=$_GET["idmenu"];
include("../include/conn.php"); 
$detailcontent = $conn->query("SELECT * FROM detailcontent WHERE codelist = '".$HTTP_HOST."' ");
$submenus = $conn->query("SELECT * FROM subenuwebsite WHERE codelist = '".$HTTP_HOST."' and idmenu = '".$idmenu."'");

// จัดการ Form
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $action = $_POST['action'];
  $nameth = $_POST['namemunuthai'];
  $nameen = $_POST['namemunueng'];
  $linkater = $_POST['linkater'];
    $idmenu = $_POST['idmenu'];
        $idmenu = $_GET['idmenu'];
  $linkdata = ($linkater == 0) ? $_POST['linkdata_text'] : $_POST['linkdata_select'];

  if ($action == 'add') {
    $stmt = $conn->prepare("INSERT INTO subenuwebsite (namemunuthai, namemunueng, linkater, linkdata, codelist, idmenu) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssisss", $nameth, $nameen, $linkater, $linkdata, $HTTP_HOST, $idmenu);
    $stmt->execute();
  } elseif ($action == 'edit') {
    $id = $_POST['id'];
    $stmt = $conn->prepare("UPDATE subenuwebsite SET namemunuthai=?, namemunueng=?, linkater=?, linkdata=? WHERE id=?");
    $stmt->bind_param("ssisi", $nameth, $nameen, $linkater, $linkdata, $id);
    $stmt->execute();
  }
  echo "<script>window.location.href='submenu.php?codelist=$HTTP_HOST&idmenu=$idmenu';</script>";
  exit;
}

// ลบข้อมูล
if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
  $id = $_GET['id'];
    $idmenu = $_GET['idmenu'];
  $conn->query("DELETE FROM subenuwebsite WHERE id = $id");
  echo "<script>window.location.href='submenu.php?codelist=$HTTP_HOST&idmenu=$idmenu';</script>";
  exit;
}
?>

<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>จัดการ Submenu</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@10"></script>
</head>
<body class="">

<div class="">

  <button class="btn btn-primary " data-toggle="modal" data-target="#addModal">+ เพิ่ม Submenu</button>

  <table class="table table-bordered">
    <thead>
      <tr>
        <th>ชื่อเมนู (TH)</th>
        <th>ชื่อเมนู (EN)</th>
        <th>ประเภทลิงค์</th>
        <th>ลิงค์</th>
        <th>การจัดการ</th>
      </tr>
    </thead>
    <tbody>
      <?php while($row = $submenus->fetch_assoc()): ?>
      <tr>
        <td><?= $row['namemunuthai'] ?></td>
        <td><?= $row['namemunueng'] ?></td>
        <td><?= $row['linkater'] == 0 ? 'ลิงก์ภายใน' : 'ลิงก์จาก select' ?></td>
        <td><?= $row['linkdata'] ?></td>
        <td>
          <button class="btn btn-warning btn-sm editBtn"
            data-id="<?= $row['id'] ?>"
            data-nameth="<?= $row['namemunuthai'] ?>"
            data-nameen="<?= $row['namemunueng'] ?>"
            data-linkater="<?= $row['linkater'] ?>"
            data-linkdata="<?= $row['linkdata'] ?>">แก้ไข</button>
          <button class="btn btn-danger btn-sm deleteBtn" data-id="<?= $row['id'] ?>">ลบ</button>
        </td>
      </tr>
      <?php endwhile; ?>
    </tbody>
  </table>
</div>

<!-- MODAL เพิ่ม -->
<div class="modal fade" id="addModal" tabindex="-1"> 
  <div class="modal-dialog">
    <form action="submenu.php?codelist=<?php echo $HTTP_HOST;?>&idmenu=<?php echo $idmenu;?>" method="post" class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">เพิ่ม Submenu</h5>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body">
        <input name="action" value="add" type="hidden">
        <div class="form-group">
          <label>ชื่อเมนู (TH)</label>
          <input type="text" name="namemunuthai" class="form-control" required>
               <input type="hidden" name="idmenu" class="form-control" value="<?php echo $idmenu;?>" required>
        </div>
        <div class="form-group">
          <label>ชื่อเมนู (EN)</label>
          <input type="text" name="namemunueng" class="form-control" required>
        </div>
        <div class="form-group">
          <label>ประเภทลิงก์</label>
          <select name="linkater" class="form-control" id="add_linkater">
            <option value="0">ลิงก์ Text</option>
            <option value="1">เลือกลิงก์จากข้อมูล</option>
          </select>
        </div>
        <div class="form-group" id="add_linkdata_text">
          <label>ลิงก์</label>
          <input type="text" name="linkdata_text" class="form-control">
        </div>
        <div class="form-group d-none" id="add_linkdata_select">
          <label>เลือกลิงก์</label>
          <select name="linkdata_select" class="form-control">
            <?php $detailcontent->data_seek(0); while($row = $detailcontent->fetch_assoc()): ?>
              <option value="<?= $row['id'] ?>"><?= $row['titlethai'] ?></option>
            <?php endwhile; ?>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-success">บันทึก</button>
      </div>
    </form>
  </div>
</div>

<!-- MODAL แก้ไข -->
<div class="modal fade" id="editModal" tabindex="-1">
  <div class="modal-dialog">
    <form action="submenu.php?codelist=<?php echo $HTTP_HOST;?>&idmenu=<?php echo $idmenu;?>" method="post" class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">แก้ไข Submenu</h5>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body">
        <input name="action" value="edit" type="hidden">
        <input name="id" id="edit_id" type="hidden">
        <div class="form-group">
          <label>ชื่อเมนู (TH)</label>
          <input type="text" name="namemunuthai" id="edit_nameth" class="form-control" required>
        </div>
        <div class="form-group">
          <label>ชื่อเมนู (EN)</label>
          <input type="text" name="namemunueng" id="edit_nameen" class="form-control" required>
        </div>
        <div class="form-group">
          <label>ประเภทลิงก์</label>
          <select name="linkater" class="form-control" id="edit_linkater">
            <option value="0">ลิงก์ Text</option>
            <option value="1">เลือกลิงก์จากข้อมูล</option>
          </select>
        </div>
        <div class="form-group" id="edit_linkdata_text">
          <label>ลิงก์</label>
          <input type="text" name="linkdata_text" id="edit_linkdata_txt" class="form-control">
        </div>
        <div class="form-group d-none" id="edit_linkdata_select">
          <label>เลือกลิงก์</label>
          <select name="linkdata_select" id="edit_linkdata_sel" class="form-control">
            <?php $detailcontent->data_seek(0); while($row = $detailcontent->fetch_assoc()): ?>
              <option value="<?= $row['id'] ?>"><?= $row['titlethai'] ?></option>
            <?php endwhile; ?>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-warning">บันทึกการแก้ไข</button>
      </div>
    </form>
  </div>
</div>

<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
<script>
$('#add_linkater').on('change', function () {
  if ($(this).val() == '0') {
    $('#add_linkdata_text').removeClass('d-none');
    $('#add_linkdata_select').addClass('d-none');
  } else {
    $('#add_linkdata_select').removeClass('d-none');
    $('#add_linkdata_text').addClass('d-none');
  }
});

$('#edit_linkater').on('change', function () {
  if ($(this).val() == '0') {
    $('#edit_linkdata_text').removeClass('d-none');
    $('#edit_linkdata_select').addClass('d-none');
  } else {
    $('#edit_linkdata_select').removeClass('d-none');
    $('#edit_linkdata_text').addClass('d-none');
  }
});

$('.editBtn').click(function () {
  $('#edit_id').val($(this).data('id'));
  $('#edit_nameth').val($(this).data('nameth'));
  $('#edit_nameen').val($(this).data('nameen'));
  $('#edit_linkater').val($(this).data('linkater')).trigger('change');

  if ($(this).data('linkater') == 0) {
    $('#edit_linkdata_txt').val($(this).data('linkdata'));
  } else {
    $('#edit_linkdata_sel').val($(this).data('linkdata'));
  }

  $('#editModal').modal('show');
});

$('.deleteBtn').click(function () {
  let id = $(this).data('id');
  Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: 'ข้อมูลจะถูกลบถาวร!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ลบเลย!',
  }).then(result => {
    if (result.isConfirmed) {
      window.location = 'submenu.php?codelist=<?php echo $HTTP_HOST;?>&idmenu=<?php echo $idmenu;?>&action=delete&id=' + id;
    }
  });
});
</script>
</body>
</html>
