<?php
include("../../../include/conn.php");
// เพิ่มข้อมูล
if (isset($_POST['action']) && $_POST['action'] == "add") {
    $title = $_POST['title'];
    $author = $_POST['author'];
    $publish_date = $_POST['publish_date'];
    $typedata = $_POST['typedata'];
    $content = $_POST['content'];

    $image = "";
    if (!empty($_FILES['image']['name'])) {
        $image = time() . '_' . $_FILES['image']['name'];
        move_uploaded_file($_FILES['image']['tmp_name'], '../img/' . $image);
    }

    $stmt = $conn->prepare("INSERT INTO blog_posts (title, image, author, publish_date, typedata, content) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $title, $image, $author, $publish_date, $typedata, $content);
    $stmt->execute();
    echo json_encode(['status' => 'success']);
    exit;
}

// แก้ไขข้อมูล
if (isset($_POST['action']) && $_POST['action'] == "edit") {
    $id = $_POST['id'];
    $title = $_POST['title'];
    $author = $_POST['author'];
    $publish_date = $_POST['publish_date'];
    $typedata = $_POST['typedata'];
    $content = $_POST['content'];

    if (!empty($_FILES['image']['name'])) {
        $image = time() . '_' . $_FILES['image']['name'];
        move_uploaded_file($_FILES['image']['tmp_name'], '../img/' . $image);
        $stmt = $conn->prepare("UPDATE blog_posts SET title=?, image=?, author=?, publish_date=?, typedata=?, content=? WHERE id=?");
        $stmt->bind_param("ssssssi", $title, $image, $author, $publish_date, $typedata, $content, $id);
    } else {
        $stmt = $conn->prepare("UPDATE blog_posts SET title=?, author=?, publish_date=?, typedata=?, content=? WHERE id=?");
        $stmt->bind_param("sssssi", $title, $author, $publish_date, $typedata, $content, $id);
    }

    $stmt->execute();
    echo json_encode(['status' => 'success']);
    exit;
}

// ลบข้อมูล
if (isset($_POST['action']) && $_POST['action'] == "delete") {
    $id = $_POST['id'];
    $conn->query("DELETE FROM blog_posts WHERE id=$id");
    echo json_encode(['status' => 'deleted']);
    exit;
}
?>
