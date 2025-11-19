<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>การชำระเงินหมดอายุ</title>
    <link href="https://fonts.googleapis.com/css2?family=Prompt&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <style>
        body {
            background: linear-gradient(to right, #f8f9fa, #e9ecef);
            font-family: 'Prompt', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        .expired-box {
            background: #fff;
            padding: 40px 30px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            max-width: 400px;
        }

        .expired-box h1 {
            font-size: 26px;
            color: #dc3545;
            margin-bottom: 15px;
        }

        .expired-box p {
            font-size: 16px;
            color: #333;
            margin-bottom: 25px;
        }

        .btn-modern {
            background-color: #0d6efd;
            color: white;
            padding: 10px 24px;
            border-radius: 8px;
            text-decoration: none;
            transition: background-color 0.3s;
        }

        .btn-modern:hover {
            background-color: #084298;
        }

        .emoji {
            font-size: 48px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <?php 
    $customerId = $_GET['customerId'] ?? '';
$type = $_GET['type'] ?? '';
    ?>
    <div class="expired-box">
        <div class="emoji">⏰</div>
        <h1>การชำระเงินหมดอายุ</h1>
        <p>ดูเหมือนว่าคุณใช้เวลานานเกินไปในการชำระเงิน<br>กรุณาทำรายการใหม่อีกครั้ง</p>
        <a href="index.php?codelist=<?php echo $customerId ;?>&type=<?php echo $type ;?>" class="btn-modern">กลับสู่หน้าแรก</a>
    </div>
</body>
</html>
