<?php
require 'config.php';
$filter_status = $_GET['status'] ?? '';
$q = "SELECT * FROM transactions";
if($filter_status){
  $q .= " WHERE status='".$mysqli->real_escape_string($filter_status)."'";
}
$q .= " ORDER BY created_at DESC";
$res = $mysqli->query($q);
?>
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>Admin - รายงานธุรกรรม</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4 bg-light">
<div class="container">
  <h3>รายงานธุรกรรม</h3>
  <form method="get" class="mb-3">
    <select name="status" class="form-select w-auto d-inline">
      <option value="">--สถานะทั้งหมด--</option>
      <option value="pending">pending</option>
      <option value="created">created</option>
      <option value="paid">paid</option>
      <option value="failed">failed</option>
      <option value="error">error</option>
    </select>
    <button class="btn btn-secondary btn-sm">Filter</button>
  </form>
  <table class="table table-striped">
    <thead><tr><th>ID</th><th>Order</th><th>Amount</th><th>Method</th><th>Status</th><th>Created</th><th>Expire</th><th>Link/QR</th></tr></thead>
    <tbody>
    <?php while($row=$res->fetch_assoc()): ?>
      <tr>
        <td><?=$row['id']?></td>
        <td><?=$row['order_id']?></td>
        <td><?=number_format($row['amount']/100,2)?></td>
        <td><?=$row['payment_method']?></td>
        <td><?=$row['status']?></td>
        <td><?=$row['created_at']?></td>
        <td><?=$row['expires_at']?></td>
        <td>
          <?php if($row['checkout_url']): ?>
            <a href="<?=$row['checkout_url']?>" target="_blank">Checkout</a>
          <?php elseif($row['qr_data']): ?>
            QR data
          <?php endif; ?>
        </td>
      </tr>
    <?php endwhile; ?>
    </tbody>
  </table>
</div>
</body>
</html>
