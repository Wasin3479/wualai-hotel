

<!-- SweetAlert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>


 <!--**********************************
            Content body start
        ***********************************-->

            <!-- row -->
            <div class="container-fluid">
               <h3 class="mb-4">   <i class="icon icon-user"></i> จัดการผู้ใช้    <button class="btn btn-success mb-3" data-toggle="modal" data-target="#addModal">+ เพิ่มสมาชิก</button>
  

                 </h3>
<!-- ตัวอย่างปุ่มสวิต -->

<div class="row">
<div class="col-md-12">

 <div class="card shadow">
        
        <div class="card-body text-dark">
        
<?php

// เพิ่มข้อมูล
if (isset($_POST['add'])) {
    $stmt = $conn->prepare("INSERT INTO member (Username, Password, Name, schoolname, codelist) VALUES (?, ?, ?, ?, ?)");
    $password = md5($_POST['Password']); // เข้ารหัส md5
    $stmt->bind_param("sssss", $_POST['Username'], $password, $_POST['Name'], $_POST['schoolname'], $HTTP_HOST);
    $stmt->execute();
   
      echo "<script>
    Swal.fire({
        icon: 'success',
        title: 'เพิ่มข้อมูลแล้ว',
        showConfirmButton: true,
        confirmButtonText: 'ตกลง',
        timer: 3000,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            window.location.href = '?page=member';
        }
    });
</script>";
}

// แก้ไขข้อมูล
if (isset($_POST['edit'])) {
    if (!empty($_POST['Password'])) {
        // มีการเปลี่ยนรหัสผ่าน
        $password = md5($_POST['Password']);
        $stmt = $conn->prepare("UPDATE member SET Username=?, Password=?, Name=?, schoolname=? WHERE UserID=?");
        $stmt->bind_param("ssssi", $_POST['Username'], $password, $_POST['Name'], $_POST['schoolname'], $_POST['id']);
    } else {
        // ไม่เปลี่ยนรหัสผ่าน
        $stmt = $conn->prepare("UPDATE member SET Username=?, Name=?, schoolname=? WHERE id=?");
        $stmt->bind_param("sssi", $_POST['Username'], $_POST['Name'], $_POST['schoolname'], $_POST['id']);
    }
    $stmt->execute();
    
     echo "<script>
    Swal.fire({
        icon: 'success',
        title: 'แก้ไขข้อมูลแล้ว',
        showConfirmButton: true,
        confirmButtonText: 'ตกลง',
        timer: 3000,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            window.location.href = '?page=member';
        }
    });
</script>";
}

// ลบข้อมูล
if (isset($_GET['delete'])) {
    $stmt = $conn->prepare("DELETE FROM member WHERE UserID=?");
    $stmt->bind_param("i", $_GET['delete']);
    $stmt->execute();
     echo "<script>
    Swal.fire({
        icon: 'success',
        title: 'ลบข้อมูลแล้ว',
        showConfirmButton: true,
        confirmButtonText: 'ตกลง',
        timer: 3000,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            window.location.href = '?page=member';
        }
    });
</script>";
 
}
?>
 <div class="table-responsive">
    
      <table id="example" class="display text-dark" style="min-width: 845px">
        <thead>
            <tr>
                <th>Username</th>
                <th>Name</th>
                <th>School Name</th>
                <th>การจัดการ</th>
            </tr>
        </thead>
        <tbody>
        <?php
        $res = $conn->query("SELECT * FROM member WHERE codelist = '".$HTTP_HOST."' and Status = 'USER' ORDER BY UserID DESC");
        while ($row = $res->fetch_assoc()) {
            echo "<tr>
                    <td>{$row['Username']}</td>
                    <td>{$row['Name']}</td>
                    <td>{$row['schoolname']}</td>
                    <td>
                        <button class='btn btn-warning btn-sm' data-toggle='modal' data-target='#editModal{$row['UserID']}'>แก้ไข</button>
                       
                        <a href=''
   class='btn btn-danger btn-sm btn-delete-user' 
   data-id='{$row['UserID']}'>
   ลบ
</a>

                    </td>
                  </tr>";

            // Modal แก้ไข
            echo "
           <div class='modal fade' id='editModal{$row['UserID']}' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
  <div class='modal-dialog' role='document'>
    <div class='modal-content'>
      <div class='modal-header'>
        <h5 class='modal-title' id='exampleModalLabel'>แก้ไขสมาชิก</h5>
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'>
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
      <div class='modal-body'>
      <form method='POST' >
  <input type='hidden' name='id' value='{$row['UserID']}'>
                            <div class='form-group'>
                                <label>Username</label>
                                <input name='Username' class='form-control' value='{$row['Username']}' required>
                            </div>
                            <div class='form-group'>
                                <label>Password (เว้นว่างหากไม่เปลี่ยน)</label>
                                <input type='password' name='Password' class='form-control'>
                            </div>
                            <div class='form-group'>
                                <label>Name</label>
                                <input name='Name' class='form-control' value='{$row['Name']}' required>
                                  <input type='hidden' name='schoolname' class='form-control' value='{$row['schoolname']}' required>
                            </div>
                           


      </div>
      <div class='modal-footer'>
        <button class='btn btn-secondary' data-dismiss='modal'>ยกเลิก</button>
                            <button name='edit' class='btn btn-primary'>บันทึก</button> </form>
      </div>
    </div>
  </div>
</div>";
        }
        ?>
        </tbody>
    </table>
</div>
</div>
<!-- Modal เพิ่ม -->
<div class="modal fade" id="addModal">
    <div class="modal-dialog">
        <form method="POST" class="modal-content">
            <div class="modal-header"><h5 class="modal-title">เพิ่มสมาชิก</h5></div>
            <div class="modal-body text-dark">
                <div class="form-group">
                    <label>ชื่อผู้ใช้</label>
                    <input name="Username" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>รหัสผ่าน</label>
                    <input type="password" name="Password" class="form-control" required>
                    <input type="hidden" name="schoolname" class="form-control" value="<?php echo $nameweb;?>" required>
                </div>
                
             
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                <button name="add" class="btn btn-success">เพิ่ม</button>
            </div>
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
<script>
document.addEventListener('DOMContentLoaded', function () {
  const deleteButtons = document.querySelectorAll('.btn-delete-user');

  deleteButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const userId = this.getAttribute('data-id');

      Swal.fire({
        title: 'ยืนยันการลบ?',
        text: 'คุณต้องการลบผู้ใช้นี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          // เปลี่ยนเส้นทางไปลบ
          window.location.href = '?page=member&delete=' + userId;
        }
      });
    });
  });
});
</script>
