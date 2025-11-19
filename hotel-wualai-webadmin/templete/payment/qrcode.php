<?php
$qr_data = "00020101021230870016A0000006770101120115010555201212606022031B418DC104206418E06032060141AF8022A40C1E5B15204478953037645406100.005802TH5919BUNTOOK APPLICATION6012อำเภอเขต เมื6258012468A4953321EC23973819041E0502NA0720EF84D06E148C29D4F7E363040D21";

// เก็บ QR ลง memory แทนที่จะบันทึกไฟล์
ob_start();
QRcode::png($qr_data, null, QR_ECLEVEL_H, 10, 4);
$imageString = ob_get_contents();
ob_end_clean();

// แปลงเป็น Base64 data URI
$dataUri = "data:image/png;base64," . base64_encode($imageString);

// แสดงผลเป็น <img>
echo '<img src="'.$dataUri.'" alt="QR Code" width="300" height="300">';