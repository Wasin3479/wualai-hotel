

 <?php
$users = $conn->query("SELECT u.*, r.name AS role_name FROM admin_users u LEFT JOIN admin_roles r ON u.role_id = r.id");
$roles = $conn->query("SELECT * FROM admin_roles");
?>
 <!--**********************************
            Content body start
        ***********************************-->

            <!-- row -->
            <div class="container-fluid">
                     <h3 class="mb-4"> <i class="fa fa-user"></i> ดูรายชื่อผู้ใช้งาน <br><font size="3"></font></h3>
                <div class="row">
<div class="col-md-12">

 <div class="card shadow">
        
        <div class="card-body text-dark">


    
       <div class="table-responsive"> 

      <table id="example" class="display text-dark" style="min-width: 845px">
    <thead>
      <tr><th>#</th><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>สถานะ</th></tr>
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
       
      </tr>
      <?php endwhile; ?>
    </tbody>
  </table>
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
