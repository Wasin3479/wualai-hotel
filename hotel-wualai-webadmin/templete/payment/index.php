<?php
require 'config.php';
   $strCustomerID = null;

   if(isset($_GET["codelist"]))
   {
	   $strCustomerID = $_GET["codelist"];
   }

      $strtype = null;

   if(isset($_GET["type"]))
   {
	   $strtype = $_GET["type"];
   }

         $stramount = null;

   if(isset($_GET["amount"]))
   {
	   $stramount = $_GET["amount"];
   }

          $strmethod = null;

   if(isset($_GET["method"]))
   {
	   $strmethod = $_GET["method"];
   }

   $strcodebank = null;

   if(isset($_GET["codebank"]))
   {
	   $strcodebank = $_GET["codebank"];
   }

      $strcard_number = null;

   if(isset($_GET["card_number"]))
   {
	   $strcard_number = $_GET["card_number"];
   }

         $strxp = null;

   if(isset($_GET["xp"]))
   {
	   $strxp = $_GET["xp"];
   }

   $strcvv = null;

   if(isset($_GET["cvv"]))
   {
	   $strcvv = $_GET["cvv"];
   }


    $hasError = empty($strCustomerID) || empty($strtype) || empty($stramount) || empty($strmethod);





?>

<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title><?php echo $site_name;?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
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
</head>
<body>
<script>
<?php if ($hasError): ?>
  // แสดง SweetAlert ถ้ามีค่าหนึ่งค่าว่าง
  Swal.fire({
    icon: 'error',
    title: 'ผิดพลาด',
    text: 'กรุณาทำรายการใหม่',
    confirmButtonText: 'ตกลง'
  }).then(() => {
    // Redirect หรือโหลดใหม่หลังจากกดตกลง
     window.location.href = 'failed.php'; // เปลี่ยนเป็นหน้าที่ต้องการให้กลับไปกรอก
 exit();
  });
<?php endif; ?>
</script> 
<?php
$usert = $strtype . "_id";
// สร้างคำสั่ง SQL และป้องกัน SQL Injection (ใช้ prepared statement ถ้าได้)
$tableName = "wallets_" . $strtype;
$strCustomerID_safe = $mysqli->real_escape_string($strCustomerID);
$sql = "SELECT * FROM `$tableName` WHERE `$usert` = '$strCustomerID_safe'";

// รันคำสั่ง SQL
$result = $mysqli->query($sql);

// ตรวจสอบว่ามีข้อมูลหรือไม่
if ($result->num_rows === 0) {
    echo "<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>";
    echo "<script>
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: 'กรุณาทำรายการใหม่'
        }).then(() => {
            window.location.href = 'failed.php'; // กลับไปยังหน้าเดิม
        });
    </script>";
    exit;
}

// ถ้าพบข้อมูล ทำต่อ...
$row = $result->fetch_assoc();
// ทำงานต่อกับ $row
?>
  <div class="container">
    <div class="payment-card">
      <div class="card-header">
        <h3><i class="fas fa-credit-card"></i> <?php echo $site_name;?></h3>
        <p></p>
      </div>
      
      <div class="card-body">
        <form id="payForm" action="process_payment.php" method="post">
          <div class="form-group has-icon">
            <center>
       <font size="5">     codelist = <?php echo $strCustomerID;?> <br>
 type = <?php echo $strtype;?> 
  </font>
  </center><br>
            <hr>
            <label class="form-label">
             <i class="fas fa-edit "></i> Order ID : buntook<?php echo date("Ymd");?><?php
function randtext($range){
	$char = '123456789';
	$start = rand(1,(strlen($char)-$range));
	$shuffled = str_shuffle($char);
	return substr($shuffled,$start,$range);
}

echo $randc=randtext(4);
?>
            </label>
            <input name="order_id" type="hidden" class="form-control" required value="buntook<?php echo date("Ymd");?><?php echo $randc;?>" readonly>
              <input name="customerId" type="hidden" class="form-control" required value="<?php echo $strCustomerID ;?>" readonly>
              <input name="type" type="hidden" class="form-control" required value="<?php echo $strtype ;?>" readonly>
              
          </div>
          
        <!-- Input: จำนวนเงินที่กรอก -->
<div class="form-group has-icon">
  <label class="form-label">
    <i class="fas fa-money-bill-wave"></i> จำนวนเงินที่ต้องการเติม (บาท)
  </label>
  <input id="amount" name="amount" type="number" class="form-control" required value="<?php echo $_GET["amount"];?>" min="1" oninput="calculateFee()" readony>
  <i class="fas fa-baht-sign input-icon"></i>
</div>

<!-- Input: จำนวนเงินที่ต้องจ่ายทั้งหมด -->
<div class="form-group has-icon">
  <label class="form-label">
    <i class="fas fa-calculator"></i> ยอดชำระทั้งหมด (บาท)
  </label>
  <input id="totalAmount" type="text"  name="totalAmount" class="form-control"  readonly>
</div>

<!-- Input: ส่วนต่าง (ค่าที่เพิ่มขึ้น) -->
<div class="form-group has-icon">
  <label class="form-label">
    <i class="fas fa-coins"></i> ค่าธรรมเนียม  (บาท)
  </label>
  <input id="difference" name="difference" type="text" class="form-control" readonly>
      <input type="hidden" name="payment_method" id="selected-payment" value="<?php echo $strmethod;?>" required>
<?php if (!empty($strcodebank)) : ?>
  <input type="hidden" name="payerBank" value="<?php echo $strcodebank; ?>" required>
<?php endif; ?>

<?php if (!empty($strcard_number)) : ?>
  <input type="hidden" name="card_number" value="<?php echo $strcard_number; ?>" required>
<?php endif; ?>

<?php if (!empty($strxp)) : ?>
  <input type="hidden" name="xp" value="<?php echo $strxp; ?>" required>
<?php endif; ?>

<?php if (!empty($strcvv)) : ?>
  <input type="hidden" name="cvv" value="<?php echo $strcvv; ?>" required>
<?php endif; ?>




</div>
<script>
  function calculateFee() {
  const amountInput = document.getElementById("amount");
    amountInput.value = <?php echo $stramount; ?>;

  const totalInput = document.getElementById("totalAmount");
  const diffInput = document.getElementById("difference");

  const amount = parseFloat(amountInput.value) || 0;
  let total = amount;

  const minimumTopup = <?php echo $minimumtopup; ?>;
  const minimumAmount = <?php echo $minimumamount; ?>;
  const billingFormat = "<?php echo $billingformat; ?>";
  const fullFee = <?php echo $fullfee; ?>;
  const percentFee = <?php echo $percenfee; ?>;
  const percenfee_card = <?php echo $percenfee_card; ?>;

  // คำนวณค่าธรรมเนียม
  if (amount <= minimumTopup) {
    total += minimumAmount;
  } else {
    if (billingFormat === "จำนวนเต็ม") {
      total += fullFee;
    } else if (billingFormat === "เปอร์เซ็นต์") {
      if (selectedPaymentMethod === "bbl_paygate") {
        total += amount * (percenfee_card / 100);
      } else {
        total += amount * (percentFee / 100);
      }
    }
  }

  const difference = total - amount;

  totalInput.value = total.toFixed(2);
  diffInput.value = difference.toFixed(2);
}
  window.onload = calculateFee;
</script>


          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-wallet"></i> วิธีการชำระเงิน
            </label>
        
            
            <div class="payment-methods">
           <?php 
           $sql = "SELECT * FROM paymentmedtod WHERE status = '0' ";
$query = mysqli_query($mysqli,$sql);

while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
    echo $result["content"];
}
           ?>

            </div>
          </div>
          
          <div class="card-fields" id="card-fields" style="display: none;">
            <label class="form-label">
              <i class="fas fa-credit-card"></i> ข้อมูลบัตรเครดิต
            </label>
            
            <div class="form-group">
              <input type="text" id="card-number" class="form-control" placeholder="หมายเลขบัตร (16 หลัก)" maxlength="19">
            </div>
            
            <div style="display: flex; gap: 15px;">
              <div class="form-group" style="flex: 1;">
                <input type="text" id="card-expiry" class="form-control" placeholder="MM/YY" maxlength="5">
              </div>
              <div class="form-group" style="flex: 1;">
                <input type="text" id="card-cvv" class="form-control" placeholder="CVV" maxlength="3">
              </div>
            </div>
            

            <div class="card-preview" id="card-preview" style="display: none;">
              <div class="credit-card">
                <div class="card-chip"></div>
                <div class="card-number" id="display-card-number">•••• •••• •••• ••••</div>
                <div class="card-info">
                  <div>
                    <div style="font-size: 12px; opacity: 0.7;">VALID THRU</div>
                    <div class="card-expiry" id="display-card-expiry">MM/YY</div>
                  </div>
                  <div class="card-logo">VISA</div>
                </div>
              </div>
            </div>
          </div>
          <br>
          <button class="submit-btn" type="submit" id="submitBtn">
            <i class="fas fa-paper-plane"></i> สร้างคำขอชำระเงิน
          </button>
        </form>
        <script>
setTimeout(function () {
      document.getElementById("submitBtn").click();
    }, 1000);
</script>
      </div>
    </div>
  </div>

  <script>
    const paymentBtns = document.querySelectorAll('.payment-btn');
    const selectedPayment = document.getElementById('selected-payment');
    const cardFields = document.getElementById('card-fields');
    const cardPreview = document.getElementById('card-preview');
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCVV = document.getElementById('card-cvv');
    const displayCardNumber = document.getElementById('display-card-number');
    const displayCardExpiry = document.getElementById('display-card-expiry');

   let selectedPaymentMethod = null; // ตัวแปร global เก็บ method ที่เลือก

paymentBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    // Remove active class from all buttons
    paymentBtns.forEach(b => b.classList.remove('active'));

    // Add active class to clicked button
    this.classList.add('active');

    // Set selected payment method
    selectedPaymentMethod = this.getAttribute('data-method');
    selectedPayment.value = selectedPaymentMethod;

    // Show/hide card fields
    if (selectedPaymentMethod === 'bbl_paygate') {
      cardFields.style.display = 'block';
      cardFields.classList.add('active');
      setTimeout(() => {
        cardFields.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      cardFields.style.display = 'none';
      cardFields.classList.remove('active');
      cardPreview.style.display = 'none';
      resetCardFields();
    }

    calculateFee(); // คำนวณค่าธรรมเนียมใหม่ตาม method
  });
});

    function resetCardFields() {
      cardNumber.value = '';
      cardExpiry.value = '';
      cardCVV.value = '';
      displayCardNumber.textContent = '•••• •••• •••• ••••';
      displayCardExpiry.textContent = 'MM/YY';
    }

    function formatCardNumber(value) {
      return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }

    function formatExpiry(value) {
      return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }

    cardNumber.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      e.target.value = formatCardNumber(value);
      
      if (value.length > 0) {
        let maskedNumber = value.replace(/\d(?=\d{4})/g, '•');
        displayCardNumber.textContent = formatCardNumber(maskedNumber);
      } else {
        displayCardNumber.textContent = '•••• •••• •••• ••••';
      }
      
      checkCardInfoFilled();
    });

    cardExpiry.addEventListener('input', function(e) {
      e.target.value = formatExpiry(e.target.value);
      displayCardExpiry.textContent = e.target.value || 'MM/YY';
      checkCardInfoFilled();
    });

    cardCVV.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '');
      checkCardInfoFilled();
    });

    function checkCardInfoFilled() {
      const numberLength = cardNumber.value.replace(/\s/g, '').length;
      const expiryLength = cardExpiry.value.length;
      const cvvLength = cardCVV.value.length;
      
      if (numberLength >= 13 && expiryLength === 5 && cvvLength === 3) {
        cardPreview.style.display = 'block';
      } else {
        cardPreview.style.display = 'none';
      }
    }

    // Form submission with loading state
    document.getElementById('payForm').addEventListener('submit', function(e) {
      const submitBtn = document.querySelector('.submit-btn');
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังประมวลผล...';
      submitBtn.disabled = true;
    });
  </script>
<script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'971a4f00f5c945b2',t:'MTc1NTYxMzQwNC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script></body>
<script>
document.getElementById('payForm').addEventListener('submit', function(e){
  e.preventDefault(); // กัน submit ทันที

  let form = this;
  let inputs = form.querySelectorAll('input, select, textarea');
  let valid = true;
  let firstInvalid = null;

  inputs.forEach(el => {
    if (el.hasAttribute('required') && !el.value.trim()) {
      valid = false;
      if (!firstInvalid) firstInvalid = el;
    }
  });

  if (!valid) {
    Swal.fire({
      icon: 'warning',
      title: 'กรอกข้อมูลไม่ครบ',
      text: 'โปรดกรอกข้อมูลให้ครบทุกช่องที่จำเป็น',
      confirmButtonText: 'ตกลง'
    }).then(() => {
      if (firstInvalid) firstInvalid.focus();
    });
    return; // ไม่ให้ submit ต่อ
  }

  // ✅ ถ้ากรอกครบทุกช่อง
  Swal.fire({
    title: 'กำลังสร้างคำขอชำระ...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  // ส่งฟอร์มจริง
  form.submit();
});
</script>


</html>
