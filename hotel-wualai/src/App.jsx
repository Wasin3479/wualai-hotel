import React, { useState, useEffect } from 'react';
import { Calendar, Users, Star, Wifi, MapPin, Phone, Mail, CheckCircle, Eye, EyeOff, Clock, Award, Images, Copy } from 'lucide-react';
import './ss.css'
// const API_BASE_URL = 'http://localhost:3034/api/v1';
// const API_BASEIMAGES_URL = 'http://localhost:3034';
const API_BASE_URL = 'https://api.wasin-jira.com/api/v1';
const API_BASEIMAGES_URL = 'https://api.wasin-jira.com';

// const apiClient = {
const apiClient = {
  async request(endpoint, options = {}) {
    const token = sessionStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'การร้องขอล้มเหลว');
    }
    return response.json();
  },
  get(endpoint) { return this.request(endpoint); },
  post(endpoint, data) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); },
  patch(endpoint, data) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); },
  async uploadFile(endpoint, file) {
    const token = sessionStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
      body: formData,
    });
    if (!response.ok) throw new Error('อัปโหลดไฟล์ล้มเหลว');
    return response.json();
  },
};

function getRoomImages(room) {
  if (Array.isArray(room?.images_json)) return room.images_json.filter(Boolean);
  if (Array.isArray(room?.images)) return room.images.filter(Boolean);
  if (typeof room?.images === 'string') return room.images.split(',').map(s => s.trim()).filter(Boolean);
  if (typeof room?.image === 'string' && room.image) return [room.image];
  return [];
}

function BankAccountsPanel({ accounts = [] }) {
  const [copiedKey, setCopiedKey] = React.useState(null);
  const onCopy = async (key, text) => {
    try { await navigator.clipboard.writeText(text); } catch { }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };
  if (!accounts.length) return null;

  return (
    <div className="alert p-3 mb-4"
      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
      <div className="d-flex align-items-center mb-2">
        <strong className="me-2" style={{ color: '#334155' }}>โอนผ่านบัญชีธนาคาร</strong>
        <span className="badge bg-primary" style={{ borderRadius: 8 }}>
          แนะนำให้โอนเข้าบัญชีที่มีป้าย “แนะนำ”
        </span>
      </div>

      <div className="d-flex flex-column gap-2">
        {accounts.map(a => {
          const isDefault = Number(a.is_default) === 1;
          return (
            <div key={a.id}
              className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-2"
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10 }}>
              <div>
                <div className="d-flex align-items-center gap-2">
                  {isDefault && <span className="badge bg-success" style={{ borderRadius: 8 }}>แนะนำ</span>}
                  <strong className="me-2">{a.bank_name || a.bank_code?.toUpperCase()}</strong>
                  <span className="text-muted">({a.bank_code})</span>
                </div>
                <div className="mt-1 small text-muted">
                  ชื่อบัญชี: <span className="text-dark fw-semibold">{a.account_name}</span>
                </div>
                <div className="small text-muted">
                  เลขที่บัญชี: <span className="text-dark fw-semibold">{a.account_number}</span>
                </div>
              </div>

              <div className="mt-2 mt-md-0 d-flex gap-2">
                <button type="button" className="btn btn-sm"
                  style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 10, fontWeight: 600 }}
                  onClick={() => onCopy(`accno-${a.id}`, a.account_number)}>
                  <Copy size={16} className="me-1" />
                  {copiedKey === `accno-${a.id}` ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}
                </button>
                <button type="button" className="btn btn-sm"
                  style={{ background: '#ecfeff', color: '#0ea5e9', borderRadius: 10, fontWeight: 600 }}
                  onClick={() => onCopy(`accname-${a.id}`, a.account_name)}>
                  <Copy size={16} className="me-1" />
                  {copiedKey === `accname-${a.id}` ? 'คัดลอกแล้ว' : 'คัดลอกชื่อบัญชี'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 small text-muted">
        หลังโอนสำเร็จ โปรดอัปโหลดสลิปเพื่อยืนยันการชำระเงิน
      </div>
    </div>
  );
}


const HotelBookingApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [bookingData, setBookingData] = useState({ checkIn: '', checkOut: '', guests: 2, children: 0 });
  const [guestInfo, setGuestInfo] = useState({ fullName: '', email: '', phone: '', specialRequests: '' });
  const [showModal, setShowModal] = useState(false);
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [confirmationBookingNo, setConfirmationBookingNo] = useState('');

  const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200';

  function toAbsUrl(src) {
    if (!src) return PLACEHOLDER_IMG;
    return src.startsWith('http') ? src : `${API_BASEIMAGES_URL}${src}`;
  }

  function money(n) {
    return Number(n || 0).toLocaleString('th-TH');
  }

  function getRoomImages(room) {
    if (Array.isArray(room?.images)) return room.images.filter(Boolean);
    if (Array.isArray(room?.images_json)) return room.images_json.filter(Boolean);
    if (typeof room?.images === 'string') return room.images.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof room?.image === 'string' && room.image) return [room.image];
    return [];
  }

  const [detailRoom, setDetailRoom] = useState(null);
  const [showRoomDetail, setShowRoomDetail] = useState(false);


  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await apiClient.get('/auth/me');
          setUser(userData);
        } catch (err) {
          sessionStorage.removeItem('authToken');
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const data = await apiClient.get('/room-types');
        setRoomTypes(data);
      } catch (err) {
        console.error('Failed to fetch room types:', err);
      }
    };
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    if (user && currentPage === 'dashboard') {
      const fetchBookings = async () => {
        try {
          setLoading(true);
          const data = await apiClient.get('/bookings');
          setBookings(data);
        } catch (err) {
          setError('ไม่สามารถโหลดข้อมูลการจองได้');
        } finally {
          setLoading(false);
        }
      };
      fetchBookings();
    }
  }, [user, currentPage]);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = d => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setBookingData(prev => ({
      ...prev,
      checkIn: iso(today),
      checkOut: iso(tomorrow)
    }));
  }, []);

  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const diffTime = Math.max(0, checkOut - checkIn);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const openRoomDetail = async (room) => {
    try {
      setShowRoomDetail(true);
    } catch (e) {
      setDetailRoom(room);
      setShowRoomDetail(true);
    }
  };

  const Navigation = () => (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <button className="navbar-brand btn btn-link text-white text-decoration-none d-flex align-items-center" onClick={() => setCurrentPage('home')}>
          <Award size={28} className="me-2" />
          <strong style={{ fontSize: '1.5rem' }}>WUALAI HOTEL</strong>
        </button>
        <div className="navbar-nav ms-auto d-flex flex-row gap-3 align-items-center">
          <button className="btn btn-link text-white text-decoration-none" onClick={() => setCurrentPage('rooms')}>ห้องพัก</button>
          {user ? (
            <>
              <button className="btn btn-link text-white text-decoration-none" onClick={() => setCurrentPage('dashboard')}>การจองของฉัน</button>
              <span className="text-white px-3 py-1 rounded" style={{ background: 'rgba(255,255,255,0.2)' }}>{user.full_name || user.name}</span>
              <button className="btn btn-light" style={{ borderRadius: '20px', padding: '8px 20px' }} onClick={async () => {
                try { await apiClient.post('/auth/logout'); } catch (err) { console.error('Logout error:', err); } finally {
                  sessionStorage.removeItem('authToken');
                  setUser(null);
                  setCurrentPage('home');
                }
              }}>ออกจากระบบ</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline-light" style={{ borderRadius: '20px', padding: '8px 20px' }} onClick={() => setCurrentPage('login')}>เข้าสู่ระบบ</button>
              <button className="btn btn-light" style={{ borderRadius: '20px', padding: '8px 20px' }} onClick={() => setCurrentPage('register')}>สมัครสมาชิก</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  const HomePage = () => {
    const [slides, setSlides] = useState([]);
    const [active, setActive] = useState(0);

    useEffect(() => {
      let alive = true;
      apiClient
        .get('/home-slides')
        .then((data) => {
          const list = (Array.isArray(data) ? data : [])
            .filter((s) => s.is_active)
            .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
          if (alive) setSlides(list);
        })
        .catch((err) => console.error('home-slides error:', err));
      return () => {
        alive = false;
      };
    }, []);

    useEffect(() => {
      if (!slides.length) return;
      const t = setInterval(() => setActive((i) => (i + 1) % slides.length), 5000);
      return () => clearInterval(t);
    }, [slides.length]);

    const goPrev = () => slides.length && setActive((i) => (i - 1 + slides.length) % slides.length);
    const goNext = () => slides.length && setActive((i) => (i + 1) % slides.length);

    const current = slides[active];
    const heroImg = current?.image_path ? toAbsUrl(current.image_path)
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200';

    return (
      <div>
        <div className="text-white py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '500px' }}>
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <h1 className="display-3 fw-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  ยินดีต้อนรับสู่<br />WUALAI HOTEL
                </h1>
                <p className="lead fs-4 mb-4">สัมผัสประสบการณ์พักผ่อนสุดหรู ใจกลางเมืองเชียงใหม่</p>
                <button
                  className="btn btn-light btn-lg px-5 py-3"
                  style={{ borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem' }}
                  onClick={() => setCurrentPage('rooms')}
                >
                  จองห้องพักเลย
                </button>
              </div>

              <div className="col-lg-6">
                <div className="position-relative rounded shadow-lg overflow-hidden" style={{ borderRadius: 20 }}>
                  <img
                    key={active}
                    src={heroImg}
                    className="img-fluid w-100"
                    alt="Hotel"
                    style={{ height: 380, objectFit: 'cover', display: 'block', transition: 'opacity .3s ease' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200';
                    }}
                  />

                  {slides.length > 1 && (
                    <>
                      <button
                        className="btn position-absolute top-50 start-0 translate-middle-y"
                        onClick={goPrev}
                        aria-label="Previous slide"
                        style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: 40, height: 40 }}
                      >
                        ‹
                      </button>
                      <button
                        className="btn position-absolute top-50 end-0 translate-middle-y"
                        onClick={goNext}
                        aria-label="Next slide"
                        style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: 40, height: 40 }}
                      >
                        ›
                      </button>

                      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
                        {slides.map((_, i) => (
                          <span
                            key={i}
                            onClick={() => setActive(i)}
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: i === active ? '#fff' : 'rgba(255,255,255,0.5)',
                              cursor: 'pointer',
                              display: 'inline-block',
                            }}
                            aria-label={`slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop: '-80px', marginBottom: '60px' }}>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card shadow-lg" style={{ borderRadius: '20px', border: 'none' }}>
                <div className="card-body p-4">
                  <h3 className="text-center mb-4" style={{ color: '#667eea', fontWeight: 'bold' }}>ค้นหาห้องพักที่เหมาะกับคุณ</h3>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label fw-bold">วันเช็คอิน</label>
                      <input type="date" className="form-control" style={{ borderRadius: '10px', padding: '12px' }}
                        value={bookingData.checkIn} onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-bold">วันเช็คเอาท์</label>
                      <input type="date" className="form-control" style={{ borderRadius: '10px', padding: '12px' }}
                        value={bookingData.checkOut} onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-bold">จำนวนผู้เข้าพัก</label>
                      <select className="form-select" style={{ borderRadius: '10px', padding: '12px' }}
                        value={bookingData.guests} onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}>
                        {[1, 2, 3, 4, 5, 6].map(num => (<option key={num} value={num}>{num} ท่าน</option>))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">&nbsp;</label>
                      <button className="btn w-100"
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px', padding: '12px', fontWeight: 'bold' }}
                        onClick={() => setCurrentPage('rooms')}>
                        ค้นหาห้องพัก
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-5" style={{ background: '#f8f9fa' }}>
          <div className="container">
            <h2 className="text-center mb-5 fw-bold" style={{ color: '#667eea', fontSize: '2.5rem' }}>ทำไมต้องเลือกเรา</h2>
            <div className="row">
              <div className="col-md-4 text-center mb-4">
                <div className="p-4 bg-white rounded shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="mb-3" style={{ color: '#667eea' }}><MapPin size={64} /></div>
                  <h4 className="fw-bold mb-3">ทำเลศักยภาพสูง</h4>
                  <p className="text-muted">ตั้งอยู่ในใจกลางเมือง เดินทางสะดวก ใกล้แหล่งท่องเที่ยวชั้นนำ</p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className="p-4 bg-white rounded shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="mb-3" style={{ color: '#667eea' }}><Star size={64} /></div>
                  <h4 className="fw-bold mb-3">บริการระดับ 5 ดาว</h4>
                  <p className="text-muted">บริการด้วยใจ ใส่ใจทุกรายละเอียด พร้อมดูแลคุณตลอด 24 ชั่วโมง</p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className="p-4 bg-white rounded shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="mb-3" style={{ color: '#667eea' }}><Wifi size={64} /></div>
                  <h4 className="fw-bold mb-3">สิ่งอำนวยความสะดวก</h4>
                  <p className="text-muted">ห้องพักทันสมัย Wi-Fi ความเร็วสูง พร้อมสิ่งอำนวยความสะดวกครบครัน</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const RoomsPage = () => {
    const RoomCard = ({ room }) => {
      const images = getRoomImages(room);
      const [activeIdx, setActiveIdx] = useState(0);

      const mainSrc = images.length ? images[activeIdx] : null;
      const amenities = Array.isArray(room.amenities) && room.amenities.length
        ? room.amenities
        : ['Wi-Fi ฟรี', 'แอร์', 'ทีวี', 'อาหารเช้า']; // fallback เผื่อ API ว่าง

      const basePrice = Number(room.base_price || 0);
      const originalPrice = room.original_price ? Number(room.original_price) : null;
      const showStrike = originalPrice && originalPrice > basePrice;
      const discountPct = showStrike
        ? Math.max(0, Math.round((1 - basePrice / originalPrice) * 100))
        : 0;

      const goPrev = (e) => {
        e.stopPropagation();
        if (!images.length) return;
        setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
      };
      const goNext = (e) => {
        e.stopPropagation();
        if (!images.length) return;
        setActiveIdx((prev) => (prev + 1) % images.length);
      };

      return (
        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card h-100 shadow-sm" style={{ borderRadius: 20, border: 'none', overflow: 'hidden' }}>
            <div className="position-relative" onClick={() => openRoomDetail(room)} role="button">
              <img
                src={toAbsUrl(mainSrc)}
                className="card-img-top"
                alt={room.name}
                style={{ height: 250, objectFit: 'cover' }}
              />

              {images.length > 1 && (
                <>
                  <button
                    className="btn position-absolute top-50 start-0 translate-middle-y"
                    onClick={goPrev}
                    aria-label="Previous image"
                    style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: 36, height: 36 }}
                  >‹</button>
                  <button
                    className="btn position-absolute top-50 end-0 translate-middle-y"
                    onClick={goNext}
                    aria-label="Next image"
                    style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: 36, height: 36 }}
                  >›</button>
                </>
              )}

              {showStrike && (
                <div className="position-absolute top-0 end-0 m-3">
                  <span className="badge bg-danger px-3 py-2" style={{ borderRadius: 10, fontSize: '0.9rem' }}>
                    ลด {discountPct}%
                  </span>
                </div>
              )}

              <div className="position-absolute bottom-0 end-0 m-3 d-flex align-items-center px-2 py-1 bg-dark bg-opacity-50 text-white rounded-3">
                <Images size={16} className="me-1" />
                <small>{images.length || 1} รูป</small>
              </div>
            </div>

            <div className="card-body d-flex flex-column p-4">
              <h5 className="card-title fw-bold mb-2" style={{ color: '#667eea' }}>{room.name}</h5>
              <p className="card-text text-muted mb-3" style={{ minHeight: 54, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {room.description}
              </p>

              {images.length > 1 && (
                <div className="d-flex gap-2 mb-3" style={{ overflowX: 'auto' }}>
                  {images.slice(0, 8).map((img, idx) => {
                    const isActive = idx === activeIdx;
                    return (
                      <button
                        key={idx}
                        className="p-0 border-0 bg-transparent"
                        onClick={() => setActiveIdx(idx)}
                        aria-label={`เลือกภาพที่ ${idx + 1}`}
                      >
                        <img
                          src={toAbsUrl(img)}
                          alt=""
                          style={{
                            width: 60, height: 60, objectFit: 'cover', borderRadius: 10,
                            border: isActive ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                            outline: isActive ? '3px solid #e0e7ff' : 'none'
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mb-3">
                <small className="text-muted d-flex align-items-center">
                  <Users size={16} className="me-2" />รองรับได้สูงสุด {room.capacity} ท่าน
                </small>
              </div>

              <div className="mb-4">
                {amenities.map((amenity, i) => (
                  <span key={`${amenity}-${i}`} className="badge me-2 mb-2" style={{ background: '#f0f0f0', color: '#333', borderRadius: 10, padding: '8px 12px' }}>
                    {amenity}
                  </span>
                ))}
              </div>

              <div className="mt-auto">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    {showStrike ? (
                      <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.9rem' }}>
                        ฿{money(originalPrice)}
                      </span>
                    ) : <span className="text-muted" style={{ fontSize: '0.9rem' }}>&nbsp;</span>}
                    <div className="d-flex align-items-baseline">
                      <span className="h3 fw-bold mb-0" style={{ color: '#667eea' }}>฿{money(basePrice)}</span>
                      <small className="text-muted ms-2">/คืน</small>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn flex-fill"
                    style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 12, padding: 12, fontWeight: 'bold' }}
                    onClick={() => openRoomDetail(room)}
                  >
                    ดูรายละเอียด
                  </button>
                  <button
                    className="btn flex-fill"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 12, padding: 12, fontWeight: 'bold' }}
                    onClick={() => {
                      if (!user) { setCurrentPage('login'); return; }
                      setSelectedRoom(room);
                      setGuestInfo({
                        fullName: user?.full_name || user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        specialRequests: ''
                      });
                      setCurrentPage('booking');
                    }}
                  >
                    จองเลย
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="container py-5">
        <h2 className="text-center mb-5 fw-bold" style={{ color: '#667eea', fontSize: '2.5rem' }}>ห้องพักของเรา</h2>
        {roomTypes.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {roomTypes.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    );
  };



  const LoginPage = () => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const handleLogin = async (e) => {
      e.preventDefault();
      setLoginError('');
      setLoading(true);
      try {
        const response = await apiClient.post('/auth/login', loginData);
        sessionStorage.setItem('authToken', response.token);
        setUser(response.user);
        setCurrentPage('home');
      } catch (err) {
        setLoginError(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
      } finally {
        setLoading(false);
      }
    };
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg" style={{ borderRadius: '20px', border: 'none' }}>
              <div className="card-body p-5">
                <h3 className="text-center mb-4 fw-bold" style={{ color: '#667eea' }}>เข้าสู่ระบบ</h3>
                {loginError && (<div className="alert alert-danger" style={{ borderRadius: '12px' }}>{loginError}</div>)}
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="form-label fw-bold">อีเมล</label>
                    <input type="email" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} placeholder="example@email.com" value={loginData.email} onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold">รหัสผ่าน</label>
                    <div className="position-relative">
                      <input type={showPassword ? "text" : "password"} className="form-control" style={{ borderRadius: '12px', padding: '12px', paddingRight: '50px' }} placeholder="••••••••" value={loginData.password} onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))} required />
                      <button type="button" className="btn position-absolute end-0 top-50 translate-middle-y" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none' }}>
                        {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn w-100 mb-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px', padding: '12px', fontWeight: 'bold' }} disabled={loading}>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
                </form>
                <div className="text-center"><span className="text-muted">ยังไม่มีบัญชี? </span><button className="btn btn-link p-0" style={{ color: '#667eea', fontWeight: 'bold' }} onClick={() => setCurrentPage('register')}>สมัครสมาชิก</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RegisterPage = () => {
    const [registerData, setRegisterData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [registerError, setRegisterError] = useState('');
    const handleRegister = async (e) => {
      e.preventDefault();
      setRegisterError('');
      if (registerData.password !== registerData.confirmPassword) { setRegisterError('รหัสผ่านไม่ตรงกัน'); return; }
      setLoading(true);
      try {
        const response = await apiClient.post('/auth/register', { full_name: registerData.fullName, email: registerData.email, phone: registerData.phone, password: registerData.password });
        sessionStorage.setItem('authToken', response.token);
        setUser(response.user);
        setCurrentPage('home');
      } catch (err) {
        setRegisterError(err.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg" style={{ borderRadius: '20px', border: 'none' }}>
              <div className="card-body p-5">
                <h3 className="text-center mb-4 fw-bold" style={{ color: '#667eea' }}>สมัครสมาชิก</h3>
                {registerError && (<div className="alert alert-danger" style={{ borderRadius: '12px' }}>{registerError}</div>)}
                <form onSubmit={handleRegister}>
                  <div className="mb-3"><label className="form-label fw-bold">ชื่อ-นามสกุล</label><input type="text" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} placeholder="กรุณากรอกชื่อ-นามสกุล" value={registerData.fullName} onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))} required /></div>
                  <div className="mb-3"><label className="form-label fw-bold">อีเมล</label><input type="email" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} placeholder="example@email.com" value={registerData.email} onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))} required /></div>
                  <div className="mb-3"><label className="form-label fw-bold">เบอร์โทรศัพท์</label><input type="tel" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} placeholder="0812345678" value={registerData.phone} onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))} required /></div>
                  <div className="mb-3"><label className="form-label fw-bold">รหัสผ่าน</label><input type="password" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} placeholder="••••••••" value={registerData.password} onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))} required /></div>
                  <div className="mb-4"><label className="form-label fw-bold">ยืนยันรหัสผ่าน</label><input type="password" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} placeholder="••••••••" value={registerData.confirmPassword} onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))} required /></div>
                  <button type="submit" className="btn w-100 mb-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px', padding: '12px', fontWeight: 'bold' }} disabled={loading}>{loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}</button>
                </form>
                <div className="text-center"><span className="text-muted">มีบัญชีอยู่แล้ว? </span><button className="btn btn-link p-0" style={{ color: '#667eea', fontWeight: 'bold' }} onClick={() => setCurrentPage('login')}>เข้าสู่ระบบ</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BookingPage = () => {
    const nights = calculateNights();
    const totalAmount = selectedRoom ? (selectedRoom.base_price || 0) * nights : 0;
    const [bookingError, setBookingError] = useState('');
    const [bankAccounts, setBankAccounts] = useState([]);


    useEffect(() => {
      let alive = true;
      (async () => {
        try {
          const data = await apiClient.get('/bacnkaccount');
          const list = (Array.isArray(data) ? data : [])
            .filter(a => Number(a.is_active) === 1)
            .sort((a, b) =>
              (Number(b.is_default) - Number(a.is_default)) ||
              ((a.sort_order ?? 999) - (b.sort_order ?? 999)) ||
              (a.id - b.id)
            );
          if (alive) setBankAccounts(list);
        } catch (e) {
          console.error('load bank accounts error:', e);
          if (alive) setBankAccounts([]);
        }
      })();
      return () => { alive = false; };
    }, []);

    const handleBooking = async (e) => {
      e.preventDefault();
      setBookingError('');
      setLoading(true);
      try {
        const bookingResponse = await apiClient.post('/bookings', {
          room_type_id: selectedRoom.id,
          check_in_date: bookingData.checkIn,
          check_out_date: bookingData.checkOut,
          adults: bookingData.guests,
          children: bookingData.children,
          guest_info: { full_name: guestInfo.fullName, email: guestInfo.email, phone: guestInfo.phone },
          remarks: guestInfo.specialRequests
        });
        if (paymentSlip) { await apiClient.uploadFile(`/payments?booking_id=${bookingResponse.id}`, paymentSlip); }
        setConfirmationBookingNo(bookingResponse.booking_no);
        setShowModal(true);
      } catch (err) {
        setBookingError(err.message || 'การจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };
    if (!selectedRoom) {
      return (
        <div className="container py-5">
          <div className="alert alert-warning" style={{ borderRadius: '15px' }}>
            กรุณาเลือกห้องพักก่อน <button className="btn btn-link" onClick={() => setCurrentPage('rooms')}>ไปที่หน้าห้องพัก</button>
          </div>
        </div>
      );
    }
    return (
      <div className="container py-5">
        <h2 className="mb-3 fw-bold" style={{ color: '#667eea' }}>กรอกข้อมูลการจอง</h2>

        {bookingError && (<div className="alert alert-danger" style={{ borderRadius: '15px' }}>{bookingError}</div>)}
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm" style={{ borderRadius: '20px', border: 'none' }}>
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-4" style={{ color: '#667eea' }}>ข้อมูลผู้เข้าพัก</h5>
                <form onSubmit={handleBooking}>
                  <div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label fw-bold">ชื่อ-นามสกุล</label><input type="text" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} value={guestInfo.fullName} onChange={(e) => setGuestInfo(prev => ({ ...prev, fullName: e.target.value }))} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label fw-bold">อีเมล</label><input type="email" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} value={guestInfo.email} onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label fw-bold">เบอร์โทรศัพท์</label><input type="tel" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} value={guestInfo.phone} onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label fw-bold">จำนวนผู้เข้าพัก</label><select className="form-select" style={{ borderRadius: '12px', padding: '12px' }} value={bookingData.guests} onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}>
                      {Array.from({ length: selectedRoom.capacity }, (_, i) => i + 1).map(num => (<option key={num} value={num}>{num} ท่าน</option>))}
                    </select></div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">วันเช็คอิน</label>
                      <input type="date" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} value={bookingData.checkIn} onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">วันเช็คเอาท์</label>
                      <input type="date" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} value={bookingData.checkOut} onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))} />
                    </div>
                  </div>
                  <div className="mb-3"><label className="form-label fw-bold">คำขอพิเศษ (ถ้ามี)</label><textarea className="form-control" style={{ borderRadius: '12px', padding: '12px' }} rows="3" placeholder="เช่น ต้องการห้องชั้นสูง, ต้องการเตียงเสริม" value={guestInfo.specialRequests} onChange={(e) => setGuestInfo(prev => ({ ...prev, specialRequests: e.target.value }))} /></div>
                  <BankAccountsPanel accounts={bankAccounts} />

                  {bookingError && (
                    <div className="alert alert-danger" style={{ borderRadius: '15px' }}>{bookingError}</div>
                  )}
                  <div className="mb-4">
                    <label className="form-label fw-bold">อัปโหลดสลิปการชำระเงิน</label>
                    <input type="file" className="form-control" style={{ borderRadius: '12px', padding: '12px' }} accept="image/*" onChange={(e) => setPaymentSlip(e.target.files[0])} />
                    {paymentSlip && (<small className="text-success d-flex align-items-center mt-2"><CheckCircle size={14} className="me-1" />อัปโหลด {paymentSlip.name} สำเร็จ</small>)}
                  </div>
                  <button type="submit" className="btn btn-lg w-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px', padding: '15px', fontWeight: 'bold' }} disabled={loading}>{loading ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}</button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card shadow-sm" style={{ borderRadius: '20px', border: 'none', position: 'sticky', top: '100px' }}>
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-3" style={{ color: '#667eea' }}>สรุปการจอง</h5>
                <div className="mb-3">
                  <img src={`${API_BASEIMAGES_URL}${getRoomImages(selectedRoom)[0]}`} className="img-fluid rounded mb-3" style={{ borderRadius: '15px !important' }} alt={selectedRoom.name} />
                  <h6 className="fw-bold">{selectedRoom.name}</h6>
                  <small className="text-muted">{selectedRoom.description}</small>
                </div>
                <hr />
                <div className="mb-2 d-flex justify-content-between"><span className="text-muted">วันเช็คอิน:</span><span className="fw-bold">{bookingData.checkIn}</span></div>
                <div className="mb-2 d-flex justify-content-between"><span className="text-muted">วันเช็คเอาท์:</span><span className="fw-bold">{bookingData.checkOut}</span></div>
                <div className="mb-2 d-flex justify-content-between"><span className="text-muted">จำนวนคืน:</span><span className="fw-bold">{nights} คืน</span></div>
                <div className="mb-3 d-flex justify-content-between"><span className="text-muted">จำนวนผู้เข้าพัก:</span><span className="fw-bold">{bookingData.guests} ท่าน</span></div>
                <hr />
                <div className="d-flex justify-content-between align-items-center"><strong style={{ fontSize: '1.1rem' }}>ราคารวมทั้งหมด:</strong><strong className="h4 mb-0" style={{ color: '#667eea' }}>฿{totalAmount.toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DashboardPage = () => {
    if (loading) { return (<div className="container py-5 text-center"><div className="spinner-border" style={{ width: '3rem', height: '3rem', color: '#667eea' }} role="status"><span className="visually-hidden">กำลังโหลด...</span></div></div>); }
    if (error) { return (<div className="container py-5"><div className="alert alert-danger" style={{ borderRadius: '15px' }}>{error}</div></div>); }
    return (
      <div className="container py-5">
        <h2 className="mb-4 fw-bold" style={{ color: '#667eea' }}>การจองของฉัน</h2>
        {bookings.length === 0 ? (
          <div className="alert alert-info" style={{ borderRadius: '15px' }}>คุณยังไม่มีการจองห้องพัก <button className="btn btn-link" onClick={() => setCurrentPage('rooms')}>เริ่มจองห้องพัก</button></div>
        ) : (
          <div className="row">
            {bookings.map(booking => (
              <div key={booking.id} className="col-12 mb-3">
                <div className="card shadow-sm" style={{ borderRadius: '20px', border: 'none' }}>
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h5 className="fw-bold mb-2" style={{ color: '#667eea' }}>{booking.room_type_name || booking.roomType}</h5>
                        <p className="text-muted mb-2"><strong>หมายเลขการจอง:</strong> {booking.booking_no}</p>
                        <p className="mb-2 d-flex align-items-center"><Calendar size={16} className="me-2" style={{ color: '#667eea' }} />{booking.check_in_date} ถึง {booking.check_out_date} ({booking.nights} คืน)</p>
                        <span className={`badge px-3 py-2`} style={{ borderRadius: '10px', background: booking.status === 'confirmed' ? '#10b981' : booking.status === 'pending' ? '#f59e0b' : booking.status === 'checked_in' ? '#3b82f6' : booking.status === 'checked_out' ? '#6b7280' : '#ef4444', color: 'white' }}>
                          {booking.status === 'confirmed' ? 'ยืนยันแล้ว' : booking.status === 'pending' ? 'รอดำเนินการ' : booking.status === 'checked_in' ? 'เช็คอินแล้ว' : booking.status === 'checked_out' ? 'เช็คเอาท์แล้ว' : booking.status}
                        </span>
                      </div>
                      <div className="col-md-4 text-end mt-3 mt-md-0">
                        <h4 className="mb-3" style={{ color: '#667eea' }}>฿{booking.total_amount.toLocaleString()}</h4>
                        <button className="btn" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px', padding: '10px 20px' }} onClick={async () => {
                          try { const details = await apiClient.get(`/bookings/${booking.id}`); setSelectedBooking(details); setShowBookingDetail(true); } catch (err) { alert('ไม่สามารถโหลดรายละเอียดการจองได้'); }
                        }}>ดูรายละเอียด</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const BookingDetailModal = () => {
    if (!selectedBooking) return null;

    const money = (n) => Number(n || 0).toLocaleString('th-TH');

    return (
      <>
        <style>{`
        @page { size: A4; margin: 20mm; }
        @media print {
          html, body { height: auto !important; }
          /* ซ่อนทุกอย่าง */
          body * { visibility: hidden !important; }

          /* แสดงเฉพาะส่วนที่จะพิมพ์ */
          #print-booking, #print-booking * { visibility: visible !important; }

          /* อย่าใช้ fixed เพื่อไม่ให้ซ้ำหลายหน้า */
          #print-booking {
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11pt !important;
          }

          /* ลดระยะ table ให้พอดีหน้า */
          #print-booking .table { font-size: 11pt !important; margin-bottom: 0 !important; }
          #print-booking .table td, 
          #print-booking .table th { padding: 6px 8px !important; }

          /* ปิดองค์ประกอบ modal ที่ไม่ต้องพิมพ์ */
          .modal, .modal-dialog, .modal-content {
            position: static !important;
            transform: none !important;
            inset: auto !important;
            width: auto !important;
            max-width: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          .modal-backdrop, .btn-close, .modal-footer, .d-print-none { display: none !important; }
          
        }
      `}</style>

        <div className={`modal fade ${showBookingDetail ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: '20px', border: 'none' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ color: '#667eea' }}>รายละเอียดการจอง</h5>
                <button type="button" className="btn-close" onClick={() => { setShowBookingDetail(false); setSelectedBooking(null); }}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row">
                  <div id="print-booking" className="col-md-6 mb-4">
                    <div className="d-none d-print-block mb-3">
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>WUALAI HOTEL</div>
                      <div style={{ fontSize: '0.95rem' }}>
                        1/1 ซอย 5 ถนนวัวลาย ต.หายยา อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50100
                      </div>
                      <hr />
                    </div>

                    <h6 className="fw-bold mb-3" style={{ color: '#667eea' }}>ข้อมูลการจอง</h6>
                    <table className="table table-borderless">
                      <tbody>
                        <tr><td className="text-muted">หมายเลขการจอง:</td><td className="fw-bold">{selectedBooking.booking_no}</td></tr>
                        <tr><td className="text-muted">ประเภทห้อง:</td><td className="fw-bold">{selectedBooking.room_type_name || selectedBooking.roomType}</td></tr>
                        <tr><td className="text-muted">วันเช็คอิน:</td><td className="fw-bold">{new Date(selectedBooking.check_in_date || selectedBooking.checkIn).toLocaleDateString('th-TH')}</td></tr>
                        <tr><td className="text-muted">วันเช็คเอาท์:</td><td className="fw-bold">{new Date(selectedBooking.check_out_date || selectedBooking.checkOut).toLocaleDateString('th-TH')}</td></tr>
                        <tr><td className="text-muted">จำนวนคืน:</td><td className="fw-bold">{selectedBooking.nights} คืน</td></tr>
                        <tr><td className="text-muted">จำนวนผู้เข้าพัก:</td><td className="fw-bold">{selectedBooking.adults || selectedBooking.guests} ท่าน</td></tr>
                        <tr><td className="text-muted">สถานะ:</td>
                          <td className="fw-bold">
                            {selectedBooking.status === 'confirmed'
                              ? 'ยืนยันแล้ว'
                              : selectedBooking.status === 'pending'
                                ? 'รอดำเนินการ'
                                : selectedBooking.status === 'checked_in'
                                  ? 'เช็คอินแล้ว'
                                  : selectedBooking.status === 'checked_out'
                                    ? 'เช็คเอาท์แล้ว'
                                    : selectedBooking.status}
                          </td>
                        </tr>
                        <tr><td className="text-muted">ยอดรวมทั้งหมด:</td><td className="fw-bold">฿{money(selectedBooking.total_amount || selectedBooking.totalAmount)}</td></tr>
                        <tr><td className="text-muted">นโยบายเวลา:</td><td className="fw-bold">เช็คอิน 14:00 น. • เช็คเอาท์ 12:00 น.</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-md-6 d-print-none">
                    <h6 className="fw-bold mb-3" style={{ color: '#667eea' }}>ข้อมูลการชำระเงิน</h6>
                    <table className="table table-borderless">
                      <tbody>
                        <tr><td className="text-muted">ยอดรวมทั้งหมด:</td><td className="fw-bold" style={{ color: '#667eea', fontSize: '1.2rem' }}>฿{money(selectedBooking.total_amount || selectedBooking.totalAmount)}</td></tr>
                        <tr><td className="text-muted">สถานะการชำระเงิน:</td><td><span className="badge bg-success px-3 py-2" style={{ borderRadius: '10px' }}>ชำระแล้ว</span></td></tr>
                      </tbody>
                    </table>
                    <div className="alert" style={{ background: '#eff6ff', border: 'none', borderRadius: '12px' }} role="alert">
                      <h6 className="fw-bold mb-2 d-flex align-items-center" style={{ color: '#667eea' }}><Clock size={18} className="me-2" />เวลาเช็คอิน/เช็คเอาท์</h6>
                      <p className="small mb-1">เช็คอิน: 14:00 น.</p>
                      <p className="small mb-0">เช็คเอาท์: 12:00 น.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary" style={{ borderRadius: '10px', padding: '10px 20px' }} onClick={() => { setShowBookingDetail(false); setSelectedBooking(null); }}>ปิด</button>
                <button type="button" className="btn" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px', padding: '10px 20px' }} onClick={() => window.print()}>
                  พิมพ์ใบยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };



  const RoomDetailModal = () => {
    if (!detailRoom) return null;

    const imgs = getRoomImages(detailRoom);
    const amenities = detailRoom.amenities || ['Wi-Fi', 'แอร์', 'ทีวี', 'อาหารเช้า'];
    const nights = calculateNights();
    const total = (detailRoom.base_price || 0) * nights;

    const [activeIdx, setActiveIdx] = useState(0);

    const goPrev = () => setActiveIdx((prev) => (prev - 1 + imgs.length) % imgs.length);
    const goNext = () => setActiveIdx((prev) => (prev + 1) % imgs.length);

    const mainSrc = (imgs.length ? imgs : ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200'])[activeIdx] || imgs[0];

    return (
      <div className={`modal fade ${showRoomDetail ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content" style={{ borderRadius: 20, border: 'none' }}>
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold" style={{ color: '#667eea' }}>{detailRoom.name}</h5>
              <button type="button" className="btn-close" onClick={() => { setShowRoomDetail(false); setDetailRoom(null); }}></button>
            </div>

            <div className="modal-body">
              <div className="row g-4">
                <div className="col-lg-7">
                  <div className="position-relative">
                    <img
                      src={`${API_BASEIMAGES_URL}${mainSrc}`}
                      className="d-block w-100"
                      alt=""
                      style={{ borderRadius: 16, height: 420, objectFit: 'cover' }}
                    />
                    {imgs.length > 1 && (
                      <>
                        <button
                          className="btn position-absolute top-50 start-0 translate-middle-y"
                          onClick={goPrev}
                          style={{ background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: 40, height: 40 }}
                          aria-label="Previous"
                        >
                          ‹
                        </button>
                        <button
                          className="btn position-absolute top-50 end-0 translate-middle-y"
                          onClick={goNext}
                          style={{ background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: 40, height: 40 }}
                          aria-label="Next"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {imgs.length > 1 && (
                    <div className="d-flex gap-2 mt-3" style={{ overflowX: 'auto' }}>
                      {imgs.map((s, i) => {
                        const isActive = i === activeIdx;
                        return (
                          <button
                            key={i}
                            className="p-0 border-0 bg-transparent"
                            onClick={() => setActiveIdx(i)}
                            aria-label={`รูปที่ ${i + 1}`}
                          >
                            <img
                              src={`${API_BASEIMAGES_URL}${s}`}
                              alt=""
                              style={{
                                width: 90,
                                height: 70,
                                objectFit: 'cover',
                                borderRadius: 10,
                                border: isActive ? '2px solid #4f46e5' : '2px solid #eef2ff',
                                outline: isActive ? '3px solid #e0e7ff' : 'none'
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="col-lg-5">
                  <div className="p-3 p-lg-0">
                    <p className="text-muted">{detailRoom.description}</p>

                    <div className="mb-3">
                      <strong className="d-block mb-2">สิ่งอำนวยความสะดวก</strong>
                      {amenities.map(a => (
                        <span key={a} className="badge me-2 mb-2" style={{ background: '#f0f0f0', color: '#333', borderRadius: 10, padding: '8px 12px' }}>
                          {a}
                        </span>
                      ))}
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-bold">เช็คอิน</label>
                        <input type="date" className="form-control" value={bookingData.checkIn} onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))} />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold">เช็คเอาท์</label>
                        <input type="date" className="form-control" value={bookingData.checkOut} onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))} />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold">ผู้เข้าพัก</label>
                        <select className="form-select" value={bookingData.guests} onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}>
                          {Array.from({ length: detailRoom.capacity }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} ท่าน</option>)}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold">จำนวนคืน</label>
                        <input className="form-control" value={nights} disabled />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-baseline">
                        <span className="h4 fw-bold mb-0" style={{ color: '#667eea' }}>฿{(detailRoom.base_price || 0).toLocaleString()}</span>
                        <small className="text-muted ms-2">/คืน</small>
                      </div>
                      <div>
                        <small className="text-muted me-2">รวม:</small>
                        <strong className="h5" style={{ color: '#667eea' }}>฿{total.toLocaleString()}</strong>
                      </div>
                    </div>

                    <button
                      className="btn w-100"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 12, padding: 12, fontWeight: 'bold' }}
                      onClick={() => {
                        if (!user) { setCurrentPage('login'); return; }
                        setSelectedRoom(detailRoom);
                        setGuestInfo({
                          fullName: user?.full_name || user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          specialRequests: ''
                        });
                        setShowRoomDetail(false);
                        setCurrentPage('booking');
                      }}
                    >
                      จองห้องนี้
                    </button>

                    <div className="alert mt-3" style={{ background: '#eff6ff', border: 'none', borderRadius: 12 }}>
                      <h6 className="fw-bold mb-2 d-flex align-items-center" style={{ color: '#667eea' }}>
                        <Clock size={18} className="me-2" />นโยบายเวลา
                      </h6>
                      <p className="small mb-1">เช็คอิน: 14:00 น. | เช็คเอาท์: 12:00 น.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0">
              <button className="btn btn-secondary" style={{ borderRadius: 10 }} onClick={() => { setShowRoomDetail(false); setDetailRoom(null); }}>ปิด</button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const SuccessModal = () => (
    <div className={`modal fade ${showModal ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '20px', border: 'none' }}>
          <div className="modal-body text-center py-5 px-4">
            <div className="mb-4" style={{ color: '#10b981' }}><CheckCircle size={80} /></div>
            <h3 className="fw-bold mb-3" style={{ color: '#10b981' }}>จองสำเร็จ!</h3>
            <p className="text-muted mb-4">การจองของคุณเสร็จสมบูรณ์แล้ว<br />เราได้ส่งอีเมลยืนยันไปที่อีเมลของคุณแล้ว</p>
            <div className="alert" style={{ background: '#eff6ff', border: 'none', borderRadius: '12px' }}><strong style={{ color: '#667eea' }}>หมายเลขการจอง:</strong><br /><span className="h5 fw-bold" style={{ color: '#667eea' }}>{confirmationBookingNo}</span></div>
            <button className="btn btn-lg px-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px', padding: '12px 40px', fontWeight: 'bold' }} onClick={() => { setShowModal(false); setCurrentPage('dashboard'); setSelectedRoom(null); }}>ดูการจองของฉัน</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100" style={{ background: '#f8f9fa', fontFamily: 'Kanit, sans-serif' }}>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

      <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Navigation />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'rooms' && <RoomsPage />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'register' && <RegisterPage />}
      {currentPage === 'booking' && <BookingPage />}
      {currentPage === 'dashboard' && <DashboardPage />}

      {showModal && <SuccessModal />}
      {showBookingDetail && <BookingDetailModal />}
      {showRoomDetail && <RoomDetailModal />}

      <footer className="text-white py-5 mt-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-4 mb-md-0">
              <h5 className="fw-bold mb-3">WUALAI HOTEL</h5>
              <p>สัมผัสประสบการณ์พักผ่อนสุดหรู ใจกลางเมืองเชียงใหม่</p>
              <div className="mt-3">
                <a href="https://maps.app.goo.gl/mHnCgTPnPVchfBEx8?g_st=ipc" target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm me-2 mb-2" style={{ borderRadius: '10px' }}>
                  <MapPin size={16} className="me-1" />Google Maps
                </a>
                <a href="https://www.facebook.com/share/1A1Jp216FE/" target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm mb-2" style={{ borderRadius: '10px' }}>
                  Facebook
                </a>
              </div>
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold mb-3">ติดต่อเรา</h6>
              <p className="mb-2 d-flex align-items-start">
                <MapPin size={18} className="me-2 mt-1" style={{ minWidth: '18px' }} />
                <span>1/1 ซอย 5 ถนนวัวลาย ต.หายยา อ.เมืองเชียงใหม่<br />จ.เชียงใหม่ 50100 ประเทศไทย</span>
              </p>
              <p className="mb-2"><Clock size={16} className="me-2" />เช็คอิน: 14:00 น. | เช็คเอาท์: 12:00 น.</p>
              <p className="mb-2"><strong>ช่องทางชำระเงิน:</strong></p>
              <p className="small">เงินสด, บัตรเครดิต, โอนเงินผ่านธนาคาร, E-Wallet</p>
            </div>
          </div>
          <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <div className="text-center"><small>&copy; 2025 WUALAI HOTEL. สงวนลิขสิทธิ์</small></div>
        </div>
      </footer>
    </div>
  );
};

export default HotelBookingApp;
