<div class="modal fade" id="addModal">
    <div class="modal-dialog modal-lg">
        <form method="POST" action="?page=webcontent" enctype="multipart/form-data" class="modal-content">
            <div class="modal-header"><h5 class="modal-title">เพิ่มข้อมูล</h5></div>
            <div class="modal-body text-dark">
                <div class="form-group">
                    <label>ภาพแสดงหัวข้อ (ถ้ามี)</label>
                    <input type="file" name="fileupload" class="form-control">
                        <input type="hidden" name="codedata" class="form-control" value="<?php
function randtext($range){
	$char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ123456789';
	$start = rand(1,(strlen($char)-$range));
	$shuffled = str_shuffle($char);
	return substr($shuffled,$start,$range);
}

echo randtext(10);
?>
">
<input type="hidden" name="code_content" class="form-control" value="<?php
function randtext2($range2){
	$char2 = 'abcdefghijklmnopqrstuvwxyz';
	$start2 = rand(1,(strlen($char2)-$range2));
	$shuffled2 = str_shuffle($char2);
	return substr($shuffled2,$start2,$range2);
}

echo randtext2(10);
?>
">
<input type="hidden" name="no" class="form-control" value="<?php
$sqlvc = "SELECT * FROM contentweb WHERE codelist = '".$HTTP_HOST."' ";
$queryvc = mysqli_query($conn,$sqlvc);

while($resultvc=mysqli_fetch_array($queryvc,MYSQLI_ASSOC))
{
  $no=$resultvc["no"];
}
echo $no+1;
?>">

                </div>
                <div class="form-group">
                    <label>ชื่อหัวข้อไทย</label> 
                    <input type="text" name="nameth" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>ชื่อหัวข้ออังกฤษ</label>
                    <input type="text" name="nameeng" class="form-control">
                </div>

                         <div class="form-group">
                    <label>รูปแบบการแสดง</label>
                    <select name="statusslide" class="form-control" required>
                         <option value="" selected>เลือกรูปแบบการแสดง</option>
                           <option value="0" >ภาพ</option>
                        <option value="0">ภาพ</option>
                        <option value="1">บล็อก</option>
                        <option value="2">ลิงค์</option>
                         <option value="3">แก้ไข HTML</option>
                    </select>
                </div>
                	

                 <div class="form-group">
                    <label>ข้อความ</label>
                    <select name="statustext" class="form-control" >
                        <option value="">เว้นไว้</option>
                        <option value="บนรูป">บนรูป</option>
                        <option value="ใต้รูป">ใต้รูป</option>
                    </select>
                </div>

                                <div class="form-group">
                    <label>ภาพเนื้อหา</label>
                    <select name="statustable" class="form-control" >
                        <option value="">เว้นไว้</option>
                        <option value="แสดงภาพ">แสดงภาพ</option>
                        <option value="แบบข้อความ">แบบข้อความ</option>
                    </select>
                         </div> 

                           <div class="form-group">
                    <label>ขนาดที่แสดง</label>
                    <select name="sizecol" class="form-control" >
                        <option value="col-md-12 col-sm-12 col-xs-12">col-md-12 col-sm-12 col-xs-12</option>
                        <option value="col-md-4 col-sm-4 col-xs-12">col-md-4 col-sm-4 col-xs-12</option>
                        <option value="col-md-8 col-sm-8 col-xs-12">col-md-8 col-sm-8 col-xs-12</option>
                           <option value="col-md-6 col-sm-6 col-xs-12">col-md-8 col-sm-8 col-xs-12</option>
                    </select>
                         </div> 

                                                  <div class="form-group">
                    <label>ขนาดที่แสดงเนื้อหา</label>
                    <select name="sizecolcontent" class="form-control" >
                        <option value="col-md-3 col-sm-6 col-xs-12">col-md-3 col-sm-6 col-xs-12</option>
                        <option value="col-md-4 col-sm-4 col-xs-12">col-md-4 col-sm-4 col-xs-12</option>
                           <option value="col-md-12 col-sm-12 col-xs-12">col-md-12 col-sm-12 col-xs-12</option>
                    </select>
                         </div> 

                            <div class="form-group">
                    <label>จำนวนที่แสดงในหน้าแรก</label>
                    <input type="number" name="numbershow" class="form-control" value="8">
                </div>

           
           
                <div class="form-group">
                    <label>ชนิดพื้นหลัง</label>
                    <select name="typebg" class="form-control" onchange="toggleContentBG(this.value)">
                        <option value="">สีขาว</option>
                        <option value="1">กำหนดสี</option>
                        <option value="3">ใส่ไฟล์ภาพ</option>
                    </select>
                </div>
                <div class="form-group" id="contentbg_color" style="display:none;">
                    <label>เลือกสีพื้นหลัง</label>
                    <input type="color" name="contentbg_color" class="form-control">
                </div>
                <div class="form-group" id="contentbg_image" style="display:none;">
                    <label>อัปโหลดภาพพื้นหลัง</label>
                    <input type="file" name="contentbg_image" class="form-control">
                </div>
                <!-- ฟิลด์อื่น ๆ -->
            </div>
            <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-dismiss="modal">ปิด</button>
                <button type="submit" name="add_content" class="btn btn-success">บันทึก</button>
            </div>
        </form>
    </div>
</div>
