import React, { useEffect, useState } from "react";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const fmtTHB0 = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const fmtInt = (n) => Number(n || 0).toLocaleString("th-TH");

const btn =
  "h-10 px-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400";
const btnPrimary =
  "h-10 px-4 rounded-xl bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300";

export default function ReportBookings() {
  const { authHeader } = useAuth();
  const defEnd = new Date().toISOString().slice(0, 10);
  const defStart = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);

  const [start, setStart] = useState(defStart);
  const [end, setEnd] = useState(defEnd);
  const [status, setStatus] = useState("%");
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomTypeId, setRoomTypeId] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 20;

  async function load() {
    setLoading(true); setErr("");
    try {
      const qs = new URLSearchParams({
        start, end, status,
        ...(roomTypeId ? { room_type_id: roomTypeId } : {}),
        page: String(page), limit: String(limit)
      });
      const res = await fetch(`${API_URL}/api/v1/admin/reports/bookings?${qs}`, {
        headers: { "Content-Type": "application/json", ...authHeader() }
      });
      if (!res.ok) throw new Error(`โหลดรายงานไม่สำเร็จ (${res.status})`);
      setData(await res.json());
    } catch (e) { setErr(e.message || "เกิดข้อผิดพลาด"); setData(null); }
    finally { setLoading(false); }
  }

  async function loadRoomTypes() {
    const res = await fetch(`${API_URL}/api/v1/admin/rooms/room-types`, { headers: authHeader() });
    const js = await res.json();
    setRoomTypes(js || []);
  }

  useEffect(() => { loadRoomTypes(); }, []);
  useEffect(() => { load(); }, [page]);

  function submit(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  const k = data?.kpi || {};
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / limit));

  return (
    <Boiler title="รายงาน — การจอง">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="col-span-2"><div className="label">ตั้งแต่</div><input type="date" className="input" value={start} onChange={e => setStart(e.target.value)} /></div>
        <div className="col-span-2"><div className="label">ถึง</div><input type="date" className="input" value={end} onChange={e => setEnd(e.target.value)} /></div>
        <div><div className="label">สถานะ</div>
          <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="%">ทั้งหมด</option>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="checked_in">checked_in</option>
            <option value="checked_out">checked_out</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div><div className="label">ประเภทห้อง</div>
          <select className="input" value={roomTypeId} onChange={e => setRoomTypeId(e.target.value)}>
            <option value="">ทั้งหมด</option>
            {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-6 flex items-center gap-2">
          <button className={btnPrimary} type="submit">แสดงรายงาน</button>
          <button className={btn} type="button" onClick={load}>รีเฟรช</button>
        </div>
      </form>

      {loading && <div className="note">กำลังโหลด…</div>}
      {!loading && err && <div className="warn">ผิดพลาด: {err}</div>}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4"><div className="muted">จำนวนบุ๊กกิ้ง</div><div className="kpi">{fmtInt(k.bookings_count || 0)}</div></div>
        <div className="card p-4"><div className="muted">คืนรวม</div><div className="kpi">{fmtInt(k.nights || 0)}</div></div>
        <div className="card p-4"><div className="muted">รายได้รวม</div><div className="kpi">{fmtTHB0.format(k.revenue || 0)}</div></div>
        <div className="card p-4"><div className="muted">ADR</div><div className="kpi">{fmtTHB0.format(k.adr || 0)}</div></div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
        <div className="card p-4">
          <div className="title mb-2">จำนวนบุ๊กกิ้งแยกตามสถานะ</div>
          <table className="table">
            <thead><tr><th>สถานะ</th><th>จำนวน</th></tr></thead>
            <tbody>
              {(data?.by_status || []).map((s, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td>{s.status}</td><td>{fmtInt(s.count)}</td>
                </tr>
              ))}
              {(!data?.by_status || !data.by_status.length) && <tr><td colSpan={2} className="empty">ไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4">
        <div className="card p-4">
          <div className="title mb-2">รายการจอง</div>
          <div className="overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>บุ๊กกิ้ง</th>
                  <th>ผู้เข้าพัก</th>
                  <th>ประเภทห้อง</th>
                  <th>เข้า</th>
                  <th>ออก</th>
                  <th>คืน</th>
                  <th>สถานะ</th>
                  <th className="text-right">ยอดรวม</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items || []).map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td>{b.booking_no}</td>
                    <td>{b.guest_name}</td>
                    <td>{b.room_type_name}</td>
                    <td>{new Date(b.check_in_date).toLocaleDateString("th-TH")}</td>
                    <td>{new Date(b.check_out_date).toLocaleDateString("th-TH")}</td>
                    <td>{fmtInt(b.nights)}</td>
                    <td>{b.status}</td>
                    <td className="text-right">{fmtTHB0.format(b.total_amount || 0)}</td>
                  </tr>
                ))}
                {(!data?.items || !data.items.length) && <tr><td colSpan={8} className="empty">ไม่มีข้อมูล</td></tr>}
              </tbody>
            </table>
          </div>

          {data && data.total > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <button className={btn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>ก่อนหน้า</button>
              <div className="text-sm text-slate-600">หน้า {page} / {Math.max(1, Math.ceil((data.total || 0) / limit))}</div>
              <button className={btn} disabled={page >= Math.ceil((data.total || 0) / limit)} onClick={() => setPage(p => p + 1)}>ถัดไป</button>
            </div>
          )}
        </div>
      </section>

      <StyleInject />
    </Boiler>
  );
}

function StyleInject() {
  const css = `
  .label{@apply text-xs text-slate-500 mb-1;}
  .input{@apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500;}
  .card{@apply rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-5 md:p-6;}
  .title{@apply font-semibold text-slate-800;}
  .muted{@apply text-slate-500 text-sm;}
  .kpi{@apply mt-1.5 text-2xl font-bold;}
  .table{@apply min-w-full table-auto;}
  .table th{@apply text-left text-xs text-slate-500 px-3 py-2 border-b;}
  .table td{@apply px-3 py-2 border-b;}
  .note{@apply mb-3 text-sm text-slate-500;}
  .warn{@apply mb-3 text-sm text-amber-600;}
  .empty{@apply px-3 py-6 text-center text-slate-500;}
  `;
  if (typeof document !== "undefined") {
    const id = "book-style";
    const existing = document.getElementById(id);
    if (existing) existing.innerHTML = css;
    else { const el = document.createElement("style"); el.id = id; el.innerHTML = css; document.head.appendChild(el); }
  }
  return null;
}
