<?php
// failed.php
$order_id = $_GET['order_id'] ?? '';
?>
<!doctype html><html><head><meta charset="utf-8"><title>Payment Failed</title>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
<body>
<script>
Swal.fire({
  icon: 'error',
  title: 'การชำระไม่สำเร็จ',
  text: 'Order: <?php echo htmlspecialchars($order_id); ?>'
}).then(()=>{ window.location = ''; });
</script>
</body></html>
