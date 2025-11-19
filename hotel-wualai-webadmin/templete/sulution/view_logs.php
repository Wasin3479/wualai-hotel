

 
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

      <?php


// เขียน SQL
$sql = "
    SELECT 
        logs.admin_user_id,
        users.name,
        logs.action,
        logs.ip_address,
        logs.user_agent
    FROM 
        admin_activity_logs AS logs
    JOIN 
        admin_users AS users 
        ON logs.admin_user_id = users.id
    ORDER BY logs.id DESC
";

// รันคำสั่ง SQL
$result = $conn->query($sql);
$l=0;
// ตรวจสอบผลลัพธ์
if ($result->num_rows > 0)  {
    echo "<table id='example' class='display text-dark' style='min-width: 845px'>
            <thead><tr>
                <th style='white-space: nowrap; text-align: center;'>#</th>
                <th style='white-space: nowrap; text-align: center;'>Name</th>
                <th style='white-space: nowrap; text-align: center;'>Action</th>
                <th style='white-space: nowrap; text-align: center;'>IP Address</th>
                <th style='white-space: nowrap; text-align: center;'>User Agent</th>
            </thead></tr></thead><tbody>";
    while($row = $result->fetch_assoc()) {  $l++;
        echo "<tr>
                <td>{$l}</td>
                <td>{$row['name']}</td>
                <td>{$row['action']}</td>
                <td>{$row['ip_address']}</td>
                <td>{$row['user_agent']}</td>
              </tr>";
    }
    echo "</tbody></table>";
} else {
    echo "ไม่พบข้อมูล";
}

// ปิดการเชื่อมต่อ

?>

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
