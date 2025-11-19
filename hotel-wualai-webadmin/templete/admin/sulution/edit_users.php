
<?php
// ฟังก์ชันแสดง SweetAlert
function flash($title, $text, $type) {
    $_SESSION['flash'] = json_encode(compact('title','text','type'));
}

// --- HANDLE ADD/EDIT/DELETE ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    if ($action === 'create' || $action === 'update') {
        $name = $conn->real_escape_string($_POST['name']);
        $email = $conn->real_escape_string($_POST['email']);
        $password = md5($_POST['password']);
        $role_id = intval($_POST['role_id']);
        $is_active = isset($_POST['is_active']) ? 1 : 0;

        if ($action === 'create') {
            $stmt = $conn->prepare("INSERT INTO admin_users (name,email,password,role_id,is_active) VALUES (?,?,?,?,?)");
            $stmt->bind_param("sssii", $name, $email, $password, $role_id, $is_active);
            if ($stmt->execute()) {
                flash('เพิ่มข้อมูลสำเร็จ','User ถูกเพิ่มแล้ว','success');
            } else {
                flash('ผิดพลาด','ไม่สามารถเพิ่มข้อมูลได้','error');
            }
        } else {
            $id = intval($_POST['id']);
            $stmt = $conn->prepare("UPDATE admin_users SET name=?,email=?,password=?,role_id=?,is_active=? WHERE id=?");
            $stmt->bind_param("sssiii",$name,$email,$password,$role_id,$is_active,$id);
            if ($stmt->execute()) {
                flash('แก้ไขสำเร็จ','อัปเดตข้อมูลเรียบร้อย','success');
            } else {
                flash('ผิดพลาด','ไม่สามารถแก้ไขข้อมูลได้','error');
            }
        }
    }

    if ($action === 'delete') {
        $id = intval($_POST['id']);
        $stmt = $conn->prepare("DELETE FROM admin_users WHERE id=?");
        $stmt->bind_param("i",$id);
        if ($stmt->execute()) {
            flash('ลบสำเร็จ','ลบข้อมูลแล้ว','success');
        } else {
            flash('ผิดพลาด','ไม่สามารถลบได้','error');
        }
    }

    echo '<meta http-equiv="refresh" content="3;url=?page=edit_users">';
 
}

// ดึงข้อมูลตอนแสดงหน้า
$users = $conn->query("SELECT u.*, r.name AS role_name FROM admin_users u LEFT JOIN admin_roles r ON u.role_id = r.id");
$roles = $conn->query("SELECT * FROM admin_roles");
?>
 
 <!--**********************************
            Content body start
        ***********************************-->

            <!-- row -->
            <div class="container-fluid">
                     <h3 class="mb-4"> <i class="fa fa-user"></i> ดูรายชื่อผู้ใช้งาน 
<br><font size="3"></font></h3>
                <div class="row">
<div class="col-md-12">

 <div class="card shadow">
        
        <div class="card-body text-dark">

<!-- แสดง Flash Message -->
<?php if(isset($_SESSION['flash'])): ?>
<script>
let flash = <?=$_SESSION['flash']?>;
Swal.fire({ icon: flash.type, title: flash.title, text: flash.text });
</script>
<?php unset($_SESSION['flash']); endif; ?>
    
      <div class="table-responsive"> 

      <table id="example" class="display text-dark" style="min-width: 845px">
    <thead>
      <tr><th>#</th><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>สถานะ</th><th>จัดการ</th></tr>
    </thead>
    <tbody>
      <?php while ($u = $users->fetch_assoc()): ?>
      <tr>
        <td><?= $u['id'] ?></td>
        <td><?= htmlspecialchars($u['name']) ?></td>
        <td><?= htmlspecialchars($u['email']) ?></td>
        <td><?= htmlspecialchars($u['role_name']) ?></td>
       <td>
    <?= $u['is_active'] 
        ? '<button class="btn btn-success btn-sm">✔️ ใช้งาน</button>' 
        : '<button class="btn btn-danger btn-sm">❌ ปิดการใช้งาน</button>' 
    ?>
</td>
        <td>
          <button class="btn btn-sm btn-warning" data-toggle="modal" data-target="#modalForm"
            onclick='openModal("update", <?= json_encode($u) ?>);'>แก้ไข</button>
          <button class="btn btn-sm btn-danger" onclick='confirmDelete(<?= $u["id"] ?>)'>ลบ</button>
        </td>
      </tr>
      <?php endwhile; ?>
    </tbody>
  </table>
</div>

<!-- Modal สำหรับ create/update -->
<div class="modal fade" id="modalForm" tabindex="-1">
  <div class="modal-dialog">
    <form method="POST" class="modal-content">
      <input type="hidden" name="action" id="frmAction" value="create">
      <input type="hidden" name="id" id="frmId">
      <div class="modal-header"><h5 class="modal-title">ฟอร์มข้อมูลผู้ใช้</h5><button type="button" class="close" data-dismiss="modal">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label>ชื่อ</label><input name="name" id="frmName" class="form-control" required></div>
        <div class="form-group"><label>อีเมล</label><input type="email" name="email" id="frmEmail" class="form-control" required></div>
        <div class="form-group"><label>รหัสผ่าน</label><input type="password" name="password" id="frmPassword" class="form-control" placeholder="เว้นว่างถ้าไม่ต้องการเปลี่ยน"></div>
        <div class="form-group">
          <label>บทบาท</label>
          <select name="role_id" id="frmRole" class="form-control" required>
            <?php while($r = $roles->fetch_assoc()): ?>
              <option value="<?= $r['id'] ?>"><?= htmlspecialchars($r['name']) ?> - <?= htmlspecialchars($r['description']) ?></option>
            <?php endwhile; ?>
          </select>
        </div>
        <div class="form-check"><input type="checkbox" class="form-check-input" name="is_active" id="frmActive"><label class="form-check-label">เปิดใช้งาน</label></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
        <button type="submit" class="btn btn-primary">บันทึก</button>
      </div>
    </form>
  </div>
</div>

<script>
function openModal(action, data = null) {
  $('#frmAction').val(action);
  if (action === 'update' && data) {
    $('#frmId').val(data.id);
    $('#frmName').val(data.name);
    $('#frmEmail').val(data.email);
    $('#frmPassword').attr('required', false).attr('placeholder', 'กรอกเท่านั้นหากต้องการเปลี่ยน');
    $('#frmRole').val(data.role_id);
    $('#frmActive').prop('checked', data.is_active == 1);
  } else {
    $('#frmId').val('');
    $('#frmName, #frmEmail, #frmPassword').val('').attr('required', true).attr('placeholder', '');
    $('#frmRole').val('');
    $('#frmActive').prop('checked', false);
  }
}

function confirmDelete(id) {
  Swal.fire({
    title: 'ต้องการลบหรือไม่?',
    text: "ลบแล้วไม่สามารถกู้คืนได้!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ลบเลย',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      $('<form method="POST"><input name="action" value="delete"><input name="id" value="'+id+'"></form>')
        .appendTo('body').submit();
    }
  });
}
</script>
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
