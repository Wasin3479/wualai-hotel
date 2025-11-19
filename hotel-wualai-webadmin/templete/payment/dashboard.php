<?php

require 'config.php';

// สถิติรวมตามสถานะ
$stats = [];
$res = $mysqli->query("SELECT status, COUNT(*) as cnt, SUM(amount)/10 as total FROM transactions GROUP BY status");
while($r=$res->fetch_assoc()){
    $stats[$r['status']] = $r;
}

// สถิติรวมตาม payment_method
$methods = [];
$res2 = $mysqli->query("SELECT payment_method, COUNT(*) as cnt, SUM(amount)/10 as total FROM transactions GROUP BY payment_method");
while($r=$res2->fetch_assoc()){
    $methods[$r['payment_method']] = $r;
}

$total_res = $mysqli->query("SELECT COUNT(*) as cnt, SUM(amount)/10 as total FROM transactions")->fetch_assoc();
?>
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>Dashboard</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-light">
<div class="container py-4">
  

  <div class="row">
    <div class="col-md-3">
      <div class="card text-center shadow-sm mb-3">
        <div class="card-body">
          <h5>รวมทั้งหมด</h5>
          <p><?=number_format($total_res['cnt'])?> รายการ</p>
          <p><?=number_format($total_res['total']/100,2)?> บาท</p>
        </div>
      </div>
    </div>
    <?php
    $filter_status = $_GET['status'] ?? '';
$q = "SELECT * FROM transactions";
if($filter_status){
  $q .= " WHERE status='".$mysqli->real_escape_string($filter_status)."'";
}
$q .= " ORDER BY created_at DESC";
$res = $mysqli->query($q);

     foreach($stats as $status=>$st): ?>
      <div class="col-md-3">
        <div class="card text-center shadow-sm mb-3">
          <div class="card-body">
            <h5><?=ucfirst($status)?></h5>
            <p><?=number_format($st['cnt'])?> รายการ</p>
            <p><?=number_format($st['total']/100,2)?> บาท</p>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <div class="row mt-4">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">📌 สัดส่วนธุรกรรมตามสถานะ</h5>
          <canvas id="statusChart"></canvas>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">💳 ยอดรวมตามวิธีการชำระ</h5>
          <canvas id="methodChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-4">
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
  </div>
</div>

<script>
// Data สำหรับ Pie chart (สถานะ)
const statusLabels = <?=json_encode(array_keys($stats),JSON_UNESCAPED_UNICODE)?>;
const statusCounts = <?=json_encode(array_column($stats,'cnt'),JSON_UNESCAPED_UNICODE)?>;

// Data สำหรับ Bar chart (วิธีชำระ)
const methodLabels = <?=json_encode(array_keys($methods),JSON_UNESCAPED_UNICODE)?>;
const methodTotals = <?=json_encode(array_map(fn($m)=>$m['total']/100,$methods),JSON_UNESCAPED_UNICODE)?>;

new Chart(document.getElementById('statusChart'),{
  type:'pie',
  data:{
    labels:statusLabels,
    datasets:[{
      data:statusCounts,
      backgroundColor:['#007bff','#28a745','#ffc107','#dc3545','#6c757d']
    }]
  }
});

new Chart(document.getElementById('methodChart'),{
  type:'bar',
  data:{
    labels:methodLabels,
    datasets:[{
      label:'ยอดรวม (บาท)',
      data:methodTotals,
      backgroundColor:'#0d6efd'
    }]
  },
  options:{
    scales:{
      y:{beginAtZero:true}
    }
  }
});
</script>
</body>
</html>
