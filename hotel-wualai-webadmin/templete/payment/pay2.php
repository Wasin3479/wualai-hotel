<?php
require 'config.php';
$order_id = $_GET['order_id'] ?? '';
$customerId = $_GET['customerId'] ?? '';
$type = $_GET['type'] ?? '';
$res = $mysqli->query("SELECT * FROM transactions WHERE order_id='".$mysqli->real_escape_string($order_id)."'");
$txn = $res->fetch_assoc();
if(!$txn){ die("ไม่พบรายการ"); }
?>
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>ชำระเงิน</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<style>
.qr-container {
    max-width: 320px;
    margin: 30px auto;
    padding: 20px;
    text-align: center;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    background: #fff;
    transition: transform 0.3s ease;
}

.qr-container:hover {
    transform: scale(1.02);
}

.qr-container img {
    max-width: 100%;
    border-radius: 10px;
    border: 2px solid #eee;
}

.qr-text {
    margin-top: 15px;
    font-size: 18px;
    color: #333;
    font-weight: 500;
    font-family: "Segoe UI", "Prompt", sans-serif;
}
</style>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Kanit', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 500px;
      margin: 0 auto;
      padding: 40px 0;
    }
    
    .payment-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .payment-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }
    
    .card-header {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      padding: 30px;
      text-align: center;
      color: white;
    }
    
    .card-header h3 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .card-header p {
      opacity: 0.9;
      font-size: 16px;
      font-weight: 300;
    }
    
    .card-body {
      padding: 40px;
    }
    
    .form-group {
      margin-bottom: 25px;
      position: relative;
    }
    
    .form-label {
      display: block;
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 8px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .form-control {
      width: 100%;
      padding: 16px 20px;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 16px;
      font-family: 'Kanit', sans-serif;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }
    
    .form-select {
      width: 100%;
      padding: 16px 20px;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 16px;
      font-family: 'Kanit', sans-serif;
      background: #f8f9fa;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .form-select:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
    
    .payment-methods {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 10px;
    }
    
    .payment-btn {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 18px 20px;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
      width: 100%;
      font-family: 'Kanit', sans-serif;
    }
    
    .payment-btn:hover {
      border-color: #667eea;
      background: #f8f9ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
    }
    
    .payment-btn.active {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    
    .payment-btn.active .payment-icon {
      color: white !important;
    }
    
    .payment-icon {
      width: 50px;
      height: 50px;
      background: #f8f9fa;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #667eea;
      transition: all 0.3s ease;
    }
    
    .payment-btn.active .payment-icon {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .payment-info {
      flex: 1;
    }
    
    .payment-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .payment-desc {
      font-size: 13px;
      opacity: 0.7;
      font-weight: 400;
    }
    
    .payment-method-option {
      padding: 12px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .payment-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .card-fields {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 16px;
      padding: 25px;
      margin-top: 20px;
      border: 2px dashed #dee2e6;
      transition: all 0.3s ease;
    }
    
    .card-fields.active {
      border-color: #667eea;
      background: linear-gradient(135deg, #f0f4ff, #e6f0ff);
    }
    
    .card-preview {
      margin-top: 20px;
      text-align: center;
      animation: fadeInUp 0.5s ease;
    }
    
    .credit-card {
      width: 320px;
      height: 200px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 16px;
      padding: 25px;
      color: white;
      position: relative;
      margin: 0 auto;
      box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
      overflow: hidden;
    }
    
    .credit-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: shimmer 3s infinite;
    }
    
    .card-chip {
      width: 40px;
      height: 30px;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      border-radius: 6px;
      margin-bottom: 20px;
      position: relative;
    }
    
    .card-number {
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 2px;
      margin-bottom: 15px;
      font-family: 'Courier New', monospace;
    }
    
    .card-info {
      display: flex;
      justify-content: space-between;
      align-items: end;
    }
    
    .card-expiry {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .card-logo {
      font-size: 24px;
      font-weight: bold;
    }
    
    .submit-btn {
      width: 100%;
      padding: 18px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      font-family: 'Kanit', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
    }
    
    .submit-btn:active {
      transform: translateY(0);
    }
    
    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    .submit-btn:hover::before {
      left: 100%;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shimmer {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .input-icon {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      pointer-events: none;
    }
    
    .form-group.has-icon .form-control {
      padding-right: 50px;
    }
    
    @media (max-width: 576px) {
      .container {
        padding: 20px 0;
      }
      
      .card-body {
        padding: 30px 25px;
      }
      
      .card-header {
        padding: 25px;
      }
      
      .credit-card {
        width: 280px;
        height: 175px;
        padding: 20px;
      }
      
      .card-number {
        font-size: 16px;
      }
      
      .payment-methods {
        grid-template-columns: 1fr;
      }
      
      .payment-btn {
        padding: 15px;
        gap: 12px;
      }
      
      .payment-icon {
        width: 45px;
        height: 45px;
        font-size: 18px;
      }
      
      .payment-name {
        font-size: 15px;
      }
      
      .payment-desc {
        font-size: 12px;
      }
    }
  </style>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js"></script>
  <style>
    #qrcode { margin: 20px auto; }
  </style>
</head>
<body class="bg-light">
<div class="container">
<div class="row">


  <div class="card p-4 shadow-sm"> <center>
    <h4><?=htmlspecialchars($txn['order_id'])?></h4>
    <p>จำนวนเงิน: <?=number_format($txn['amount']/100,2)?> บาท</p>
    

    <?php if($txn['payment_method']==='prompt_pay' || $txn['payment_method']==='mobile_banking'): 


// เริ่ม cURL
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, "https://api.pgw.rabbit.co.th/public/v2/transactions");
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
// 🔐 ใส่ token ของคุณที่นี่
curl_setopt($curl, CURLOPT_HTTPHEADER, [
    "Accept: application/json",
    "Content-Type: application/json",
    "Authorization: $authToken"
]);
// ดึงข้อมูลจาก API
echo $responseja = curl_exec($curl);
// เช็คว่า cURL ทำงานสำเร็จหรือไม่
if (curl_errno($curl)) {
    echo 'cURL Error: ' . curl_error($curl);
    exit;
}
curl_close($curl);
// แปลง JSON response ให้เป็น array
 $data = json_decode($responseja, true);
foreach ($data['items'] as $item) {
    if (isset($item['localId']) && $item['localId'] === $order_id) {
        // แสดงเฉพาะข้อมูลรายการที่ตรงกับ localId
      //  echo "<pre>";
       // print_r($item); // หรือแสดงเฉพาะ field ที่คุณต้องการ เช่น echo $item['qr']['url'];
      //  echo "</pre>";
      $qr_qr = $item['qr']['url'];
        $provider = $item['provider'];
               $vendorUrl = $item['vendorUrl'];
        $found = true;
        break;
    }
}


    ?>


  <?php if($qr_qr): ?>
      
    <div class="">
    <img src="pp.jpg"  width="256"  border="0" alt=""><br>
    <img src="<?= $qr_qr ?>" alt="QR Code" width="256">
    <br>
    BUNTOOK APPLICATION
   <br>
   <a href="index.php?codelist=<?php echo $customerId?>&type=<?php echo $type?>" class="btn btn-danger">ย้อนกลับ</a>
</div>
      <?php elseif($txn['qr_data']): ?>
      <?php
// ข้อมูล PromptPay QR
$promptpay_qr = $txn['qr_data'];

// แปลงเป็น Base64
$base64_qr = base64_encode($promptpay_qr);

 $base64_qr;
?>


    <img src="pp.jpg"  width="256"  border="0" alt="">

<?php 
 $qr_dataf = $txn['qr_data'];

// หาตำแหน่ง ".00" ครั้งแรก
$pos = strpos($qr_dataf, '.00');

if ($pos !== false) {
    // ตัดข้อความตั้งแต่ต้นจนถึง ".00" รวม .00 ด้วย
    $qr_datav = substr($qr_dataf, 0, $pos + 3); // +3 เพราะ ".00" มี 3 ตัว
} else {
    // ถ้าไม่เจอ .00 ให้เอา $qr_data ทั้งหมด
    $qr_datav = $qr_dataf;
}


?><br>

  <div id="qrcode"></div>
BUNTOOK APPLICATION
<br> <a href="index.php?codelist=<?php echo $customerId?>&type=<?php echo $type?>" class="btn btn-danger">ย้อนกลับ</a>
  <script>
    // ข้อมูล QR ที่คุณมี
    var qrData = "<?php echo $qr_datav?>";

    // สร้าง QR ลงใน div#qrcode
    new QRCode(document.getElementById("qrcode"), {
      text: qrData,
      width: 256,  // ขนาด QR
      height: 256
    });
  </script>
  
      <?php endif; ?>
      <?php if($txn['created_at']): ?>
    
      <?php endif; ?>
    <?php else: ?>
      <?php if($txn['checkout_url']): ?>
       <a class="btn-checkout" href="<?=$txn['checkout_url']?>/providers/card" target="_blank">
  <span class="btn-icon">💳</span>
  ชำระเงินด้วยบัตร
</a>

<style>
.btn-checkout {
  display: inline-flex;
  align-items: center;
  gap: 10px;               
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%); /* ส้ม gradient */
  border: none;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.btn-checkout:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  background: linear-gradient(90deg, #feb47b 0%, #ff7e5f 100%); /* สลับ gradient ตอน hover */
}

.btn-icon {
  font-size: 20px;
}
</style>

      <?php else: ?>
        <p>ไม่พบลิงก์สำหรับบัตร</p>
      <?php endif; ?>
    <?php endif; ?>
  </div>
  


</center></div></div>
</div>

<script>
let orderId = "<?= $txn['order_id'] ?>";
let checkInterval = setInterval(() => {
    fetch("check_pay.php?order_id=" + orderId)
        .then(response => response.text())
        .then(result => {
            if (result.trim() === "CONFIRMED") {
                clearInterval(checkInterval); // หยุดตรวจสอบ

                // แสดง SweetAlert
                Swal.fire({
                    title: "ชำระเงินสำเร็จแล้ว",
                    text: "ระบบกำลังพาไปหน้าสำเร็จ...",
                    icon: "success",
                    confirmButtonText: "ตกลง",
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });

                // ไปหน้า success.php หลังรอ 3 วิ
                setTimeout(() => {
                    window.location.href = "success.php?order_id=" + orderId;
                }, 3000);
            }
        })
        .catch(error => {
            console.error("เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน:", error);
        });
}, 2000);
</script>

</body>
</html>
