
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
                     <h3 class="mb-4"> <i class="fa fa-user-plus"></i> เพิ่มผู้ดูแลระบบ  
<br><font size="3"></font></h3>
                <div class="row">
<div class="col-md-12">

 <div class="card shadow">
        
        <div class="card-body text-dark">

<form method="POST" action="?page=edit_users" class="modal-content">
      <input type="hidden" name="action" id="frmAction" value="create">
   
      
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
