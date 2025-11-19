<!-- Modal -->
<div class="modal fade" id="editModal<?= $row['id'] ?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">แก้ไขข้อมูล</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div> 
      <div class="modal-body text-dark">
        <form method="POST" action="?page=webcontent" enctype="multipart/form-data" class="modal-content">
                <input type="hidden" name="id" value="<?= $row['id'] ?>">

                <div class="form-group">
                   <label>ภาพแสดงหัวข้อ (ถ้ามี)</label><br>
                    <input type="file" name="fileupload" class="form-control">
                    <?php if ($row['fileupload']): ?>
                        <small class="form-text text-muted">ไฟล์เดิม: <?= basename($row['fileupload']) ?></small>
                    <?php endif; ?>
                </div>
 <div class="form-group">
                    <label>ลำดับ</label>
                    <input type="number" name="no" value="<?= $row['no'] ?>" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>ชื่อหัวข้อไทย</label>
                    <input type="text" name="nameth" value="<?= $row['nameth'] ?>" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>ชื่อหัวข้ออังกฤษ</label>
                    <input type="text" name="nameeng" value="<?= $row['nameeng'] ?>" class="form-control">
                </div>
               <div class="form-group">
                    <label>รูปแบบการแสดง</label>
                    <select name="statusslide" class="form-control" required>
                         <option value="<?= $row['statusslide'] ?>" ><?php
if ($row['statusslide'] == 0) {
    echo "ภาพ";
} elseif ($row['statusslide'] == 1) {
    echo "บล็อก";
} elseif ($row['statusslide'] == 2) {
    echo "ลิงค์";
} elseif ($row['statusslide'] == 3) {
    echo "แก้ไข HTML";
} else {
    echo "สถานะไม่ถูกต้อง";
}
?>
</option>
                        <option value="0">ภาพ</option>
                        <option value="1">บล็อก</option>
                        <option value="2">ลิงค์</option>
                         <option value="3">แก้ไข HTML</option>
                    </select>
                </div>
                	

                 <div class="form-group">
                    <label>ข้อความ</label>
                    <select name="statustext" class="form-control" >
                       <option value="<?= $row['statustext'] ?>" ><?php
if (!empty($row['statustext'])) {
    echo $row['statustext'];
} else {
    echo 'เว้นไว้';
}
?></option>
                        <option value="">เว้นไว้</option>
                        <option value="บนรูป">บนรูป</option>
                        <option value="ใต้รูป">ใต้รูป</option>
                    </select>
                </div>

                                <div class="form-group">
                    <label>ภาพเนื้อหา</label>
                    <select name="statustable" class="form-control" >
                          <option value="<?= $row['statustable'] ?>" ><?php
if (!empty($row['statustable'])) {
    echo $row['statustable'];
} else {
    echo 'เว้นไว้';
}
?></option>
                        <option value="">เว้นไว้</option>
                        <option value="แสดงภาพ">แสดงภาพ</option>
                        <option value="แบบข้อความ">แบบข้อความ</option>
                    </select>
                         </div> 

                           <div class="form-group">
                    <label>ขนาดที่แสดง</label>
                    <select name="sizecol" class="form-control" >
                        <option value="<?= $row['sizecol'] ?>" ><?= $row['sizecol'] ?></option>
                                       <option value="col-md-3 col-sm-3 col-xs-12">col-md-3 col-sm-3 col-xs-12</option>
                        <option value="col-md-12 col-sm-12 col-xs-12">col-md-12 col-sm-12 col-xs-12</option>
                        <option value="col-md-4 col-sm-4 col-xs-12">col-md-4 col-sm-4 col-xs-12</option>
                        <option value="col-md-8 col-sm-8 col-xs-12">col-md-8 col-sm-8 col-xs-12</option>
                           <option value="col-md-6 col-sm-6 col-xs-12">col-md-6 col-sm-6 col-xs-12</option>
                    </select>
                         </div>  

                                                  <div class="form-group">
                    <label>ขนาดที่แสดงเนื้อหา</label>
                    <select name="sizecolcontent" class="form-control" >
                         <option value="<?= $row['sizecolcontent'] ?>" ><?= $row['sizecolcontent'] ?></option>
                        <option value="col-md-3 col-sm-6 col-xs-12">col-md-3 col-sm-6 col-xs-12</option>
                        <option value="col-md-4 col-sm-4 col-xs-12">col-md-4 col-sm-4 col-xs-12</option>
                           <option value="col-md-12 col-sm-12 col-xs-12">col-md-12 col-sm-12 col-xs-12</option>
                    </select>
                         </div> 

                            <div class="form-group">
                    <label>จำนวนที่แสดงในหน้าแรก</label>
                    <input type="number" name="numbershow" class="form-control" value="<?= $row['numbershow'] ?>">
                </div>


                <div class="form-group">
                    <label>ชนิดพื้นหลัง</label>
                    <select name="typebg" class="form-control" onchange="toggleContentBG(this.value, 'edit<?= $row['id'] ?>')">
                        <option value="" <?= $row['typebg'] == '' ? 'selected' : '' ?>>สีขาว</option>
                        <option value="1" <?= $row['typebg'] == 1 ? 'selected' : '' ?>>กำหนดสี</option>
                        <option value="3" <?= $row['typebg'] == 3 ? 'selected' : '' ?>>ใส่ไฟล์ภาพ</option>
                    </select>
                </div>

                <div class="form-group" id="edit<?= $row['id'] ?>contentbg_color" style="display:<?= $row['typebg'] == 1 ? 'block' : 'none' ?>;">
                    <label>เลือกสีพื้นหลัง</label>
                    <input type="color" name="contentbg_color" class="form-control" value="<?= htmlspecialchars($row['contentbg']) ?>">
                </div>

                <div class="form-group" id="edit<?= $row['id'] ?>contentbg_image" style="display:<?= $row['typebg'] == 3 ? 'block' : 'none' ?>;">
                    <label>อัปโหลดภาพพื้นหลัง</label>
                    <input type="file" name="contentbg_image" class="form-control">
                    <?php if ($row['typebg'] == 3 && $row['contentbg']): ?>
                        <small class="form-text text-muted">ไฟล์เดิม: <?= basename($row['contentbg']) ?></small>
                    <?php endif; ?>
                </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-dismiss="modal">ปิด</button>
       <button type="submit" name="edit_content" class="btn btn-success">บันทึก</button>       </form>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="modalimgbg<?php echo $id;?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel"><?php echo $row['nameth'];?></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
       

<img src="<?php echo $row['contentbg'];?>" width="100%" height="" border="0" alt="">

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-dismiss="modal">ปิด</button>
      
      </div>
    </div>
  </div>
</div>


<div class="modal fade" id="modalimgtitle<?php echo $id;?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel"><?php echo $row['nameth'];?></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
       

<img src="<?php echo $row['fileupload'];?>" width="100%" height="" border="0" alt="">

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-dismiss="modal">ปิด</button>
      
      </div>
    </div>
  </div>
</div>



<!-- Modal -->
<div class="modal fade" id="editModaluser<?php echo $id;?>" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">จัดการผู้ลงข้อมูล <?php 
        $namethc="";
if ($row['fileupload'] != "") {
echo '
 <img src="'.$row['fileupload'].'" height="" border="0" alt="">';
} else {
echo $row['nameth'];
}

        ?></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
      

 <iframe 
        src="sulution/content/usermenu.php?codelist=<?php echo $HTTP_HOST;?>&idcontent=<?php echo $id;?>" 
        frameborder="0"
        scrolling="no" 
        style="overflow:hidden;height:400px;width:100%" 
        height="400px" 
     width="100%"></iframe>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">ปิด</button>
       
      </div>
    </div>
  </div>
</div>