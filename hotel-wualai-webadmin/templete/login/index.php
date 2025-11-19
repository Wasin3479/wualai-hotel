<?php session_start();
include("../include/conn.php");
date_default_timezone_set("Asia/Bangkok"); 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $conn->real_escape_string($_POST['username']);
    $password = md5($_POST['password']); // เข้ารหัส MD5

    $sql = "SELECT * FROM admin_users WHERE email = '$username' AND password = '$password' and is_active = '1' ";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $_SESSION["UserID"] = $row["id"];
        $_SESSION["Username"] = $row["email"];
        $_SESSION["Status"] = $row["role_id"];
        

        if ($row["role_id"] == "1") {
            $redirectUrl = "../super_admin.php";
            $message = "ยืนดีต้อนรับ super_admin";
            $type = "success";
            $title = "เข้าสู่ระบบสำเร็จ!";
        } elseif ($row["role_id"] == "2") {
            $redirectUrl = "../admin.php";
            $message = "ยืนดีต้อนรับ admin";
            $type = "success";
             $title = "เข้าสู่ระบบสำเร็จ!";
        } else {
            $redirectUrl = "index.php";
            $message = "สถานะผู้ใช้ไม่ถูกต้อง";
            $type = "error";
             $title = "เข้าสู่ระบบไม่สำเร็จ!";
        }
    } else {
        $redirectUrl = "index.php";
        $message = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        $type = "error";
    }
}
?><!DOCTYPE html>
<html lang="en" class="h-100">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
		<title>สำหรับผู้ดูแลระบบ : <?php echo $nameweb;?></title>
  <meta name="description" content="<?php echo $description;?>">
  <meta name="keywords" content="<?php echo $keywords;?>">

    <!-- Favicon icon -->
       <link href="../../img/<?php echo $logo;?>" rel="icon">
  <link href="../../img/<?php echo $logo;?>" rel="apple-touch-icon">
    <link rel="icon" type="image/png" sizes="16x16" href="../../img/<?php echo $logo;?>">
    <link href="../css/style2.css" rel="stylesheet">
 <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>

<body class="h-100">
    <div class="authincation h-100">
        <div class="container-fluid h-100">
            <div class="row justify-content-center h-100 align-items-center">
                <div class="col-md-4">
                    <div class="authincation-content">
                        <div class="row no-gutters">
                            <div class="col-xl-12">
                                <div class="auth-form">
                                     
                                    <h4 class="text-center mb-4"><img src="../../img/<?php echo $logo;?>" alt=""   style="height:90px; width:;"> <p> สำหรับผู้ดูแลระบบ <br><?php echo $nameweb;?></p></h4>
                                  <form name="form1" method="POST" action="">
                                        <div class="form-group">
                                           <font color="black"> <label><strong>อีเมล</strong></label></font>
                                            <input type="email" class="form-control" name="username" placeholder="กรอกอีเมล">
                                        </div>
                                        <div class="form-group">
                                            <font color="black"> <label><strong>รหัสผ่าน</strong></label></font>
                                            <input type="password" class="form-control" name="password" placeholder="กรอกรหัสผ่าน">
                                        </div>
                                        <div class="form-row d-flex justify-content-between mt-4 mb-2">
                                            <div class="form-group">
                                                <div class="form-check ml-2">
                                                    <input class="form-check-input" type="checkbox" id="basic_checkbox_1">
                                               <font color="black">      <label class="form-check-label" for="basic_checkbox_1">จดจำรหัสผ่าน</label> </font>
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <a href="forgot-password.php">ลืมรหัสผ่าน ?</a>
                                            </div>
                                        </div>
                                        <div class="text-center">
                                            <button type="submit" class="btn btn-primary btn-block">เข้าสู่ระบบ</button>
                                        </div>
                                    </form>
                                    <div class="new-account mt-3">
                                       
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
<script>
    Swal.fire({
        icon: '<?= $type ?>',
        title: '<?= $title ?>',
        text: '<?= $message ?>',
        confirmButtonText: 'ตกลง',
        allowOutsideClick: false,
        timer: 3000, // ตั้งเวลา 3 วินาที
        timerProgressBar: true
    }).then(() => {
        // หลังจากครบเวลา 3 วินาที หรือผู้ใช้กด "ตกลง"
        window.location.href = "<?= $redirectUrl ?>";
    });
</script>

    <!--**********************************
        Scripts
    ***********************************-->
    <!-- Required vendors -->
    <script src="../vendor/global/global.min.js"></script>
    <script src="../js/quixnav-init.js"></script>
    <script src="../js/custom.min.js"></script>

</body>

</html>