<?php session_start();
$HTTP_HOST="localhost";
include("include/conn.php");
 echo " <meta http-equiv='refresh' content='0;url=login/'>";
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

</head>

<body>

</body>

</html>