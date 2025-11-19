<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">

    <title></title>
  </head>
  <body>
   
<?php
$HTTP_HOST=$_GET["codelist"];
$idcontent=$_GET["idcontent"];
include("../../../include/conn.php");


// เพิ่มข้อมูล
if (isset($_POST['add'])) {
  $idcontent = $_POST['idcontent'];
  $UserID = $_POST['UserID'];
    $nameth = $_POST['nameth'];
  $nameeng = $_POST['nameeng'];
  $conn->query("INSERT INTO menuuser (idcontent, UserID, codelist, nameth, nameeng) VALUES ('$idcontent', '$UserID','$HTTP_HOST', '$nameth','$nameeng')");
  echo "<script>window.location='?codelist=$HTTP_HOST&idcontent=$idcontent';</script>";
}

// ลบข้อมูล
if (isset($_GET['delete'])) {
  $id = $_GET['delete'];
  $conn->query("DELETE FROM menuuser WHERE id = '$id'");
  echo "<script>window.location='?codelist=$HTTP_HOST&idcontent=$idcontent';</script>";
}

$sql = "SELECT * FROM contentweb WHERE id = '".$idcontent."' ";
$query = mysqli_query($conn,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $nameth=$result["nameth"]; $nameeng=$result["nameeng"];
}
?>

<!-- ฟอร์มเพิ่มข้อมูล -->
<form method="POST" class="mb-4" action="?codelist=<?php echo $HTTP_HOST;?>&idcontent=<?php echo $idcontent;?>">
  <div class="form-row">
    <div class="col">
      <input type="hidden" name="idcontent" class="form-control" value="<?php echo $idcontent;?>" required>
           <input type="text" name="nameth" class="form-control" value="<?php echo $nameth;?>" readonly>
              <input type="hidden" name="nameeng" class="form-control" value="<?php echo $nameeng;?>" required>
    </div>
    <div class="col">
      <select name="UserID" class="form-control" required>
        <option value="">-- เลือกผู้ใช้ --</option>
        <?php
        $users = $conn->query("SELECT UserID, Username FROM member WHERE codelist = '".$HTTP_HOST."'");
        while ($user = $users->fetch_assoc()) {
          echo "<option value='{$user['UserID']}'>{$user['Username']}</option>";
        }
        ?>
      </select>
    </div>
    <div class="col-auto">
      <button type="submit" name="add" class="btn btn-primary">เพิ่มข้อมูล</button>
    </div>
  </div>
</form>

<!-- ตารางแสดงข้อมูล -->
<table class="table table-bordered">
  <thead>
    <tr>
      <th>รหัสเนื้อหา</th>
      <th>ชื่อผู้ใช้</th>
      <th>จัดการ</th>
    </tr>
  </thead>
  <tbody>
    <?php
    $data = $conn->query("SELECT menuuser.id, menuuser.idcontent, member.Username
                          FROM menuuser 
                          LEFT JOIN member ON menuuser.UserID = member.UserID WHERE menuuser.codelist = '".$HTTP_HOST."' and menuuser.idcontent = '".$idcontent."' 
                          ORDER BY menuuser.id DESC");
    while ($row = $data->fetch_assoc()):
    ?>
      <tr>
        <td><?php 
        $sql = "SELECT * FROM contentweb WHERE id = '".$row['idcontent']."' ";
$query = mysqli_query($conn,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    echo $result["nameth"]; 
}
        
        ?></td>
        <td><?= htmlspecialchars($row['Username']) ?></td>
        <td>
          <a class="btn btn-danger btn-sm" href="?delete=<?= $row['id'] ?>&codelist=<?php echo $HTTP_HOST;?>&idcontent=<?php echo $idcontent;?>">ลบ</a>
        </td>
      </tr>
    <?php endwhile; ?>
  </tbody>
</table>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
  </body>
</html>