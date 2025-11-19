<?php
// config.php
// เปลี่ยนค่านี้ให้เป็นของคุณจริง ๆ
$db_host = '68.183.225.72:3307';
$db_user = 'buntook_admin';
$db_pass = 'P@ssw0rdBuntookAdmin';
$db_name = 'buntook_db';

// Connect mysqli
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_errno) {
    http_response_code(500);
    die("DB connect error: " . $mysqli->connect_error);
}
$mysqli->set_charset('utf8mb4');

$sql = "SELECT * FROM system_config WHERE config_key = 'rabbit_token'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $authToken=$result["config_value"];
}



// Rabbit config
// ใส่ API key (secret) ที่ Rabbit ให้มา
define('RABBIT_API_KEY', $authToken);
// ตัวอย่าง endpoint (ปรับตาม environment ของ Rabbit)
define('RABBIT_API_BASE', 'https://api.pgw.rabbit.co.th/public/v2/transactions'); // ปรับถ้าจริงต่างกัน


?>
<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'rabbit_api_url'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $rabbit_api_url=$result["config_value"];
}
?>

<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'rabbit_token'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $rabbit_token=$result["config_value"];
}
?>

<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'site_name'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $site_name=$result["config_value"];
}
?>

<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'currency'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $currency=$result["config_value"];
}
?>

<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'minimumtopup'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $minimumtopup=$result["config_value"];
}
?>

<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'minimumamount'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $minimumamount=$result["config_value"];
}
?>

<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'billingformat'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $billingformat=$result["config_value"];
}
?>

<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'fullfee'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $fullfee=$result["config_value"];
}
?>

<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'percenfee'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $percenfee=$result["config_value"];
}
?>

<?php 
$sql = "SELECT * FROM system_config WHERE config_key = 'percenfee_card'";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $percenfee_card=$result["config_value"];
}
?>