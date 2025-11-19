import dayjs from 'dayjs'

// ============ Rooms listing filter (ทนทานต่อค่าว่าง/undefined) ============
export function filterRooms(rooms, { q = '', adults = 0 } = {}) {
  let list = Array.isArray(rooms) ? rooms.slice() : []
  const qq = String(q || '').trim().toLowerCase()
  const needAdults = Number(adults || 0)

  if (qq) {
    list = list.filter(r =>
      String(r.name || '').toLowerCase().includes(qq) ||
      String(r.description || '').toLowerCase().includes(qq)
    )
  }
  if (needAdults > 0) {
    list = list.filter(r => Number(r.capacity || 0) >= needAdults)
  }
  return list
}

// ============ File -> DataURL (ตามที่หน้า Booking ใช้อยู่) ============
export async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = reject
    fr.readAsDataURL(file)
  })
}

// ====== Helpers (จำลอง user/api room type/ยอดรวม) ======
// NOTE: สมมุติว่าที่โปรเจ็กต์คุณมีฟังก์ชันพวกนี้อยู่แล้วก็ใช้ของเดิมได้เลย
export function getCurrentUser() {
  const raw = localStorage.getItem('auth_user')
  return raw ? JSON.parse(raw) : null
}

export async function getRoomType(room_type_id) {
  const all = JSON.parse(localStorage.getItem('room_types') || '[]')
  const found = all.find(r => Number(r.id) === Number(room_type_id))
  if (!found) throw new Error('Room type not found')
  return found
}

// สูตรคำนวณราคาอย่างง่าย (ถ้ามีของเดิมอยู่แล้วให้ใช้ของเดิม)
export function calcRoomTotal(rt, nights) {
  const base = Number(rt?.base_price || 0)
  const n = Number(nights || 0)
  return Math.max(0, base * n)
}

// ============ Booking core in localStorage ============
const LS_KEY = 'bookings'

function getAllBookings() {
  return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
}
function saveAllBookings(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}
function newBookingNo(existing = []) {
  // กันซ้ำแบบง่าย ๆ
  let no
  do {
    no = 'BK' + String(Math.floor(100000 + Math.random() * 900000))
  } while (existing.some(b => b.booking_no === no))
  return no
}
function ensureValidDates(check_in, check_out) {
  const inD = dayjs(check_in)
  const outD = dayjs(check_out)
  if (!inD.isValid() || !outD.isValid()) throw new Error('Invalid date')
  if (outD.diff(inD, 'day') <= 0) throw new Error('Check-out must be after check-in')
  return { inD, outD, nights: outD.diff(inD, 'day') }
}

// สร้างการจอง
export async function createBooking({
  room_type_id, check_in_date, check_out_date,
  adults, children, notes,
  payment_method, slip_data_url, bank_ref
}) {
  const user = getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { nights } = ensureValidDates(check_in_date, check_out_date)

  const rt = await getRoomType(room_type_id)
  const cap = Number(rt.capacity || 0)
  const pax = Number(adults || 0) + Number(children || 0)
  if (Number(adults || 0) < 1) throw new Error('At least 1 adult is required')
  if (cap > 0 && pax > cap) throw new Error(`Exceeds room capacity (${cap})`)

  const total_amount = calcRoomTotal(rt, nights)

  const all = getAllBookings()
  const booking = {
    id: Date.now(),
    booking_no: newBookingNo(all),
    user_id: user.id,
    guest_id: user.id,
    room_type_id: Number(room_type_id),
    room_type: rt,
    check_in_date,
    check_out_date,
    nights,
    adults: Number(adults || 0),
    children: Number(children || 0),
    status: 'pending', // pending | confirmed | cancelled
    payment_method: payment_method || 'qr_bank',
    payment_status:
      payment_method === 'qr_bank'
        ? (slip_data_url ? 'pending' : 'required')
        : 'pending', // required | pending | paid | failed
    slip_data_url: slip_data_url || '',
    bank_ref: bank_ref || '',
    total_amount,
    created_at: new Date().toISOString(),
    notes: notes || ''
  }

  all.push(booking)
  saveAllBookings(all)
  return booking
}

// อ่านของฉัน
export async function getMyBookings() {
  const user = getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const all = getAllBookings()
  return all
    .filter(b => b.user_id === user.id)
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
}

// ดึง booking เดี่ยว (ช่วยเวลาอยากรีเฟรชหน้า detail)
export async function getBookingByNo(booking_no) {
  const all = getAllBookings()
  return all.find(b => b.booking_no === booking_no) || null
}

// อัปโหลด/แก้สลิปย้อนหลัง (หน้า Step 2 เสร็จแล้วมาอัปเดต)
export async function updateBookingSlip(booking_id, { slip_data_url, bank_ref }) {
  const all = getAllBookings()
  const idx = all.findIndex(b => b.id === Number(booking_id))
  if (idx === -1) throw new Error('Booking not found')

  const cur = all[idx]
  all[idx] = {
    ...cur,
    slip_data_url: slip_data_url || cur.slip_data_url,
    bank_ref: bank_ref ?? cur.bank_ref,
    payment_status: 'pending' // เมื่อมีสลิปให้รอตรวจ
  }
  saveAllBookings(all)
  return all[idx]
}

// เปลี่ยนสถานะชำระเงิน (สมมุติหลังบ้านกดยืนยัน)
export async function setPaymentStatus(booking_id, status /* 'paid'|'failed'|'pending' */) {
  const all = getAllBookings()
  const idx = all.findIndex(b => b.id === Number(booking_id))
  if (idx === -1) throw new Error('Booking not found')
  all[idx] = { ...all[idx], payment_status: status }
  // ถ้าชำระแล้ว ถือว่ายืนยันการจองด้วย (แล้วแต่กติกา)
  if (status === 'paid') {
    all[idx].status = 'confirmed'
  }
  saveAllBookings(all)
  return all[idx]
}

// ยกเลิกการจอง
export async function cancelBooking(booking_id) {
  const all = getAllBookings()
  const idx = all.findIndex(b => b.id === Number(booking_id))
  if (idx === -1) throw new Error('Booking not found')
  all[idx] = { ...all[idx], status: 'cancelled' }
  saveAllBookings(all)
  return all[idx]
}
