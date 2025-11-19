
  <div style='width: 100%; overflow-x: auto;'>
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css">
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>


<?php
   $strid_code = null;

   if(isset($_GET["id_code"]))
   {
	   $strid_code = $_GET["id_code"];
   }


$sqllt = "SELECT * FROM vehicle_categories WHERE id = '".$strid_code."' ";
$querylt = mysqli_query($conn,$sqllt);

while($resultlt=mysqli_fetch_array($querylt,MYSQLI_ASSOC))
{
    echo $resultlt["content"];   $detail=$resultlt["detail"]; $nameglub=$resultlt["name_th"];
}
?>





  <?php
  // === เพิ่มข้อมูล ===
  if (isset($_POST['add'])) {
    $imgName = '';
	      $category_id = (int) $_POST['category_id'];
    if ($_FILES['vehicle_image']['name'] != '') {
      $imgName = 'img/storage/typecar/' . time() . '_' . $_FILES['vehicle_image']['name'];
      move_uploaded_file($_FILES['vehicle_image']['tmp_name'], $imgName);
    }

    $stmt = $conn->prepare("INSERT INTO vehicle_types (`category_id`, `name_th`, `name_en`, `max_weight_kg`, `max_volume_cbm`, `base_fare`, `base_rate_per_km`, `fuel_rate_pct`, `fixed_rate_pct`, `is_active`, `valid_from`, `valid_to`, `vehicle_image`, `volume_range`, `weight_limit`, `recommended_items`, `has_roof`, `has_strap`, `has_cover`, `has_helper`, `has_loading_fee`, `has_liftgate`, `has_tailgate`, `has_cooling`, `has_crane`, `piceload`, `picebast`, `picerate`, `id_code`)
      VALUES ('".$_POST['category_id']."', '".$_POST['name_th']."', NULL, NULL, NULL, NULL, NULL, '0.50', '0.50', '1', CURRENT_TIMESTAMP, NULL, '".$imgName."', '".$_POST['volume_range']."', '".$_POST['weight_limit']."', '".$_POST['recommended_items']."', '".$_POST['has_roof']."', '".$_POST['has_strap']."', '".$_POST['has_cover']."', '".$_POST['has_helper']."', '".$_POST['has_loading_fee']."', '".$_POST['has_liftgate']."', '".$_POST['has_tailgate']."', '".$_POST['has_cooling']."', '".$_POST['has_crane']."', '".$_POST['piceload']."', '".$_POST['picebast']."', '".$_POST['picerate']."', '".$_POST['category_id']."')");



    if ($stmt->execute()) {
      echo "<script>Swal.fire('เพิ่มข้อมูลสำเร็จ','','success').then(()=>location.href='?page=car_settings&status=listtypecar&id_code=$strid_code');</script>";
    }
  }

  // === ลบข้อมูล ===
  if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $res = $conn->query("SELECT vehicle_image FROM vehicle_types WHERE id=$id");
    $img = $res->fetch_assoc()['vehicle_image'];
    if (file_exists($img)) unlink($img);
    $conn->query("DELETE FROM vehicle_types WHERE id=$id");
    echo "<script>Swal.fire('ลบข้อมูลแล้ว','','success').then(()=>location.href='?page=car_settings&status=listtypecar&id_code=$strid_code');</script>";
  }

  // === แก้ไขข้อมูล ===
  if (isset($_POST['edit'])) {
    $id = $_POST['id'];
    $imgName = $_POST['old_image'];

    if ($_FILES['vehicle_image']['name'] != '') {
      if (file_exists($imgName)) unlink($imgName);
      $imgName = 'img/storage/typecar/' . time() . '_' . $_FILES['vehicle_image']['name'];
      move_uploaded_file($_FILES['vehicle_image']['tmp_name'], $imgName);
    }

    $stmt = $conn->prepare("UPDATE vehicle_types SET vehicle_image=?, category_id=?, name_th=?, volume_range=?, weight_limit=?, recommended_items=?,has_roof=?, has_strap=?, has_cover=?, has_helper=?, has_loading_fee=?, has_liftgate=?, has_tailgate=?, has_cooling=?, has_crane=?, piceload=?, picebast=?, picerate=? WHERE id=?");

    $stmt->bind_param("ssssssssssssssssssi",
      $imgName,
      $_POST['category_id'],
		$_POST['name_th'],
      $_POST['volume_range'],
      $_POST['weight_limit'],
      $_POST['recommended_items'],
      $_POST['has_roof'] ,
      $_POST['has_strap'] ,
      $_POST['has_cover'] ,
      $_POST['has_helper'] ,
      $_POST['has_loading_fee'] ,
      $_POST['has_liftgate'] ,
      $_POST['has_tailgate'] ,
      $_POST['has_cooling'] ,
      $_POST['has_crane'] ,
      $_POST['piceload'] ,
      $_POST['picebast'] ,
      $_POST['picerate'] ,
      $id
    );   

    if ($stmt->execute()) {
      echo "<script>Swal.fire('อัปเดตเรียบร้อย','','success').then(()=>location.href='?page=car_settings&status=listtypecar&id_code=$strid_code');</script>";
    }
  }
  ?>

  <!-- ปุ่มเพิ่ม -->
  <button class="btn btn-success mb-3" data-toggle="modal" data-target="#addModal">➕ เพิ่มข้อมูล</button>

  <!-- ตาราง -->
 <table id="example" class="display text-dark" style="min-width: 845px">
    <thead class="">
      <tr>
        <th>ภาพ</th><th>ประเภท <?php echo $nameglub;?></th><th>ปริมาตร</th><th>น้ำหนัก</th><th>แนะนำ</th>
        <th>✔</th><th>✖</th><th>คลุม</th><th>ช่วย</th><th>โหลด</th>
        <th>เพลา</th><th>ลิฟต์</th><th>เย็น</th><th>เครน</th><th>จัดการ</th>
      </tr>
    </thead>
    <tbody>
    <?php
    $res = $conn->query("SELECT * FROM vehicle_types  WHERE category_id = '".$strid_code."'");
    while($r = $res->fetch_assoc()):
    ?>
      <tr>
        <td><img src="<?= $r['vehicle_image'] ?>" width="80"></td>
        <td><?= $r['name_th'] ?></td>
        <td><?= $r['volume_range'] ?></td>
        <td><?= $r['weight_limit'] ?></td>
        <td><?= $r['recommended_items'] ?></td>
        <td><?= $r['has_roof'] ? '✔' : '❌' ?></td>
        <td><?= $r['has_strap'] ? '✔' : '❌' ?></td>
        <td><?= $r['has_cover'] ? '✔' : '❌' ?></td>
        <td><?= $r['has_helper'] ? '✔' : '❌' ?></td>
        <td><?= $r['has_loading_fee'] ? '✔' : '❌' ?></td>
        <td><?= $r['has_liftgate'] ? '✔' : '❌' ?></td>
        <td><?= $r['has_tailgate'] ? '✔' : '❌' ?></td>
        <td><?= $r['has_cooling'] ? '✔' : '❌' ?></td>
        <td><?= $r['has_crane'] ? '✔' : '❌' ?></td>
        <td>
          <button class="btn btn-primary btn-sm" data-toggle="modal" data-target="#edit<?= $r['id'] ?>">✏️</button>
        <a href="#" 
   class="btn btn-danger btn-sm btn-delete" 
   data-delete-url="?page=car_settings&status=listtypecar&id_code=<?php echo $strid_code;?>&delete=<?= $r['id'] ?>">
   🗑
</a>
        </td>
      </tr>

      <!-- MODAL แก้ไข -->
      <div class="modal fade" id="edit<?= $r['id'] ?>">
        <div class="modal-dialog modal-xl">
          <form method="POST" enctype="multipart/form-data">
            <input type="hidden" name="id" value="<?= $r['id'] ?>">
            <input type="hidden" name="old_image" value="<?= $r['vehicle_image'] ?>">
            <div class="modal-content">
              <div class="modal-header"><h5>✏️ แก้ไขข้อมูล</h5></div>
              <div class="modal-body row">
               <?php
$checkboxes = [
  'has_roof' => 'หลังคา',
  'has_strap' => 'เข็มขัด',
  'has_cover' => 'ผ้าคลุม',
  'has_helper' => 'คนช่วย',
  'has_loading_fee' => 'ค่ารอโหลด',
  'has_liftgate' => 'เพลาลอย',
  'has_tailgate' => 'ลิฟต์ท้าย',
  'has_cooling' => 'ทำความเย็น',
  'has_crane' => 'เครน'
];
?>
<div class="form-group col-md-3">
  <label>ประเภทรถ</label>
  <input type="text" name="" value="<?php echo $nameglub;?>" class="form-control" readonly>
  <input type="hidden" name="category_id" value="<?php echo $strid_code;?>" class="form-control" required>
</div>
				  <div class="form-group col-md-3">
  <label>ชื่อรถ</label>
 <input type="text" name="name_th" value="<?= $r['name_th'] ?>" class="form-control" required>
</div>
<div class="form-group col-md-6">
  <label>เลือกรูปภาพ</label>
  <input type="file" name="vehicle_image" class="form-control-file" >
    <input type="hidden" name="vehicle_imageold" class="fform-control" value="<?= $r['vehicle_image'] ?>" required>
</div>
<div class="form-group col-md-4">
  <label>ปริมาตร</label>
  <input type="text" name="volume_range" class="form-control" value="<?= $r['volume_range'] ?>" required>
</div>
<div class="form-group col-md-4">
  <label>น้ำหนัก</label>
  <input type="text" name="weight_limit" class="form-control" value="<?= $r['weight_limit'] ?>" required>
</div>
<div class="form-group col-md-4">
  <label>สินค้าแนะนำ</label>
  <input type="text" name="recommended_items" class="form-control" value="<?= $r['recommended_items'] ?>" required>
</div>
<div class="form-group col-md-3">
  <label>Base ราคาพื้นฐาน</label>
  <input type="number" step="0.01" name="picebast" value="<?= $r['picebast'] ?>" class="form-control">
</div>
<div class="form-group col-md-3">
  <label>Rateperkm ราคาวิ่งบาทต่อกิโลเมตร</label>
  <input type="number" step="0.01" name="picerate" value="<?= $r['picerate'] ?>" class="form-control">
</div>
<div class="form-group col-md-6"></div>
<?php foreach ($checkboxes as $k => $v): ?>
  <div class="form-check col-md-3 ml-3">
    <input 
      class="form-check-input" 
      type="checkbox" 
      name="<?= $k ?>" 
      value="1"
      id="checkbox_<?= $k ?>"
      <?= isset($r[$k]) && $r[$k] == 1 ? 'checked' : '' ?>
      onchange="togglePiceload(this, '<?= htmlspecialchars($v, ENT_QUOTES) ?>')"
    >
    <label class="form-check-label" for="checkbox_<?= $k ?>"><?= $v ?></label>

    <?php if ($v === 'ค่ารอโหลด'): ?>
      <div class="form-group mt-2" id="piceload_input" style="<?= isset($r[$k]) && $r[$k] == 1 ? '' : 'display: none;' ?>">
        <label>ราคารอโหลด</label>
        <input 
          type="number" 
          step="0.01" 
          name="piceload" 
          class="form-control"
          value="<?= isset($r['piceload']) ? htmlspecialchars($r['piceload']) : '' ?>"
        >
      </div>
    <?php endif; ?>
  </div>
<?php endforeach; ?>

              </div>
              <div class="modal-footer">
                <button name="edit" class="btn btn-primary">อัปเดต</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    <?php endwhile; ?>
    </tbody>
  </table>
</div>

<!-- MODAL เพิ่ม -->
<div class="modal fade" id="addModal">
  <div class="modal-dialog modal-xl">
    <form method="POST" enctype="multipart/form-data">
      <div class="modal-content">
        <div class="modal-header"><h5>➕ เพิ่มข้อมูล</h5></div>
        <div class="modal-body row">
        <?php
$checkboxes = [
  'has_roof' => 'หลังคา',
  'has_strap' => 'เข็มขัด',
  'has_cover' => 'ผ้าคลุม',
  'has_helper' => 'คนช่วย',
  'has_loading_fee' => 'ค่ารอโหลด',
  'has_liftgate' => 'เพลาลอย',
  'has_tailgate' => 'ลิฟต์ท้าย',
  'has_cooling' => 'ทำความเย็น',
  'has_crane' => 'เครน'
];
?>
<div class="form-group col-md-3">
  <label>ประเภทรถ</label>
 <input type="text" name="" value="<?php echo $nameglub;?>" class="form-control" readonly>
  <input type="hidden" name="category_id" value="<?php echo $strid_code;?>" class="form-control" required>
	  <input type="hidden" name="id_code" value="<?php echo $strid_code;?>" class="form-control" required>
</div>
			<div class="form-group col-md-3">
  <label>ชื่อรถ</label>
 <input type="text" name="name_th" value="" class="form-control" required>
</div>
<div class="form-group col-md-6">
  <label>เลือกรูปภาพ</label>
  <input type="file" name="vehicle_image" class="form-control-file">
</div>
<div class="form-group col-md-4">
  <label>ปริมาตร</label>
  <input type="text" name="volume_range" class="form-control">
</div>
<div class="form-group col-md-4">
  <label>น้ำหนัก</label>
  <input type="text" name="weight_limit" class="form-control">
</div>
<div class="form-group col-md-4">
  <label>สินค้าแนะนำ</label>
  <input type="text" name="recommended_items" class="form-control">
</div>
<div class="form-group col-md-3">
  <label>Base ราคาพื้นฐาน</label>
  <input type="number" step="0.01" name="picebast" class="form-control">
</div>
<div class="form-group col-md-3">
  <label>Rateperkm ราคาวิ่งบาทต่อกิโลเมตร</label>
  <input type="number" step="0.01" name="picerate" class="form-control">
	  <input type="hidden"  name="add" value="add" class="form-control">
</div>
<div class="form-group col-md-6"></div>
<?php foreach ($checkboxes as $k => $v): ?>
  <div class="form-check col-md-3 ml-3">
    <input 
      class="form-check-input" 
      type="checkbox" 
      name="<?= $k ?>" 
      value="1" 
      id="checkbox_<?= $k ?>" 
      onchange="togglePiceload(this, '<?= htmlspecialchars($v, ENT_QUOTES) ?>')"
    >
    <label class="form-check-label" for="checkbox_<?= $k ?>"><?= $v ?></label>

    <?php if ($v === 'ค่ารอโหลด'): ?>
      <div class="form-group mt-2" id="piceload_input" style="display: none;">
        <label>ราคารอโหลด</label>
        <input type="number" step="0.01" name="piceload" class="form-control">
		
      </div>
    <?php endif; ?>
  </div>
<?php endforeach ?>

<script>
  function togglePiceload(checkbox, labelText) {
    if (labelText === "ค่ารอโหลด") {
      const inputDiv = checkbox.closest('.form-check').querySelector('#piceload_input');
      if (checkbox.checked) {
        inputDiv.style.display = 'block';
      } else {
        inputDiv.style.display = 'none';
        inputDiv.querySelector('input').value = ""; // clear input
      }
    }
  }
</script>

        </div>
        <div class="modal-footer">
          <button class="btn btn-success">บันทึก</button>
        </div>
      </div>
    </form>
  </div>
</div>







<script>
  document.addEventListener("DOMContentLoaded", function () {
    const deleteButtons = document.querySelectorAll('.btn-delete');

    deleteButtons.forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault(); // ป้องกันการเปลี่ยนหน้า

        const deleteUrl = this.getAttribute('data-delete-url');

        Swal.fire({
          title: 'คุณแน่ใจหรือไม่?',
          text: "หากลบแล้วจะไม่สามารถกู้คืนได้!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'ใช่, ลบเลย!',
          cancelButtonText: 'ยกเลิก'
        }).then((result) => {
          if (result.isConfirmed) {
            // ไปยัง URL ที่ใช้ลบ
            window.location.href = deleteUrl;
          }
        });
      });
    });
  });
</script>


</div>
<br>
<?php echo $detail;?>