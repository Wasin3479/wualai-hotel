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

	if($_SESSION['Status'] != "ADMIN")
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
	


	$strSQL = "SELECT * FROM member WHERE UserID = '".$_SESSION['UserID']."' ";
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
		<title><?php echo $descriptionc;?> : ผู้ดูแลระบบ<?php echo $nameweb;?></title>
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
<?php
ini_set('display_errors', 0);
	if($_SESSION['UserID'] == "")
	{
		  echo '
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        Swal.fire({
            icon: "warning",
            title: "โปรดเข้าสู่ระบบ",
            text: "หน้านี้สำหรับผู้ดูแลระบบโรงเรียนเท่านั้น",
            confirmButtonText: "เข้าสู่ระบบ",
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "login/"; // เปลี่ยน URL ตามที่คุณใช้
            }
        });
    </script>';
	exit();
	}

	if($_SESSION['Status'] != "USER")
	{
		  echo '
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        Swal.fire({
            icon: "warning",
            title: "โปรดเข้าสู่ระบบ",
            text: "หน้านี้สำหรับผู้ดูแลระบบโรงเรียนเท่านั้น",
            confirmButtonText: "เข้าสู่ระบบ",
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "login/"; // เปลี่ยน URL ตามที่คุณใช้
            }
        });
    </script>';
		exit();
	}	
	

	$strSQL = "SELECT * FROM member WHERE UserID = '".$_SESSION['UserID']."' and codelist = '".$HTTP_HOST."'";
	$objQuery = mysqli_query($objCon,$strSQL);
	$objResult = mysqli_fetch_array($objQuery,MYSQLI_ASSOC);
?>
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
      $sql = "SELECT * FROM dateststore WHERE codelist = '".$objResult["codelist"]."' and status = '1'";
     $query = mysqli_query($conn,$sql);
     
     while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
     {
         $dateend=$result["dateend"];  $idpacket=$result["idpacket"];  
     }

     $sql = "SELECT * FROM datapacket WHERE id = '".$idpacket."'  order by id DESC LIMIT 1";
     $query = mysqli_query($conn,$sql);
     
     while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
     {
        $namep=$result["name"]; 
     }
$buttonage=""; $buttonagepa="";
$today = date("Y-m-d");

// คำนวณจำนวนวันระหว่างวันนี้กับวันหมดอายุ
$diff = (strtotime($dateend) - strtotime($today)) / (60 * 60 * 24);
$diff = floor($diff); // ปัดเศษให้เหลือจำนวนวันเต็ม

if ($diff <= 0) {
    // หมดอายุหรือน้อยกว่า 1 วัน
   $buttonage = '
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            Swal.fire({
                icon: "error",
                title: "หมดอายุการใช้งาน",
                text: "กรุณาต่ออายุการใช้งาน",
                confirmButtonText: "ตกลง",
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(() => {
                window.location.href = "?page=addpagket";
            });
        });
    </script>
    ';
} elseif ($diff < 7) {
    // เหลือน้อยกว่า 7 วัน แสดงปุ่ม
    $buttonage = '
            <div class="container-fluid">
                <div class="row">
     <div class="col-lg-12 col-sm-12">
   <div class="alert alert-danger solid alert-right-icon alert-dismissible fade show">
                                    <span><i class="mdi mdi-block-helper"></i></span>
                                    <button type="button" class="close h-100" data-dismiss="alert" aria-label="Close"><span><i class="mdi mdi-close"></i></span>
                                    </button>
                              <font size="4">      <strong>แจ้งเตือน </strong>  เหลือเวลาใช้งานอีกเพียง ' . $diff . ' วัน </font>
                                      <a href="?page=addpagket" class="btn btn-sm btn-light ms-2">ต่ออายุ</a>
                                </div>
  
 </div>
  </div>
   </div>
 
    ';
}


?>

   <?php
 include("sulution/navarbar.php");

echo "<div class='content-body'>";

if ($strpage == "home") {

    echo $buttonage;
  include("sulution/home.php");

}

elseif ($strpage == "addpagket") {
  include("sulution/addpagket.php");

}
elseif ($strpage == "Dashboard") {
       echo $buttonage;
  include("sulution/Dashboard.php");

}
elseif ($strpage == "datawebschool") {
       echo $buttonage;
  include("sulution/datawebschool.php");

}
elseif ($strpage == "settingwebsite") {
  include("sulution/settingwebsite.php");

} elseif ($strpage == "carouselspicture") {
  include("sulution/carouselspicture.php");

} elseif ($strpage == "textmarquee") {
  include("sulution/textmarquee.php");

} elseif ($strpage == "about_info") {
  include("sulution/about_info.php");

} elseif ($strpage == "webcontent") {
  include("sulution/webcontent.php");

} elseif ($strpage == "editcontent") {
  include("sulution/editcontent.php");

} elseif ($strpage == "memuwebsite") {
  include("sulution/memuwebsite.php");

} elseif ($strpage == "contentdetails") {
  include("sulution/contentdetails.php");

} elseif ($strpage == "member") {
  include("sulution/member.php");

} elseif ($strpage == "profile") {
  include("sulution/profile.php");

} elseif ($strpage == "itadata") {
  include("sulution/itadata.php");

} elseif ($strpage == "iconwebsite") {
  include("sulution/iconwebsite.php");

}

elseif ($strpage == "logout") {
  include("sulution/logout.php");

}
                     


elseif  ($strpage == "") {
  echo "<META HTTP-EQUIV='Refresh' CONTENT='0;URL=?page=home'>";
}




else {
	 echo "<META HTTP-EQUIV='Refresh' CONTENT='0;URL=?page=home'>";

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
                <p>Distributed by <a href="<?php echo $webmain;?>" target="_blank"><?php echo $namewebmain;?></a></p>  </font>
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