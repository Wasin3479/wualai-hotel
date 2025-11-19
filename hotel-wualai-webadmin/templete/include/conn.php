<?php
	ini_set('display_errors', 1);
	error_reporting(~0);

	$serverName = "68.183.225.72:3307";
	$userName = "buntook_admin";
	$userPassword = "P@ssw0rdBuntookAdmin";
	$dbName = "buntook_db";


	$conn = mysqli_connect($serverName,$userName,$userPassword,$dbName);
$con = mysqli_connect($serverName,$userName,$userPassword,$dbName);
	$objCon = mysqli_connect($serverName,$userName,$userPassword,$dbName);
	mysqli_set_charset($conn, "utf8");
mysqli_set_charset($con, "utf8");
	mysqli_set_charset($objCon, "utf8");


?>
<?php
	ini_set('display_errors', 1);
	error_reporting(~0);

	$sql = "SELECT * FROM contentsystem  WHERE id = '1'";

	$query = mysqli_query($conn,$sql);

?><?php
while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
?><?php $web=$result["web"];?>
<?php $nameweb=$result["nameweb"];?>
<?php $logo=$result["img"];?>
<?php $img2=$result["img2"];?>
<?php $img3=$result["img3"];?>
<?php $description=$result["description"];?>
<?php $keywords=$result["keywords"];?>
<?php
}
?>