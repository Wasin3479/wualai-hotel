  <button class="btn btn-success mb-2" onclick="openAddModal()">+ เพิ่ม</button>
<table id="example" class="display text-dark" style="min-width: 845px">
    <thead>
      <tr>
        <th>ชื่อ</th>
        <th>ลิงก์</th>
        <th>ภาพ</th>
        <th>เริ่ม</th>
        <th>สิ้นสุด</th>
        <th>สถานะ</th>
        <th>จัดการ</th>
      </tr>
    </thead>
    <tbody>
      <?php while ($row = $result->fetch_assoc()): ?>
        <tr>
          <td><?= htmlspecialchars($row['title']) ?></td>
          <td><a href="<?= $row['link_url'] ?>" target="_blank">ไปยังลิงก์</a></td>
          <td><img src="<?= $row['image_url'] ?>" width="100"></td>
          <td><?= $row['start_date'] ?></td>
          <td><?= $row['end_date'] ?></td>
          <td><?= $row['status'] ?></td>
          <td>
            <button class="btn btn-warning btn-sm" onclick='openEditModal(<?= json_encode($row) ?>)'>แก้ไข</button>
            <button class="btn btn-danger btn-sm" onclick="deleteData(<?= $row['id'] ?>)">ลบ</button>
          </td>
        </tr>
      <?php endwhile ?>
    </tbody>
  </table>
</div>

<!-- Modal -->
<div class="modal fade" id="modalBanner" tabindex="-1">
  <div class="modal-dialog">
    <form class="modal-content" id="bannerForm">
      <div class="modal-header">
        <h5 class="modal-title" id="modalTitle">เพิ่ม Banner</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" name="action" id="action">
        <input type="hidden" name="id" id="banner_id">
        <div class="mb-2"><input required name="title" id="title" class="form-control" placeholder="ชื่อ"></div>
        <div class="mb-2"><textarea name="description" id="description" class="form-control" placeholder="คำอธิบาย"></textarea></div>
        <div class="mb-2"><input required name="image_url" id="image_url" class="form-control" placeholder="URL รูปภาพ"></div>
        <div class="mb-2"><input name="link_url" id="link_url" class="form-control" placeholder="ลิงก์"></div>
        <div class="mb-2"><input type="datetime-local" name="start_date" id="start_date" class="form-control"></div>
        <div class="mb-2"><input type="datetime-local" name="end_date" id="end_date" class="form-control"></div>
        <div class="mb-2">
          <select name="status" id="status" class="form-select">
            <option value="active">แสดง</option>
            <option value="inactive">ไม่แสดง</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
        <button class="btn btn-primary" type="submit">บันทึก</button>
      </div>
    </form>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
const modal = new bootstrap.Modal(document.getElementById('modalBanner'))

function openAddModal() {
  document.getElementById('bannerForm').reset()
  document.getElementById('action').value = 'add'
  document.getElementById('modalTitle').innerText = 'เพิ่ม Banner'
  modal.show()
}

function openEditModal(data) {
  document.getElementById('action').value = 'edit'
  document.getElementById('banner_id').value = data.id
  document.getElementById('title').value = data.title
  document.getElementById('description').value = data.description
  document.getElementById('image_url').value = data.image_url
  document.getElementById('link_url').value = data.link_url
  document.getElementById('start_date').value = data.start_date.replace(' ', 'T')
  document.getElementById('end_date').value = data.end_date.replace(' ', 'T')
  document.getElementById('status').value = data.status
  document.getElementById('modalTitle').innerText = 'แก้ไข Banner'
  modal.show()
}

document.getElementById('bannerForm').addEventListener('submit', function(e) {
  e.preventDefault()
  const formData = new FormData(this)
  fetch('', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(res => {
    Swal.fire('สำเร็จ', res.message, 'success').then(() => location.reload())
  })
})

function deleteData(id) {
  Swal.fire({
    title: 'ยืนยันการลบ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  }).then(result => {
    if (result.isConfirmed) {
      fetch('', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ action: 'delete', id })
      })
      .then(res => res.json())
      .then(res => {
        Swal.fire('ลบแล้ว', res.message, 'success').then(() => location.reload())
      })
    }
  })
}
</script>