  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <?php
	session_start();
	session_destroy();
	
?>
<script>
    Swal.fire({
        icon: 'success',
        title: 'ออกจากระบบสำเร็จ',
        text: 'โปรดรอสักครู่...',
        confirmButtonText: 'ตกลง',
        timer: 3000,
        timerProgressBar: true
    }).then((result) => {
        window.location.href = "login/";
    });

    // หากไม่กดปุ่ม จะ redirect อัตโนมัติหลัง 3 วินาที
    setTimeout(function () {
        window.location.href = "login/";
    }, 3000);
</script>
