import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, ProgressBar, InputGroup } from 'react-bootstrap'
import dayjs from 'dayjs'
import * as api from '../services/api.js'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { BANK_INFO } from '../config.js'

export default function Booking(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [rt,setRt] = useState(null)
  const [step,setStep] = useState(1)
  const [status,setStatus] = useState({ error:'', ok:'' })
  const [loading,setLoading] = useState(false)

  const [dates,setDates] = useState({
    check_in: dayjs().add(1,'day').format('YYYY-MM-DD'),
    check_out: dayjs().add(2,'day').format('YYYY-MM-DD')
  })

  const [guest,setGuest] = useState({
    full_name: user?.full_name||'',
    email: user?.email||'',
    phone: user?.phone||'',
    notes:''
  })

  const [party,setParty] = useState({ adults:2, children:0 })

  const [payment,setPayment] = useState({
    method:'qr_bank', // qr_bank | bank_transfer (เผื่อขยาย)
    slipDataUrl:'',
    ref:''
  })

  useEffect(()=>{
    let alive = true
    ;(async ()=>{
      try{
        const data = await api.getRoomType(id)
        if(alive) setRt(data)
      }catch(e){
        setStatus({ error: e.message, ok:'' })
      }
    })()
    return ()=>{ alive = false }
  },[id])

  const nights = useMemo(()=> {
    const n = dayjs(dates.check_out).diff(dayjs(dates.check_in),'day')
    return isNaN(n) ? 0 : Math.max(n, 0)
  },[dates])

  const total = useMemo(()=> rt ? api.calcRoomTotal(rt, nights) : 0, [rt, nights])

  const progress = useMemo(()=> step===1?33:step===2?66:100, [step])

  function clearStatus(){ setStatus({ error:'', ok:'' }) }

  function canNextFromStep1(){
    if(!rt) return false
    if(nights <= 0) return false
    if(!guest.full_name?.trim()) return false
    if(!guest.phone?.trim()) return false
    if(!guest.email?.trim()) return false
    if(party.adults < 1) return false
    return true
  }

  function canNextFromStep2(){
    if(payment.method === 'qr_bank' || payment.method === 'bank_transfer'){
      if(!payment.slipDataUrl) return false
      if(!payment.ref?.trim()) return false
    }
    return true
  }

  async function onConfirm(){
    try{
      clearStatus()
      if(!user) throw new Error('Please login to continue')
      if(nights<=0) throw new Error('Check-out must be after check-in')

      setLoading(true)
      const booking = await api.createBooking({
        room_type_id: Number(id),
        check_in_date: dates.check_in,
        check_out_date: dates.check_out,
        adults: party.adults,
        children: party.children,
        notes: guest.notes,
        payment_method: payment.method,
        slip_data_url: payment.slipDataUrl,
        bank_ref: payment.ref
      })
      setStatus({ ok: `Booking #${booking.booking_no} created`, error:'' })
      setTimeout(()=> navigate('/me/bookings'), 800)
    }catch(err){
      setStatus({ error: err.message||'Create booking failed', ok:'' })
    }finally{
      setLoading(false)
    }
  }

  async function onUploadSlip(e){
    const f = e.target.files?.[0]
    if(!f) return
    clearStatus()
    try{
      const url = await api.fileToDataUrl(f)
      setPayment(p=>({...p, slipDataUrl:url }))
    }catch(err){
      setStatus({ error: err.message||'Upload failed', ok:'' })
    }
  }

  function copy(text){
    navigator.clipboard?.writeText(String(text)).then(()=> {
      setStatus({ ok:'Copied to clipboard', error:'' })
      setTimeout(()=> clearStatus(), 800)
    })
  }

  if(!rt) return null

  return (
    <Card bg="dark" text="light" className="mx-auto" style={{maxWidth:960}}>
      <Card.Body>
        <h3 className="mb-1">Book: {rt.name}</h3>
        <div className="text-secondary mb-3">฿{Number(rt.base_price).toLocaleString()} / night</div>

        <ProgressBar now={progress} label={`Step ${step} / 3`} className="mb-3" />

        {status.error ? <Alert variant="danger" onClose={clearStatus} dismissible>{status.error}</Alert> : null}
        {status.ok ? <Alert variant="success" onClose={clearStatus} dismissible>{status.ok}</Alert> : null}

        {step === 1 && (
          <div>
            <h5 className="mb-3">👤 Guest details & stay</h5>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Label>Check-in</Form.Label>
                <Form.Control
                  type="date"
                  value={dates.check_in}
                  min={dayjs().format('YYYY-MM-DD')}
                  onChange={e=> setDates(d=>({...d, check_in:e.target.value}))}
                />
              </div>
              <div className="col-md-6">
                <Form.Label>Check-out</Form.Label>
                <Form.Control
                  type="date"
                  value={dates.check_out}
                  min={dayjs(dates.check_in).add(1,'day').format('YYYY-MM-DD')}
                  onChange={e=> setDates(d=>({...d, check_out:e.target.value}))}
                />
              </div>

              <div className="col-md-4">
                <Form.Label>Adults</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={rt.max_adults || 6}
                  value={party.adults}
                  onChange={e=> setParty(p=>({...p, adults: Math.max(1, Number(e.target.value||1))}))}
                />
              </div>
              <div className="col-md-4">
                <Form.Label>Children</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={rt.max_children || 6}
                  value={party.children}
                  onChange={e=> setParty(p=>({...p, children: Math.max(0, Number(e.target.value||0))}))}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="fw-semibold">Nights: {nights}</div>
              </div>

              <div className="col-md-6">
                <Form.Label>Full name</Form.Label>
                <Form.Control
                  value={guest.full_name}
                  onChange={e=> setGuest(g=>({...g, full_name:e.target.value}))}
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>
              <div className="col-md-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  value={guest.phone}
                  onChange={e=> setGuest(g=>({...g, phone:e.target.value}))}
                  placeholder="เบอร์โทร"
                />
              </div>
              <div className="col-md-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={guest.email}
                  onChange={e=> setGuest(g=>({...g, email:e.target.value}))}
                  placeholder="อีเมล"
                />
              </div>

              <div className="col-12">
                <Form.Label>Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  value={guest.notes}
                  onChange={e=> setGuest(g=>({...g, notes:e.target.value}))}
                  placeholder="คำขอเพิ่มเติม เวลาเช็คอิน ฯลฯ"
                />
              </div>
            </div>

            <hr className="border-secondary my-4" />

            <div className="d-flex justify-content-between align-items-center">
              <div className="fs-5">
                Total: <span className="fw-bold">฿{Number(total).toLocaleString()}</span>
                <span className="text-secondary ms-2">({nights} night{nights>1?'s':''})</span>
              </div>
              <div>
                <Button variant="secondary" className="me-2" onClick={()=> navigate(-1)}>Cancel</Button>
                <Button disabled={!canNextFromStep1()} onClick={()=> setStep(2)}>Next</Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h5 className="mb-3">💳 Payment & upload slip</h5>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Label>Payment method</Form.Label>
                <Form.Select
                  value={payment.method}
                  onChange={e=> setPayment(p=>({...p, method:e.target.value}))}
                >
                  <option value="qr_bank">โอน/สแกน QR (แนะนำ)</option>
                  <option value="bank_transfer">โอนผ่านแอปธนาคาร</option>
                </Form.Select>
              </div>

              <div className="col-md-6">
                <Form.Label>Reference (เช่น เวลาที่โอน / เลขอ้างอิง)</Form.Label>
                <Form.Control
                  placeholder="เช่น 20250928-2030 / REF1234"
                  value={payment.ref}
                  onChange={e=> setPayment(p=>({...p, ref:e.target.value}))}
                />
              </div>

              <div className="col-12">
                <div className="p-3 rounded border border-secondary">
                  <div className="d-flex flex-wrap align-items-center justify-content-between">
                    <div className="me-3">
                      <div className="fw-semibold">{BANK_INFO?.bank_name || 'Bank'}</div>
                      <div>Account name: <span className="fw-semibold">{BANK_INFO?.account_name || '-'}</span></div>
                      <div>Account no.: <span className="fw-semibold">{BANK_INFO?.account_no || '-'}</span></div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-light" onClick={()=> copy(BANK_INFO?.account_name||'')}>Copy name</Button>
                      <Button size="sm" variant="outline-light" onClick={()=> copy(BANK_INFO?.account_no||'')}>Copy number</Button>
                    </div>
                  </div>

                  {BANK_INFO?.promptpay_qr && (
                    <div className="mt-3 d-flex align-items-center gap-3">
                      <img
                        src={BANK_INFO.promptpay_qr}
                        alt="PromptPay QR"
                        style={{ width: 140, height: 140, objectFit:'contain', background:'#fff', borderRadius:8 }}
                      />
                      <div className="text-secondary">
                        สแกน QR เพื่อโอนได้ทันที จากนั้นอัปโหลดสลิปด้านล่าง
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <Form.Label>Upload slip (PNG/JPG/PDF)</Form.Label>
                <Form.Control type="file" accept="image/*,.pdf" onChange={onUploadSlip} />
              </div>

              <div className="col-md-6 d-flex align-items-end">
                {payment.slipDataUrl ? (
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={payment.slipDataUrl}
                      alt="Slip preview"
                      style={{ maxHeight:120, borderRadius:8, border:'1px solid rgba(255,255,255,0.2)' }}
                    />
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={()=> setPayment(p=>({...p, slipDataUrl:''}))}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-secondary">ยังไม่ได้อัปโหลดสลิป</div>
                )}
              </div>
            </div>

            <hr className="border-secondary my-4" />

            <div className="d-flex justify-content-between align-items-center">
              <div className="fs-5">
                Total: <span className="fw-bold">฿{Number(total).toLocaleString()}</span>
              </div>
              <div>
                <Button variant="outline-light" className="me-2" onClick={()=> setStep(1)}>Back</Button>
                <Button disabled={!canNextFromStep2()} onClick={()=> setStep(3)}>Next</Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h5 className="mb-3">✅ Review & confirm</h5>

            <div className="row g-3">
              <div className="col-md-6">
                <Card bg="secondary" text="light">
                  <Card.Body>
                    <div className="fw-semibold mb-2">Stay</div>
                    <div>Room type: <span className="fw-semibold">{rt.name}</span></div>
                    <div>Check-in: {dates.check_in}</div>
                    <div>Check-out: {dates.check_out}</div>
                    <div>Night(s): {nights}</div>
                    <div>Guests: {party.adults} adult(s){party.children?`, ${party.children} child(ren)`:''}</div>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-6">
                <Card bg="secondary" text="light">
                  <Card.Body>
                    <div className="fw-semibold mb-2">Guest</div>
                    <div>{guest.full_name}</div>
                    <div>{guest.phone}</div>
                    <div>{guest.email}</div>
                    {guest.notes ? <div className="mt-2 text-light">{guest.notes}</div> : null}
                  </Card.Body>
                </Card>
              </div>

              <div className="col-12">
                <Card bg="secondary" text="light">
                  <Card.Body className="d-flex flex-wrap align-items-center justify-content-between">
                    <div className="mb-2 mb-md-0">
                      <div className="fw-semibold">Payment</div>
                      <div>Method: {payment.method === 'qr_bank' ? 'โอน/QR' : 'โอนผ่านธนาคาร'}</div>
                      <div>Ref: {payment.ref || '-'}</div>
                    </div>
                    <div className="fs-4">
                      Total: <span className="fw-bold">฿{Number(total).toLocaleString()}</span>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {payment.slipDataUrl ? (
                <div className="col-12">
                  <div className="text-secondary mb-2">Slip preview</div>
                  <img
                    src={payment.slipDataUrl}
                    alt="Slip preview"
                    style={{ maxHeight:200, borderRadius:8, border:'1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>
              ) : null}
            </div>

            <hr className="border-secondary my-4" />

            <div className="d-flex justify-content-between align-items-center">
              <Button variant="outline-light" onClick={()=> setStep(2)}>Back</Button>
              <div className="d-flex align-items-center gap-2">
                <div className="fs-5 me-2">
                  Total: <span className="fw-bold">฿{Number(total).toLocaleString()}</span>
                </div>
                <Button disabled={loading} onClick={onConfirm}>
                  {loading ? 'Saving...' : 'Confirm booking'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
