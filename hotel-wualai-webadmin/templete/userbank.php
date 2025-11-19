<?php


// อัปเดตข้อมูลเมื่อมี POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_id'])) {
    $id = $_POST['edit_id'];
    $is_verified = $_POST['is_verified'];
    $stmt = $conn->prepare("UPDATE bank_accounts_user SET is_verified = ?, updated_at = NOW() WHERE id = ?");
    $stmt->bind_param("ii", $is_verified, $id);
    $stmt->execute();

    // SweetAlert2 แบบ PHP
    echo '<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>';
    echo '<script>
        Swal.fire({
            icon: "success",
            title: "สำเร็จ",
            text: "อัปเดตสถานะเรียบร้อยแล้ว",
            confirmButtonText: "ตกลง"
        }).then(function() {
            window.location = window.location.href;
        });
    </script>';
}
?>

<!-- ตาราง -->
<table id="example" class="display text-dark" style="min-width: 845px">
  <thead>
    <tr>
      <th>ผู้ใช้</th>
      <th>ชื่อธนาคาร</th>
      <th>เลขบัญชี</th>
      <th>ชื่อบัญชี</th>
      <th>สถานะยืนยัน</th>
      <th>จัดการ</th>
    </tr>
  </thead>
  <tbody>
    <?php
    $query = $conn->query("SELECT * FROM bank_accounts_user ORDER BY id DESC");
    while ($row = $query->fetch_assoc()):
    ?>
    <tr>
      <td>
        <?php
        $sqlvc = "SELECT * FROM workers WHERE id = '".$row['user_id']."'";
        $queryvc = mysqli_query($conn, $sqlvc);
        while($resultvc = mysqli_fetch_array($queryvc, MYSQLI_ASSOC)) {
            echo $resultvc["first_name"] . " " . $resultvc["last_name"];
        }
        ?>
      </td>
      <td><?= htmlspecialchars($row['bank_name']) ?></td>
      <td><?= htmlspecialchars($row['bank_account_number']) ?></td>
      <td><?= htmlspecialchars($row['account_name']) ?></td>
      <td>
        <?= $row['is_verified'] ? '<span class="badge badge-success">ยืนยันแล้ว</span>' : '<span class="badge badge-warning">ยังไม่ยืนยัน</span>' ?>
      </td>
      <td>
        <!-- ปุ่มเปิด Modal -->
        <button class="btn btn-primary btn-sm" data-toggle="modal" data-target="#editModal<?= $row['id'] ?>">แก้ไขสถานะ</button>
        
        <!-- Modal Bootstrap 4 -->
        <div class="modal fade" id="editModal<?= $row['id'] ?>" tabindex="-1" role="dialog" aria-labelledby="editModalLabel<?= $row['id'] ?>" aria-hidden="true">
          <div class="modal-dialog " role="document">
            <div class="modal-content">
              <form method="POST">
                <div class="modal-header">
                  <h5 class="modal-title" id="editModalLabel<?= $row['id'] ?>">แก้ไขสถานะ</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <input type="hidden" name="edit_id" value="<?= $row['id'] ?>">
                  <div class="form-group">
                    
                    <select name="is_verified" class="form-control" required>
                      <option value="1" <?= $row['is_verified'] == 1 ? 'selected' : '' ?>>ยืนยันแล้ว</option>
                      <option value="0" <?= $row['is_verified'] == 0 ? 'selected' : '' ?>>ยังไม่ยืนยัน</option>
                    </select>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                      <button type="submit" class="btn btn-success">บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </td>
    </tr>
    <?php endwhile; ?>
  </tbody>
</table>



