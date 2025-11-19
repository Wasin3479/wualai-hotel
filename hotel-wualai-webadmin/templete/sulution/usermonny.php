

 <!--**********************************
            Content body start
        ***********************************-->
<?php
// เชื่อมต่อฐานข้อมูล


// ดึงข้อมูลจากฐานข้อมูล
$sql = "SELECT * FROM wallets_user";
$result = $conn->query($sql);
?>
  <table id="" class="table table-bordered display table-striped text-dark" style="min-width: 845px">
    <thead class="">
      <tr>
        <th>user_id</th>
         <th>ชื่อ - สกุล</th>
        <th>ยอดเงิน</th>
        <th>สร้างเมื่อ</th>
        <th>แก้ไขเมื่อ</th>
       <th>ทดสอบ</th>
      </tr>
    </thead>
    <tbody>
      <?php while($row = $result->fetch_assoc()): ?>
        <tr>
              <td><?= htmlspecialchars($row['user_id']) ?></td>
          <td><?php
          $sqlui = "SELECT * FROM users WHERE id = '".$row['user_id']."' ";
$queryui = mysqli_query($conn,$sqlui);

while($resultui=mysqli_fetch_array($queryui,MYSQLI_ASSOC))
{
    echo $resultui["first_name"];  echo " "; echo $resultui["last_name"];
}
          ?></td>
          <td><?= htmlspecialchars($row['balance']) ?></td>
          <td><?= htmlspecialchars($row['created_at']) ?></td>
          <td><?= htmlspecialchars($row['updated_at']) ?></td>
           <td>
            
           
           <!-- Button trigger modal -->
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#testmonnyModal<?= htmlspecialchars($row['user_id']) ?>">
  เติมเงิน
</button>

<!-- Modal -->
<div class="modal fade" id="testmonnyModal<?= htmlspecialchars($row['user_id']) ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">เติมเงินผู้ใช้</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">

        <style>
    .hidden {
      display: none;
    }
  </style>
    <form action="https://panel.buntook.com/payment/index.php" name="frmAdd" method="get" target="_blank">
      

    <input type="hidden" class="form-control" name="type" value="<?php echo $strstatus;?>">
      
    <input type="hidden" class="form-control" name="codelist" value="<?= htmlspecialchars($row['user_id']) ?>" >

  <div class="form-group">
     <label for="amount">amount</label>
  <input type="text" class="form-control" name="amount" value="10">
  </div>
     <div class="form-group">
      <label for="paymentMethod">เลือกรูปแบบการชำระเงิน</label>
      <select class="form-control" name="method" id="paymentMethod" >
        <option selected disabled>เลือกรูปแบบการชำระเงิน</option>
        <option value="prompt_pay">PromptPay</option>
        <option value="card_number">บัตรเครดิต</option>
        <option value="mobile_banking">Mobile Banking</option>
        <option value="linepay">LINE Pay</option>
        <option value="rabbit_cash">Rabbit Cash</option>
        <option value="wechatpay">WeChat Pay</option>
      </select>
    </div>

    <!-- บัตรเครดิต -->
    <div id="creditCardFields" class="hidden">
        <div class="form-group">
        <label for="cvv">รหัสบัตร</label>
        <input type="number" class="form-control" name="card_number" placeholder="1234567890">
      </div>
      <div class="form-group">
        <label for="xp">เดือน/ปี หมดอายุ</label>
        <input type="text" class="form-control" name="xp" placeholder="12/28">
      </div>
      <div class="form-group">
        <label for="cvv">รหัส CVV</label>
        <input type="text" class="form-control" name="cvv" placeholder="123">
      </div>
    </div>

    <!-- Mobile Banking -->
    <div id="mobileBankingFields" class="hidden">
      <div class="form-group">
        <label for="codebank">ธนาคาร</label>
        <select class="form-control" name="codebank">
          <option selected disabled>เลือกธนาคาร</option>
          <option value="bbl_mobile_banking">ธนาคารกรุงเทพ</option>
          <option value="scb">ธนาคารไทยพาณิชย์</option>
        </select>
      </div>
    </div>
    
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">ปิด</button>
        <button type="submit" class="btn btn-primary">เติมเงิน</button>
</form>
      </div>
    </div>
  </div>
</div>
           
           
             
        </tr>


       
      <?php endwhile; ?>
    </tbody>
  </table>

    <script>
    const paymentMethod = document.getElementById("paymentMethod");
    const creditCardFields = document.getElementById("creditCardFields");
    const mobileBankingFields = document.getElementById("mobileBankingFields");

    paymentMethod.addEventListener("change", function () {
      const selected = this.value;

      // ซ่อนทุกกล่องก่อน
      creditCardFields.classList.add("hidden");
      mobileBankingFields.classList.add("hidden");

      // แสดงเฉพาะที่เลือก
      if (selected === "card_number") {
        creditCardFields.classList.remove("hidden");
      } else if (selected === "mobile_banking") {
        mobileBankingFields.classList.remove("hidden");
      }
    });
  </script>