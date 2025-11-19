<?php session_start();
$HTTP_HOST="localhost";
include("../include/conn.php");
date_default_timezone_set("Asia/Bangkok"); 
	if($_SESSION['UserID'] == "")
	{
		     echo "<script>
    Swal.fire({
        icon: 'success',
        title: 'โปรดเข้าสู่ระบบ',
        showConfirmButton: true,
        confirmButtonText: 'ตกลง',
        timer: 3000,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            window.location.href = '../';
        }
    });
</script>";

	}

	if($_SESSION['Status'] != "1")
	{
		     echo "<script>
    Swal.fire({
        icon: 'success',
        title: 'หน้าสำหรับผู้ดูแลระบบเท่านั้น',
        showConfirmButton: true,
        confirmButtonText: 'ตกลง',
        timer: 3000,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            window.location.href = '../';
        }
    });
</script>";

	}	
	


	$strSQL = "SELECT * FROM admin_users WHERE id = '".$_SESSION['UserID']."' ";
	$objQuery = mysqli_query($objCon,$strSQL);
	$objResult = mysqli_fetch_array($objQuery,MYSQLI_ASSOC);


$strpage = null;

   if(isset($_GET["page"]))
   {
	   $strpage = $_GET["page"];
   }

      $sqlnp = "SELECT * FROM admin_permissions WHERE name = '".$strpage."'";
$querynp = mysqli_query($conn,$sqlnp);

while($resultnp=mysqli_fetch_array($querynp,MYSQLI_ASSOC))
{
    $descriptionc=$resultnp["description"];
}
?>
   <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
		<title><?php echo $description;?> : ผู้ดูแลระบบ<?php echo $nameweb;?></title>
  <meta name="description" content="<?php echo $description;?>">
  <meta name="keywords" content="<?php echo $keywords;?>">

    <!-- Favicon icon -->
       <link href="../img/<?php echo $logo;?>" rel="icon">
  <link href="../img/<?php echo $logo;?>" rel="apple-touch-icon">
    <link rel="icon" type="image/png" sizes="16x16" href="../img/<?php echo $logo;?>">
    <link rel="stylesheet" href="./vendor/owl-carousel/css/owl.carousel.min.css">
    <link rel="stylesheet" href="./vendor/owl-carousel/css/owl.theme.default.min.css">
    <link href="./vendor/jqvmap/css/jqvmap.min.css" rel="stylesheet">
        <link href="./vendor/summernote/summernote.css" rel="stylesheet">
          <!-- Datatable -->
    <link href="./vendor/datatables/css/jquery.dataTables.min.css" rel="stylesheet">
    <link href="./css/style2.css" rel="stylesheet">
    <link rel="stylesheet" href="./vendor/select2/css/select2.min.css">
 <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

</head>

<body>

    <!--*******************
        Preloader start
    ********************-->
    <div id="preloader">
        <div class="sk-three-bounce">
            <div class="sk-child sk-bounce1"></div>
            <div class="sk-child sk-bounce2"></div>
            <div class="sk-child sk-bounce3"></div>
        </div>
    </div>
    <!--*******************
        Preloader end
    ********************-->


    <!--**********************************
        Main wrapper start
    ***********************************-->
    <div id="main-wrapper">

      

   <?php
 include("sulution/navarbar.php");

 $sqlvbv = "SELECT * FROM admin_permissions WHERE name = '".$strpage."'";
$queryvbv = mysqli_query($conn,$sqlvbv);

while($resultvbv=mysqli_fetch_array($queryvbv,MYSQLI_ASSOC))
{
    $description=$resultvbv["description"];
}

 $sqlvbv = "INSERT INTO admin_activity_logs (admin_user_id, action, ip_address, user_agent) 
		VALUES ('".$_SESSION['UserID']."','".$description."','".$_SERVER['REMOTE_ADDR']."','')";

	$queryvbv = mysqli_query($conn,$sqlvbv);

echo "<div class='content-body'>";

if ($strpage == "view_dashboard") {


  include("sulution/home.php");

}

elseif ($strpage == "view_users") {
  include("sulution/view_users.php");

}
elseif ($strpage == "edit_users") {
   
  include("sulution/edit_users.php");

}
elseif ($strpage == "verify_documents") {
     
  include("sulution/verify_documents.php");

}
elseif ($strpage == "view_logs") {
  include("sulution/view_logs.php");

} elseif ($strpage == "view_jobs") {
  include("sulution/view_jobs.php");

} elseif ($strpage == "create_admin") {
  include("sulution/create_admin.php");

} elseif ($strpage == "edit_jobs") {
  include("sulution/edit_jobs.php");

} elseif ($strpage == "view_wallets") {
  include("sulution/view_wallets.php");

} elseif ($strpage == "approve_withdraw") {
  include("sulution/approve_withdraw.php");

} elseif ($strpage == "view_bank") {
  include("sulution/view_bank.php");

} elseif ($strpage == "view_banners") {
  include("sulution/view_banners.php");

} elseif ($strpage == "member") {
  include("sulution/member.php");

} elseif ($strpage == "profile") {
  include("sulution/profile.php");

} elseif ($strpage == "access_chat") {
  include("sulution/access_chat.php");

} elseif ($strpage == "system_settings") {
  include("sulution/system_settings.php");

} elseif ($strpage == "car_settings") {
  include("sulution/car_settings.php");

}

elseif ($strpage == "logout") {
  include("sulution/logout.php");

}
                     


elseif  ($strpage == "") {
  echo "<META HTTP-EQUIV='Refresh' CONTENT='0;URL=super_admin.php?page=view_dashboard'>";
}




else {
	 echo "<META HTTP-EQUIV='Refresh' CONTENT='0;URL=super_admin.php?page=view_dashboard'>";

}
?>

              </div>

        <!--**********************************
            Footer start
        ***********************************-->
        <div class="footer">
            <div class="copyright">
              <font color="black">  <p>Copyright ©  <?php
echo date("Y");
?></p>
                <p>Distributed by <a href="https://<?php echo $web;?>" target="_blank"><?php echo $web;?></a></p>  </font>
            </div>
        </div>
        <!--**********************************
            Footer end
        ***********************************-->

        <!--**********************************
           Support ticket button start
        ***********************************-->

        <!--**********************************
           Support ticket button end
        ***********************************-->


    </div>
    <!--**********************************
        Main wrapper end
    ***********************************-->

    <!--**********************************
        Scripts
    ***********************************-->
    <!-- Required vendors -->

    



    <script src="./vendor/global/global.min.js"></script>
    <script src="./js/quixnav-init.js"></script>
    <script src="./js/custom.min.js"></script>
    <!-- Summernote -->
    <script src="./vendor/summernote/js/summernote.min.js"></script>
    <!-- Summernote init -->
    <script src="./js/plugins-init/summernote-init.js"></script>

    <!-- Vectormap -->
    <script src="./vendor/raphael/raphael.min.js"></script>
    <script src="./vendor/morris/morris.min.js"></script>


    <script src="./vendor/circle-progress/circle-progress.min.js"></script>
    <script src="./vendor/chart.js/Chart.bundle.min.js"></script>

    <script src="./vendor/gaugeJS/dist/gauge.min.js"></script>

    <!--  flot-chart js -->
    <script src="./vendor/flot/jquery.flot.js"></script>
    <script src="./vendor/flot/jquery.flot.resize.js"></script>

    <!-- Owl Carousel -->
    <script src="./vendor/owl-carousel/js/owl.carousel.min.js"></script>

    <!-- Counter Up -->
    <script src="./vendor/jqvmap/js/jquery.vmap.min.js"></script>
    <script src="./vendor/jqvmap/js/jquery.vmap.usa.js"></script>
    <script src="./vendor/jquery.counterup/jquery.counterup.min.js"></script>
    <!-- Datatable -->
    <script src="./vendor/datatables/js/jquery.dataTables.min.js"></script>
    <script src="./js/plugins-init/datatables.init.js"></script>

    <script src="./js/dashboard/dashboard-1.js"></script>
        <script src="./vendor/select2/js/select2.full.min.js"></script>
    <script src="./js/plugins-init/select2-init.js"></script>

</body>

</html>

