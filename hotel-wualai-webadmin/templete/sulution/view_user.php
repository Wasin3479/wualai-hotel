

 
 <!--**********************************
            Content body start
        ***********************************-->

            <!-- row -->
            <div class="container-fluid">
                     <h3 class="mb-4"> <i class="fa fa-file-word-o"></i> ดูข้อมูล <?php


   $strstatus = null;

   if(isset($_GET["status"]))
   {
	   $strstatus = $_GET["status"];
   }

if ($strstatus == "user") {
  echo " : ลูกค้า";
} elseif ($strstatus == "worker") {
    echo " : เจ้าของรถ";
} elseif ($strstatus == "driver") {
   echo " : คนขับ";
}
?><br><font size="3"></font></h3>
                <div class="row">
<div class="col-md-12">

 <div class="card shadow">
        
        <div class="card-body text-dark">

<?php



if ($strstatus == "user") {
  include("user.php");
} elseif ($strstatus == "worker") {
    include("worker.php");
} elseif ($strstatus == "driver") {
    include("driver.php");
}
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
