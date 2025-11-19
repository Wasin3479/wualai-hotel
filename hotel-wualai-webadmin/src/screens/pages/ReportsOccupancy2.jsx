import React, { useEffect, useState } from "react";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const fmtInt = (n) => Number(n || 0).toLocaleString("th-TH");

const btn =
    "h-10 px-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400";
const btnPrimary =
    "h-10 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";

export default function ReportOccupancy() {
    const { authHeader } = useAuth();
    const defEnd = new Date().toISOString().slice(0, 10);
    const defStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

    const [start, setStart] = useState(defStart);
    const [end, setEnd] = useState(defEnd);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null);

    async function load() {
        setLoading(true);
        setErr("");
        try {
            const qs = new URLSearchParams({ start, end });
            const res = await fetch(`${API_URL}/api/v1/admin/reports/occupancy?${qs}`, {
                headers: { "Content-Type": "application/json", ...authHeader() },
            });
            if (!res.ok) throw new Error(`โหลดรายงานไม่สำเร็จ (${res.status})`);
            setData(await res.json());
        } catch (e) {
            setErr(e.message || "เกิดข้อผิดพลาด");
            setData(null);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    const rangeText = `${start} – ${end}`;

    return (
        <Boiler title="รายงาน — อัตราเข้าพัก">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    load();
                }}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3"
            >
                <div className="col-span-2">
                    <div className="label">ตั้งแต่</div>
                    <input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
                </div>
                <div className="col-span-2">
                    <div className="label">ถึง</div>
                    <input type="date" className="input" value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>
                <div className="md:col-span-5 flex items-center gap-2">
                    <button className={btnPrimary}>แสดงรายงาน</button>
                    <button type="button" className={btn} onClick={load}>รีเฟรช</button>
                    <div className="chip ml-auto">
                        ช่วง: <span className="font-semibold text-slate-800">{rangeText}</span>
                    </div>
                </div>
            </form>

            {loading && <div className="note">กำลังโหลด…</div>}
            {!loading && err && <div className="warn">ผิดพลาด: {err}</div>}

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="muted">จำนวนห้องที่ใช้งาน</div>
                    <div className="kpi">{fmtInt(data?.kpi?.rooms_total || 0)}</div>
                </div>
                <div className="card p-4">
                    <div className="muted">ช่วง (วัน)</div>
                    <div className="kpi">{fmtInt(data?.kpi?.days || 0)}</div>
                </div>
                <div className="card p-4">
                    <div className="muted">คืนที่ขายได้</div>
                    <div className="kpi">{fmtInt(data?.kpi?.nights_sold || 0)}</div>
                </div>
                <div className="card p-4">
                    <div className="muted">อัตราเข้าพักเฉลี่ย</div>
                    <div className="kpi">{fmtInt(data?.kpi?.occupancy_avg_pct || 0)}%</div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 mt-4">
                <div className="card p-4">
                    <div className="title mb-2">คืนที่ขาย — แยกตามประเภทห้อง</div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ประเภท</th>
                                <th>บุ๊กกิ้ง</th>
                                <th className="text-right">คืนที่ขาย</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.by_room_type || []).map((r) => (
                                <tr key={r.id} className="odd:bg-slate-50/40 hover:bg-slate-50">
                                    <td>{r.name}</td>
                                    <td>{fmtInt(r.bookings)}</td>
                                    <td className="text-right">{fmtInt(r.nights_sold)}</td>
                                </tr>
                            ))}
                            {(!data?.by_room_type || !data.by_room_type.length) && (
                                <tr>
                                    <td colSpan={3} className="empty">
                                        ไม่มีข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <StyleInject />
        </Boiler>
    );
}

function StyleInject() {
    const css = `
  .label{@apply text-xs text-slate-500 mb-1;}
  .input{@apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500;}

  .card{@apply rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-5 md:p-6;}
  .title{@apply font-semibold text-slate-800;}
  .muted{@apply text-slate-500 text-sm;}
  .kpi{@apply mt-1.5 text-2xl font-bold;}

  .chip{@apply h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center gap-2;}

  .table{@apply min-w-full table-auto;}
  .table th{@apply text-left text-xs text-slate-500 px-4 py-3 border-b;}
  .table td{@apply px-4 py-3 border-b;}

  .note{@apply mb-3 text-sm text-slate-500;}
  .warn{@apply mb-3 text-sm text-amber-600;}
  .empty{@apply px-3 py-6 text-center text-slate-500;}
  `;
    if (typeof document !== "undefined") {
        const id = "occ-style";
        const el = document.getElementById(id) || Object.assign(document.createElement("style"), { id });
        el.innerHTML = css;
        if (!el.parentNode) document.head.appendChild(el);
    }
    return null;
}
