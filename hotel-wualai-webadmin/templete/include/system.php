<?php
	ini_set('display_errors', 1);
	error_reporting(~0);

	$sql = "SELECT * FROM contentsystem  WHERE id = '1'";

	$query = mysqli_query($conn,$sql);

?><?php
while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
?><?php $nameweb=$result["nameweb"];?>
<?php $description=$result["description"];?>
<?php $keywords=$result["keywords"];?>
<?php $logo=$result["logo"];?><?php $logo2=$result["logo2"];?>
<?php $statusstore=$result["statusstore"];?>
<?php $contentclose=$result["contentclose"];?>
<?php $web=$result["web"];?><?php $tell=$result["tell"];?><?php $contentabout=$result["contentabout"];?>
<?php $email=$result["email"];?>
<?php $namebai=$result["namebai"];?>
<?php $addressbai=$result["addressbai"];?>
<?php $idcadbai=$result["idcadbai"];?>
<?php $conentbai=$result["conentbai"];?>
<?php $conentbaihh=$result["conentbaihh"];?>
<?php $imgqrcode=$result["imgqrcode"];?>
<?php $namebank=$result["namebank"];?>
<?php $nobank=$result["nobank"];?>
<?php $nameaccbank=$result["nameaccbank"];?>
<?php $contentbaiclosd=$result["contentbaiclosd"];?>
<?php $contentbaiopen=$result["contentbaiopen"];?>
<?php
}
?>