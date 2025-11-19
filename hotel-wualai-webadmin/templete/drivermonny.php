

 <!--**********************************
            Content body start
        ***********************************-->
<?php
// เชื่อมต่อฐานข้อมูล


// ดึงข้อมูลจากฐานข้อมูล
$sql = "SELECT * FROM wallets_driver";
$result = $conn->query($sql);
?>
  <table id="example" class="display text-dark" style="min-width: 845px">
    <thead class="">
      <tr>
        <th>worker_id</th>
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
              <td><?= htmlspecialchars($row['driver_id']) ?></td>
          <td><?php
          $sqlui = "SELECT * FROM drivers WHERE id = '".$row['driver_id']."' ";
$queryui = mysqli_query($conn,$sqlui);

while($resultui=mysqli_fetch_array($queryui,MYSQLI_ASSOC))
{
    echo $resultui["first_name"];  echo " "; echo $resultui["last_name"];
}
          ?></td>
          <td><?= htmlspecialchars($row['balance']) ?></td>
          <td><?= htmlspecialchars($row['created_at']) ?></td>
          <td><?= htmlspecialchars($row['updated_at']) ?></td>
          <td><a href="https://panel.buntook.com/payment/index.php?codelist=<?= htmlspecialchars($row['driver_id']) ?>&type=<?php echo $strstatus;?>" class="btn btn-primary" target="_blank">เติมเงิน</a></td>
         
         
        </tr>


       
      <?php endwhile; ?>
    </tbody>
  </table>