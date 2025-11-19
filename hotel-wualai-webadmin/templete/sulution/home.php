
<?php


// 2. คำสั่ง SQL นับจำนวนข้อมูลแต่ละตาราง
$tables = ['drivers', 'users', 'workers'];
$counts = [];

foreach ($tables as $table) {
    $sql = "SELECT COUNT(*) as total FROM $table WHERE verify = '1' ";
    $result = $conn->query($sql);
    
    if ($result && $row = $result->fetch_assoc()) {
        $counts[$table] = $row['total'];
    } else {
        $counts[$table] = 0;
    }
}

// 3. รวมทั้งหมด
$total_all = array_sum($counts);
?>

 
 <!--**********************************
            Content body start
        ***********************************-->

            <!-- row -->
            <div class="container-fluid">
                     <h3 class="mb-4"> <i class="fa fa-tachometer"></i> Dashboard <br><font size="3"></font></h3>
            


<div class="row">
                    <div class="col-lg-3 col-sm-6">
                        <div class="card">
                            <div class="stat-widget-one card-body">
                                <div class="stat-icon d-inline-block">
                                    <i class="ti-user text-success border-success"></i>
                                </div>
                                <div class="stat-content d-inline-block">
                                    <div class="stat-text">จำนวนผู้ใช้งานทั้งหมด</div>
                                    <div class="stat-digit"> <?= $total_all ?></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-sm-6">
                        <div class="card">
                            <div class="stat-widget-one card-body">
                                <div class="stat-icon d-inline-block">
                                    <i class="ti-user text-primary border-primary"></i>
                                </div>
                                <div class="stat-content d-inline-block">
                                    <div class="stat-text">คนขับทั้งหมด</div>
                                    <div class="stat-digit"><?= $counts['drivers'] ?></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-sm-6">
                        <div class="card">
                            <div class="stat-widget-one card-body">
                                <div class="stat-icon d-inline-block">
                                    <i class="ti-user text-pink border-pink"></i>
                                </div>
                                <div class="stat-content d-inline-block">
                                    <div class="stat-text">ผู้ใช้งานทั้งหมด</div>
                                    <div class="stat-digit"><?= $counts['users'] ?></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-sm-6">
                        <div class="card">
                            <div class="stat-widget-one card-body">
                                <div class="stat-icon d-inline-block">
                                    <i class="ti-user text-danger border-danger"></i>
                                </div>
                                <div class="stat-content d-inline-block">
                                    <div class="stat-text">เจ้าของรถทั้งหมด</div>
                                    <div class="stat-digit"><?= $counts['workers'] ?></div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <?php
// เชื่อมต่อฐานข้อมูล

// ดึงยอดรวมของวันนี้
$sql_today = "
    SELECT SUM(amount) AS total_today FROM (
        SELECT amount FROM transactions_worker WHERE transaction_type = 'DEPOSIT' AND status = 'SUCCESS' AND DATE(created_at) = CURDATE()
        UNION ALL
        SELECT amount FROM transactions_user WHERE transaction_type = 'DEPOSIT' AND status = 'SUCCESS' AND DATE(created_at) = CURDATE()
        UNION ALL
        SELECT amount FROM transactions_driver WHERE transaction_type = 'DEPOSIT' AND status = 'SUCCESS' AND DATE(created_at) = CURDATE()
    ) AS all_transactions_today
";

// ดึงยอดรวมของเดือนนี้
$sql_month = "
    SELECT SUM(amount) AS total_month FROM (
        SELECT amount FROM transactions_worker WHERE transaction_type = 'DEPOSIT' AND status = 'SUCCESS' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
        UNION ALL
        SELECT amount FROM transactions_user WHERE transaction_type = 'DEPOSIT' AND status = 'SUCCESS' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
        UNION ALL
        SELECT amount FROM transactions_driver WHERE transaction_type = 'DEPOSIT' AND status = 'SUCCESS' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    ) AS all_transactions_month
";

// รันคำสั่ง SQL วันนี้
$result_today = $conn->query($sql_today);
$row_today = $result_today->fetch_assoc();
$total_today = $row_today['total_today'];

// รันคำสั่ง SQL เดือนนี้
$result_month = $conn->query($sql_month);
$row_month = $result_month->fetch_assoc();
$total_month = $row_month['total_month'];





?> 
 <div class="col-lg-3 col-sm-6">
                        <div class="card">
                            <div class="stat-widget-one card-body">
                                <div class="stat-icon d-inline-block">
                                    <i class="ti-money text-success border-success"></i>
                                </div>
                                <div class="stat-content d-inline-block">
                                    <div class="stat-text">ยอดเงินฝากวันนี้</div>
                                    <div class="stat-digit"><?php
echo number_format(empty($total_today) ? 0 : $total_today, 2) . " บาท";
?></div>
                                </div>
                            </div>
                        </div>
                    </div>


 <div class="col-lg-3 col-sm-6">
                        <div class="card">
                            <div class="stat-widget-one card-body">
                                <div class="stat-icon d-inline-block">
                                    <i class="ti-money text-success border-success"></i>
                                </div>
                                <div class="stat-content d-inline-block">
                                    <div class="stat-text">ยอดเงินฝากเดือนนี้</div>
                                    <div class="stat-digit">
                                <?php
echo number_format(empty($total_month) ? 0 : $total_month, 2) . " บาท";
?></div>
                                </div>
                            </div>
                        </div>
                    </div>

    <?php
// เชื่อมต่อฐานข้อมูล

// ดึงยอดรวมของวันนี้
$sql_today = "
    SELECT SUM(amount) AS total_today FROM (
        SELECT amount FROM transactions_worker WHERE transaction_type = 'WITHDRAW' AND status = 'SUCCESS' AND DATE(created_at) = CURDATE()
        UNION ALL
        SELECT amount FROM transactions_user WHERE transaction_type = 'WITHDRAW' AND status = 'SUCCESS' AND DATE(created_at) = CURDATE()
        UNION ALL
        SELECT amount FROM transactions_driver WHERE transaction_type = 'WITHDRAW' AND status = 'SUCCESS' AND DATE(created_at) = CURDATE()
    ) AS all_transactions_today
";

// ดึงยอดรวมของเดือนนี้
$sql_month = "
    SELECT SUM(amount) AS total_month FROM (
        SELECT amount FROM transactions_worker WHERE transaction_type = 'WITHDRAW' AND status = 'SUCCESS' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
        UNION ALL
        SELECT amount FROM transactions_user WHERE transaction_type = 'WITHDRAW' AND status = 'SUCCESS' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
        UNION ALL
        SELECT amount FROM transactions_driver WHERE transaction_type = 'WITHDRAW' AND status = 'SUCCESS' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    ) AS all_transactions_month
";

// รันคำสั่ง SQL วันนี้
$result_today = $conn->query($sql_today);
$row_today = $result_today->fetch_assoc();
$total_todayw = $row_today['total_today'];

// รันคำสั่ง SQL เดือนนี้
$result_month = $conn->query($sql_month);
$row_month = $result_month->fetch_assoc();
$total_monthw = $row_month['total_month'];





?> 
                     <div class="col-lg-3 col-sm-6">
                        <div class="card">
                            <div class="stat-widget-one card-body">
                                <div class="stat-icon d-inline-block">
                                    <i class="ti-money text-primary border-primary"></i>
                                </div>
                                <div class="stat-content d-inline-block">
                                    <div class="stat-text">ยอดถอนเงินวันนี้</div>
                                    <div class="stat-digit"><?php
echo number_format(empty($total_todayw) ? 0 : $total_todayw, 2) . " บาท";
?>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>


 <div class="col-lg-3 col-sm-6">
                        <div class="card">
                            <div class="stat-widget-one card-body">
                                <div class="stat-icon d-inline-block">
                                    <i class="ti-money text-primary border-primary"></i>
                                </div>
                                <div class="stat-content d-inline-block">
                                    <div class="stat-text">ยอดถอนเงินเดือนนี้</div>
                                   <div class="stat-digit">
                                <?php
echo number_format(empty($total_monthw) ? 0 : $total_monthw, 2) . " บาท";
?></div>
                                </div>
                            </div>
                        </div>
                    </div>



 <div class="col-lg-12 col-sm-12">
                       


<iframe 
  src="https://panel.buntook.com/payment/dashboard.php" 
  style="width: 100%; height: 2000px; border: none;" 
  scrolling="no">
</iframe>






                        

                        </div>
                    </div>





                </div>











            </div>

        <!--**********************************
            Content body end
        ***********************************-->
