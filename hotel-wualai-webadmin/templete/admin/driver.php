
  <div style='width: 100%; overflow-x: auto;'>
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css">
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>

<table id="examplecv" class="display text-dark" style="min-width: 845px">
    <thead>
        <tr>
<th style="white-space: nowrap; text-align: center;">รหัสผู้ใช้</th>
<th style="white-space: nowrap; text-align: center;">เบอร์โทร</th>
<th style="white-space: nowrap; text-align: center;">PIN</th>
<th style="white-space: nowrap; text-align: center;">ยืนยันตัวตน</th>
<th style="white-space: nowrap; text-align: center;">ประเภทการเข้าสู่ระบบ</th>
<th style="white-space: nowrap; text-align: center;">ชื่อจริง</th>
<th style="white-space: nowrap; text-align: center;">นามสกุล</th>
<th style="white-space: nowrap; text-align: center;">วันเกิด</th>
<th style="white-space: nowrap; text-align: center;">เพศ</th>
<th style="white-space: nowrap; text-align: center;">อีเมล</th>
<th style="white-space: nowrap; text-align: center;">ใบขับขี่รถยนต์</th>
<th style="white-space: nowrap; text-align: center;">ใบขับขี่จักรยานยนต์</th>
<th style="white-space: nowrap; text-align: center;">รูปโปรไฟล์</th>
<th style="white-space: nowrap; text-align: center;">วันที่สร้าง</th>
<th style="white-space: nowrap; text-align: center;">อัปเดตล่าสุด</th>

            <th style="white-space: nowrap; text-align: center;">Action</th> <!-- เพิ่มคอลัมน์ปุ่ม -->
        </tr>
    </thead>
</table>

<!-- Modal Bootstrap 4 -->
<div class="modal fade" id="verifyModal" tabindex="-1" role="dialog" aria-labelledby="verifyModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <form id="verifyForm">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="verifyModalLabel">แก้ไขสถานะ Verify</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        
        <div class="modal-body">
            <input type="hidden" id="userId" name="userId" value="">
            <div class="form-group">
                <label for="verifyStatus">สถานะ Verify</label>
                <select class="form-control" id="verifyStatus" name="verifyStatus" required>
                    <option value="0">ยังไม่ยืนยัน</option>
                    <option value="1">ยืนยันแล้ว</option>
                </select>
            </div>
        </div>
        
        <div class="modal-footer">
        
          <button type="submit" class="btn btn-primary">บันทึก</button>
        </div>
      </div>
    </form>
  </div>
</div>

<script>
$(document).ready(function() {
    var table = $('#examplecv').DataTable({
        "processing": true,
        "serverSide": true,
        "ajax": "driver_list.php",
        "order": [[0, "desc"]],
        "columns": [
{ "data": "id" },
{ "data": "tel" },
{ "data": "pin" },
{ "data": "verify" },
{ "data": "logintype" },
{ "data": "first_name" },
{ "data": "last_name" },
{ "data": "birth_date" },
{ "data": "gender" },
{ "data": "email" },
{ "data": "car_license" },
{ "data": "motorcycle_license" },
{ "data": "profile_picture" },
{ "data": "createAt" },
{ "data": "updateAt" },
            {
                "data": null,
                "orderable": false,
                "render": function (data, type, row) {
                    return `<button class="btn btn-sm btn-primary editVerifyBtn" data-id="${row.id}" data-verify="${row.verify}">แก้ไขสถานะ</button>`;
                }
            }
        ]
    });

    // เมื่อกดปุ่มแก้ไขสถานะ
    $('#examplecv tbody').on('click', '.editVerifyBtn', function() {
        var userId = $(this).data('id');
        var verifyStatus = $(this).data('verify');

        $('#userId').val(userId);
        $('#verifyStatus').val(verifyStatus);
        $('#verifyModal').modal('show');
    });

    // เมื่อ submit form แก้ไขสถานะ
    $('#verifyForm').on('submit', function(e) {
        e.preventDefault();

        var userId = $('#userId').val();
        var verifyStatus = $('#verifyStatus').val();

        $.ajax({
            url: 'update_verify_driver.php',  // ไฟล์ PHP สำหรับอัพเดตข้อมูล
            method: 'POST',
            data: {
                id: userId,
                verify: verifyStatus
            },
            success: function(response) {
                // สมมติว่า PHP คืนค่า JSON ว่า success หรือไม่
                var res = JSON.parse(response);
                if(res.success){
                    $('#verifyModal').modal('hide');
                    table.ajax.reload(null, false);  // รีโหลดตารางข้อมูลโดยไม่เปลี่ยนหน้า
                    Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'อัพเดตสถานะสำเร็จแล้ว',
        timer: 2000,
        showConfirmButton: false
    });
                } else {
                     Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: res.message || 'ไม่สามารถอัพเดตข้อมูลได้'
    });
                }
            },
            error: function() {
               Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
    });
            }
        });
    });
});
</script>