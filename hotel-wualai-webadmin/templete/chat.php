<?php session_start();
$HTTP_HOST="localhost";
include("include/conn.php");
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
?><?php
// สมมุติว่ามี $row['id'] จากข้อมูลงาน
$job_id = $_GET['job_id']; // หรือ $row['id'] ก็ได้
$sender_id = $objResult["id"];          

$sqlbv = "SELECT * FROM admin_roles WHERE id = '".$objResult["role_id"]."' ";
$querybv = mysqli_query($conn,$sqlbv);

while($resultbv=mysqli_fetch_array($querybv,MYSQLI_ASSOC))
{
    $sender_role = $resultbv["name"];
}

// สมมติเป็น admin

?>
<!DOCTYPE html>
<html>
<head>
    <title>แชทเรียลไทม์</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>

<div class="">
    <h4>ห้องแชท JOB ID: <?= $job_id ?></h4>

    <div id="chat-box" class="border rounded p-3 mb-3" style="height: 300px; overflow-y: scroll;">
        <!-- แสดงข้อความแชท -->
    </div>

    <form id="chat-form">
        <input type="hidden" name="job_id" value="<?= $job_id ?>">
        <input type="hidden" name="sender_id" value="<?php echo $objResult["id"];?>"> <!-- จำลอง user id -->
        <input type="hidden" name="sender_role" value="<?php echo $sender_role;?>"> <!-- จำลอง role -->
        <div class="form-group">
            <textarea name="message" class="form-control" placeholder="พิมพ์ข้อความ..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">ส่งข้อความ</button>
    </form>
</div>


</body>
</html>

<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script>
function loadMessages() {
    $.get('load_chat.php?job_id=<?= $job_id ?>', function(data) {
        $('#chat-box').html(data);
        $('#chat-box').scrollTop($('#chat-box')[0].scrollHeight);
    });
}

$('#chat-form').on('submit', function(e) {
    e.preventDefault();
    $.post('send_chat.php', $(this).serialize(), function() {
        $('textarea[name="message"]').val('');
        loadMessages();
    });
});

setInterval(loadMessages, 3000);
loadMessages(); // โหลดครั้งแรก
</script>