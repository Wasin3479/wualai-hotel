<?php
// 2. ถ้ามีการอัปเดตสถานะ
if (isset($_POST['update_status'])) {
    $id = (int) $_POST['transaction_id'];
    $newStatus = trim($_POST['status']);
    $validStatuses = ['SUCCESS', 'WAIT', 'EJECT'];

    if (in_array($newStatus, $validStatuses)) {
        $stmt = $conn->prepare("UPDATE transactions_user SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $newStatus, $id);
        $stmt->execute();
        $stmt->close();

        echo "
        <script>
        Swal.fire({
            icon: 'success',
            title: 'อัปเดตสถานะสำเร็จ',
            text: 'กำลังเปลี่ยนเส้นทาง...',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = 'super_admin.php?page=approve_withdraw&status=user';
        });
        </script>";
    } else {
        echo "
        <script>
        Swal.fire({
            icon: 'error',
            title: 'สถานะไม่ถูกต้อง',
            text: 'กรุณาเลือกสถานะที่ถูกต้อง'
        });
        </script>";
    }
}

// 3. ดึงข้อมูลทั้งหมด
$result = $conn->query("SELECT * FROM transactions_user WHERE transaction_type = 'WITHDRAW' ORDER BY created_at DESC");
?>

        <table id="example" class="display text-dark" style="min-width: 845px">
    <thead class="">
      <tr>
      <th>รหัส</th>
  <th>รหัสกระเป๋าเงิน</th>
  <th>จำนวนเงิน</th>
  <th>ประเภทธุรกรรม</th>
  <th>รายละเอียด</th>
  <th>ยอดก่อนหน้า</th>
  <th>ยอดหลังทำรายการ</th>
  <th>สถานะ</th>
  <th>วันที่ทำรายการ</th>
  <th>จัดการ</th>
      </tr>
    </thead>
    <tbody>
      <?php while ($row = $result->fetch_assoc()): ?>
        <tr>
          <td><?= $row['id'] ?></td>
          <td><?= htmlspecialchars($row['wallet_id']) ?>
        <br>
        <?php
          $sqlui = "SELECT * FROM users WHERE id = '".$row['wallet_id']."' ";
$queryui = mysqli_query($conn,$sqlui);

while($resultui=mysqli_fetch_array($queryui,MYSQLI_ASSOC))
{
    echo $resultui["first_name"];  echo " "; echo $resultui["last_name"];
}
          ?>
        </td>
          <td><?= number_format($row['amount'], 2) ?></td>
          <td><?= htmlspecialchars($row['transaction_type']) ?></td>
          <td><?= htmlspecialchars($row['description']) ?></td>
          <td><?= number_format($row['beforeAmount'], 2) ?></td>
          <td><?= number_format($row['afterAmount'], 2) ?></td>
          <td>
            <?php
              if ($row['status'] == 'SUCCESS') {
                  echo '<span class="badge badge-success">SUCCESS</span>';
              } elseif ($row['status'] == 'WAIT') {
                  echo '<span class="badge badge-warning">WAIT</span>';
              } elseif ($row['status'] == 'EJECT') {
                  echo '<span class="badge badge-danger">EJECT</span>';
              } else {
                  echo '<span class="badge badge-secondary">'.htmlspecialchars($row['status']).'</span>';
              }
            ?>
          </td>
          <td><?= $row['created_at'] ?></td>
          <td>
            <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#editModal<?= $row['id'] ?>">แก้ไข</button>
          </td>
        </tr>

        <!-- Modal แก้ไขสถานะ -->
        <div class="modal fade" id="editModal<?= $row['id'] ?>" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <form method="post" action="">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">แก้ไขสถานะ: ID <?= $row['id'] ?></h5>
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body">
                  <input type="hidden" name="transaction_id" value="<?= $row['id'] ?>">
                  <div class="form-group">
                    <label>สถานะใหม่:</label>
                    <select name="status" class="form-control" required>
                      <option value="SUCCESS" <?= $row['status'] == 'SUCCESS' ? 'selected' : '' ?>>SUCCESS</option>
                      <option value="WAIT" <?= $row['status'] == 'WAIT' ? 'selected' : '' ?>>WAIT</option>
                      <option value="EJECT" <?= $row['status'] == 'EJECT' ? 'selected' : '' ?>>EJECT</option>
                    </select>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                    <button type="submit" name="update_status" class="btn btn-success">บันทึก</button>
                </div>
              </div>
            </form>
          </div>
        </div>

      <?php endwhile; ?>
    </tbody>
  </table>