

 <!--**********************************
            Content body start
        ***********************************-->


<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

            <!-- row -->
            <div class="container-fluid">
                     <h3 class="mb-4"> <i class="fa fa-check-square-o"></i>	
อนุมัติการถอนเงิน <?php


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


   <div style='width: 100%; overflow-x: auto;'>
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css">
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>


<?php



if ($strstatus == "user") {
  include("transactions_user.php");
} elseif ($strstatus == "worker") {
    include("transactions_worker.php");
} elseif ($strstatus == "driver") {
    include("transactions_driver.php");
}
?>

</div>
</div>
<!-- GOOGLE MAP API -->
<script src="https://maps.googleapis.com/maps/api/js?key="></script>
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
