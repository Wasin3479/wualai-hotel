<?php
include 'process.php';

if (isset($_POST['add_content'])) {
    $nameth = $_POST['nameth'];
    $nameeng = $_POST['nameeng'];
    $codedata = $_POST['codedata'];
    $typebg = $_POST['typebg'];
    $contentbg = '';

    // อัปโหลดไฟล์หลัก
    $filename = '';
    if ($_FILES['fileupload']['name'] != '') {
        $filename = 'uploads/' . time() . '_' . $_FILES['fileupload']['name'];
        move_uploaded_file($_FILES['fileupload']['tmp_name'], $filename);
    }

    // จัดการ contentbg ตาม typebg
    if ($typebg == '1') {
        $contentbg = $_POST['contentbg_color'];
    } elseif ($typebg == '3' && $_FILES['contentbg_image']['name'] != '') {
        $contentbg = 'uploads/bg_' . time() . '_' . $_FILES['contentbg_image']['name'];
        move_uploaded_file($_FILES['contentbg_image']['tmp_name'], $contentbg);
    }

    $stmt = $conn->prepare("INSERT INTO contentweb (fileupload, nameth, nameeng, codedata, typebg, contentbg) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssis", $filename, $nameth, $nameeng, $codedata, $typebg, $contentbg);
    $stmt->execute();
    header("Location: index.php");
}

// ลบข้อมูล
if (isset($_GET['delete_id'])) {
    $id = $_GET['delete_id'];
    $conn->query("DELETE FROM contentweb WHERE id=$id");
    header("Location: index.php");
}
?>
