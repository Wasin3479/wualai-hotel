     <!--**********************************
            Nav header start
        ***********************************-->
        <div class="nav-header">
            <a href="index.php" class="brand-logo">

               <img src="../img/<?php echo $logo;?>" alt=""   style="height:50px; width:;"> &nbsp;&nbsp;<font color="#fffff"> <?php echo $nameweb;?> </font>
         
              
            </a>

            <div class="nav-control">
                <div class="hamburger">
                    <span class="line"></span><span class="line"></span><span class="line"></span>
                </div>
            </div>
        </div>
        <!--**********************************
            Nav header end
        ***********************************-->

        <!--**********************************
            Header start
        ***********************************-->
        <div class="header">
            <div class="header-content">
                <nav class="navbar navbar-expand">
                    <div class="collapse navbar-collapse justify-content-between">
                        <div class="header-left">

                         
                        </div>

                        <ul class="navbar-nav header-right">
                           
                            <li class="nav-item dropdown header-profile">
                                <a class="nav-link" href="#" role="button" data-toggle="dropdown">
                                   <?php echo $_SESSION['Username'];?> <i class="mdi mdi-account"></i>
                                </a>

                                                                           
                                <div class="dropdown-menu dropdown-menu-right">



                                
                                    <a href="?page=profile" class="dropdown-item">
                                        <i class="icon-user"></i>
                                        <span class="ml-2">โปรไฟล์ </span>
                                    </a>
                                   
                                    <a href="?page=logout" class="dropdown-item">
                                        <i class="fa fa-power-off"></i>
                                        <span class="ml-2">ออกจากระบบ </span>
                                    </a>
                                </div>
                            </li>
                             
                        </ul>
                    </div>
                </nav>
            </div>
        </div>
        <!--**********************************
            Header end ti-comment-alt
        ***********************************-->

        <!--**********************************
            Sidebar start
        ***********************************-->
        <div class="quixnav">
            
            <div class="quixnav-scroll">
                
                <ul class="metismenu" id="menu">


                
                    <li class="nav-label first">เมนูหลัก</li>

       

      <?php


 $userId = $_SESSION['UserID']; // ดึงค่า user id จาก session

// ตรวจสอบว่ามี session หรือไม่
if (!isset($userId)) {
    echo "ไม่พบ session ผู้ใช้";
    exit;
}

// สร้างคำสั่ง SQL
$sql = "SELECT 
        arp.permission_id,
        ap.name AS permission_name,
        ap.description,
        ap.icon
    FROM 
        admin_role_permissions arp
    JOIN 
        admin_permissions ap 
    ON 
        arp.permission_id = ap.id
    WHERE 
        arp.role_id = ?";

// เตรียมคำสั่ง SQL แบบ prepared statement
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

// แสดงผลลัพธ์
if ($result->num_rows > 0) {
  
    while ($row = $result->fetch_assoc()) {

if ($row['permission_id'] == "3") {
  echo "
   <li><a class='has-arrow' href='javascript:void()' aria-expanded='false'> {$row['icon']} <span class='nav-text'>{$row['description']}</span></a>
                        <ul aria-expanded='false'>
                            <li><a href='?page=verify_documents&status=user'>ลูกค้า</a></li>
                            <li><a href='?page=verify_documents&status=worker'>เจ้าของรถ</a></li>
                             <li><a href='?page=verify_documents&status=driver'>คนขับ</a></li></ul>
                    </li>
  ";
} elseif ($row['permission_id'] == "6") {
 echo "
   <li><a class='has-arrow' href='javascript:void()' aria-expanded='false'> {$row['icon']} <span class='nav-text'>{$row['description']}</span></a>
                        <ul aria-expanded='false'>
                            <li><a href='?page=view_wallets&status=user'>ดูยอดเงินลูกค้า</a></li>
                            <li><a href='?page=view_wallets&status=worker'>ดูยอดเงินเจ้าของรถ</a></li>
                             <li><a href='?page=view_wallets&status=driver'>ดูยอดเงินคนขับ</a></li></ul>
                    </li>
  ";
} elseif ($row['permission_id'] == "7") {
 echo "
   <li><a class='has-arrow' href='javascript:void()' aria-expanded='false'> {$row['icon']} <span class='nav-text'>{$row['description']}</span></a>
                        <ul aria-expanded='false'>
                       
                            <li><a href='?page=approve_withdraw&status=worker'>รายการถอนเงินเจ้าของรถ</a></li>
							 <li><a href='?page=approve_withdraw&status=driver'>รายการถอนเงินคนขับ</a></li>
							  <li><a href='?page=approve_withdraw&status=user'>รายการถอนเงินผู้ใช้</a></li>
                            </ul>
                    </li>
  "; 
} elseif ($row['permission_id'] == "29") {
 echo "
   <li><a class='has-arrow' href='javascript:void()' aria-expanded='false'> {$row['icon']} <span class='nav-text'>{$row['description']}</span></a>
                        <ul aria-expanded='false'>
                         <li><a href='?page=view_bank&status=user'>ลูกค้า</a></li>
                            <li><a href='?page=view_bank&status=worker'>เจ้าของรถ</a></li>
                             <li><a href='?page=view_bank&status=driver'>คนขับ</a></li></ul>
                    </li>
  ";
} elseif ($row['permission_id'] == "32") {
 echo "
   <li><a class='has-arrow' href='javascript:void()' aria-expanded='false'> {$row['icon']} <span class='nav-text'>{$row['description']}</span></a>
                        <ul aria-expanded='false'>
                         <li><a href='?page=car_settings&status=typecar'>กลุ่มรถ / ประเภทรถ</a></li>
                            <li><a href='?page=car_settings&status=datacar'>ข้อมูลรถ</a></li>
                            </ul>
                    </li>
  ";
} elseif ($row['permission_id'] == "1") {
 echo "
   <li><a class='has-arrow' href='javascript:void()' aria-expanded='false'> {$row['icon']} <span class='nav-text'>{$row['description']}</span></a>
                        <ul aria-expanded='false'>
                         <li><a href='?page=view_users'>ผู้ใช้ ADMIN</a></li>
                                <li><a href='?page=view_user&status=user'>ลูกค้า</a></li>
                            <li><a href='?page=view_user&status=worker'>เจ้าของรถ</a></li>
                             <li><a href='?page=view_user&status=driver'>คนขับ</a></li></ul>
                    </li>
  ";
} else {
     echo "
        <li><a href='?page={$row['permission_name']}' aria-expanded='false'>
                     {$row['icon']}   <span class='nav-text'>{$row['description']}</span></a>
                    </li>
       ";
}

     
    }
    
} else {
    echo "ไม่มีสิทธิ์การใช้งานสำหรับผู้ใช้นี้";
}

$stmt->close();
?>


                
                         <li>
                        <a  href="?page=logout" aria-expanded="false">
                        <i class="fa fa-power-off"></i><span class="nav-text">ออกจากระบบ</span></a>
                        
                    </li>
                  
                </ul>
            </div>


        </div>
        <!--**********************************
            Sidebar end
        ***********************************-->