
<!doctype html>
<html><head><meta charset="utf-8"><title>Payment Success</title>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
<body>
  <?php
// success.php
require 'config.php';
$order_id = $_GET['order_id'] ?? '';

$sql = "SELECT * FROM transactions WHERE order_id = '".$order_id."' ";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    $totalmaney=($result["amount"]/100)-$result["difference"];  $useradd=$result["useradd"]; $typeuser=$result["typeuser"]; $upmoony=$result["upmoony"];
}

if ($upmoony == "0") {

$usert = $typeuser . "_id";
$sqlv = "SELECT * FROM wallets_$typeuser WHERE $usert = '".$useradd."' ";
$queryv = mysqli_query($mysqli,$sqlv);

while($resultv=mysqli_fetch_array($queryv,MYSQLI_ASSOC))
{
 
    $balance=$resultv["balance"];     $idcv=$resultv["id"];
}


$totaltem=$totalmaney+$balance;




$sqle = "UPDATE wallets_$typeuser SET 
			balance = '".$totaltem."'
			WHERE $usert = '".$useradd."' ";

	$querye = mysqli_query($mysqli,$sqle);

  $sqlem = "UPDATE transactions SET 
			upmoony = '1'
			WHERE order_id = '".$order_id."' ";

	$queryem = mysqli_query($mysqli,$sqlem);
$desc="เติมเงินเข้าระบบ $order_id";
 $sqlvv = "INSERT INTO transactions_$typeuser (wallet_id, amount, transaction_type, description, beforeAmount, afterAmount, status) 
		VALUES ('".$idcv."','".$totalmaney."','DEPOSIT','".$desc."','".$balance."','".$totaltem."','SUCCESS')";

	$queryvv = mysqli_query($mysqli,$sqlvv);



} else {


}

?>
<script>
Swal.fire({
  icon: 'success',
  title: 'ชำระสำเร็จ',
  text: 'Order: <?php echo htmlspecialchars($order_id); ?>'
}).then(()=>{ window.location = 'https://panel.buntook.com/payment/index.php?codelist=<?php echo $useradd;?>&type=<?php echo $typeuser;?>&amount=<?php echo $totalmaney;?>'; });
</script>
</body></html>
