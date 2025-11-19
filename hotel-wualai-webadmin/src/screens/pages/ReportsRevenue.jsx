import React, { useEffect, useState } from "react";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const btn =
    "h-10 px-3 rounded-xl border border-slate-300 bg-slate-100 !text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
const btnPrimary =
    "h-10 px-4 rounded-xl !bg-indigo-600 !text-white hover:!bg-indigo-700 active:!bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

const fmtTHB0 = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const fmtInt = (n) => Number(n || 0).toLocaleString("th-TH");

export default function ReportRevenue() {
    const { authHeader } = useAuth();

    const defEnd = new Date().toISOString().slice(0, 10);
    const defStart = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);

    const [start, setStart] = useState(defStart);
    const [end, setEnd] = useState(defEnd);
    const [gran, setGran] = useState("day");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null);

    async function load() {
        setLoading(true);
        setErr("");
        try {
            const qs = new URLSearchParams({ start, end, granularity: gran });
            const res = await fetch(`${API_URL}/api/v1/admin/reports/revenue?${qs}`, {
                headers: { "Content-Type": "application/json", ...authHeader() },
            });

            const raw = await res.text();
            let js = null;
            try {
                js = raw ? JSON.parse(raw) : null;
            } catch { }

            if (!res.ok) {
                const msg = (js && (js.message || js.error)) || raw || `โหลดรายงานไม่สำเร็จ (${res.status})`;
                throw new Error(msg);
            }
            setData(js);
        } catch (e) {
            setErr(e.message || "เกิดข้อผิดพลาด");
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const k = data?.kpi || {};
    const byMethod = data?.by_method || [];
    const topRoomTypes = data?.top_room_types || [];
    const recent = data?.recent || [];
    const rangeText = data?.range ? `${data.range.start} – ${data.range.end}` : `${start} – ${end}`;

    return (
        <Boiler title="รายงาน — สรุปรายได้">
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
                <div>
                    <div className="label">สรุปแบบ</div>
                    <select className="input" value={gran} onChange={(e) => setGran(e.target.value)}>
                        <option value="day">รายวัน</option>
                        <option value="month">รายเดือน</option>
                    </select>
                </div>
                <div className="md:col-span-5 flex gap-2">
                    <button className={btnPrimary}>แสดงรายงาน</button>
                    <button type="button" className={btn} onClick={load}>
                        รีเฟรช
                    </button>
                    <div className="chip ml-auto">
                        ช่วง: <span className="font-semibold text-slate-800">{rangeText}</span>
                        <span className="mx-2 h-4 w-px bg-slate-300 inline-block" />
                        รูปแบบ: <span className="font-semibold text-slate-800">{gran === "month" ? "รายเดือน" : "รายวัน"}</span>
                    </div>
                </div>
            </form>

            {err && (
                <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2">
                    ผิดพลาด: {err}{" "}
                    <button className="underline" type="button" onClick={load}>
                        ลองใหม่
                    </button>
                </div>
            )}

            {loading && <div className="note">กำลังคำนวณรายงาน…</div>}

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="card kpiCard p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="muted">รายได้รวม</div>
                            <div className="kpi">{fmtTHB0.format(k.total_revenue || 0)}</div>
                        </div>
                        <div className="iconCircle">
                            {/* ฿ icon */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M7 6h7a3 3 0 1 1 0 6H7m5-8v16M7 12h8a3 3 0 1 1 0 6H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card kpiCard p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="muted">จำนวนธุรกรรม</div>
                            <div className="kpi">{fmtInt(k.payments_count || 0)}</div>
                        </div>
                        <div className="iconCircle">
                            {/* receipt */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M7 4h10v16l-3-2-2 2-2-2-3 2V4zM9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card kpiCard p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="muted">ตั๋วเฉลี่ย</div>
                            <div className="kpi">{fmtTHB0.format(k.avg_ticket || 0)}</div>
                        </div>
                        <div className="iconCircle">
                            {/* ticket */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M4 10V6a2 2 0 0 1 2-2h5v4a2 2 0 1 0 0 4v4h-5a2 2 0 0 1-2-2v-4Zm16 0V6a2 2 0 0 0-2-2h-5v4a2 2 0 1 1 0 4v4h5a2 2 0 0 0 2-2v-4Z" stroke="currentColor" strokeWidth="1.6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card kpiCard p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="muted">รอตรวจ</div>
                            <div className="kpi">{fmtInt(k.pending_count || 0)}</div>
                        </div>
                        <div className="iconCircle">
                            {/* clock */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
                <div className="card p-4">
                    <div className="title">ภาพรวม Occupancy (โดยประมาณ)</div>
                    <div className="grid grid-cols-2 gap-3 text-sm mt-2">
                        <div>
                            <div className="muted">จำนวนห้อง</div>
                            <div className="v">{fmtInt(k.rooms_total || 0)}</div>
                        </div>
                        <div>
                            <div className="muted">ช่วง (วัน)</div>
                            <div className="v">{fmtInt(k.days || 0)}</div>
                        </div>
                        <div>
                            <div className="muted">คืนที่ขายได้</div>
                            <div className="v">{fmtInt(k.nights_sold || 0)}</div>
                        </div>
                        <div>
                            <div className="muted">อัตราเข้าพัก</div>
                            <div className="v">{fmtInt(k.occupancy_pct || 0)}%</div>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="title mb-2">รายได้ตามวิธีชำระ</div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>วิธี</th>
                                <th>จำนวน</th>
                                <th className="text-right">รวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {byMethod.map((m, i) => (
                                <tr key={i} className="odd:bg-slate-50/40 hover:bg-slate-50">
                                    <td>{m.method || "-"}</td>
                                    <td>{fmtInt(m.count)}</td>
                                    <td className="text-right">{fmtTHB0.format(m.total)}</td>
                                </tr>
                            ))}
                            {!byMethod.length && (
                                <tr>
                                    <td colSpan={3} className="empty">
                                        ไม่มีข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card p-4">
                    <div className="title mb-2">Top Room Types</div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ประเภท</th>
                                <th>บุ๊กกิ้ง</th>
                                <th className="text-right">รวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topRoomTypes.map((t, i) => (
                                <tr key={i} className="odd:bg-slate-50/40 hover:bg-slate-50">
                                    <td>{t.name}</td>
                                    <td>{fmtInt(t.bookings_count)}</td>
                                    <td className="text-right">{fmtTHB0.format(t.total_revenue)}</td>
                                </tr>
                            ))}
                            {!topRoomTypes.length && (
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

            <section className="mt-4">
                <div className="card p-4">
                    <div className="title mb-2">ธุรกรรมล่าสุด</div>
                    <div className="overflow-auto">
                        <table className="table">
                            <thead className="sticky top-0 bg-white">
                                <tr>
                                    <th>เวลา</th>
                                    <th>บุ๊กกิ้ง</th>
                                    <th>ผู้จอง</th>
                                    <th>วิธี</th>
                                    <th className="text-right">ยอด</th>
                                    <th>สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((p) => (
                                    <tr key={p.id} className="odd:bg-slate-50/40 hover:bg-slate-50">
                                        <td>
                                            {new Date(p.paid_at || p.created_at).toLocaleString("th-TH", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })}
                                        </td>
                                        <td>{p.booking_no || p.booking_id}</td>
                                        <td>{p.guest_name || "-"}</td>
                                        <td>{p.method || "-"}</td>
                                        <td className="text-right">{fmtTHB0.format(p.amount || 0)}</td>
                                        <td>
                                            <span className={"badge " + (p.status === "verified" ? "ok" : p.status === "pending" ? "warn" : "bad")}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!recent.length && (
                                    <tr>
                                        <td colSpan={6} className="empty">
                                            ไม่มีรายการ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <StyleInject />
        </Boiler>
    );
}

function StyleInject() {
    const css = `
  .label{@apply text-xs text-slate-500 mb-1;}
  .input{@apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500;}

  /* เพิ่ม padding การ์ด */
  .card{@apply rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-5 md:p-6;}
  .kpiCard{@apply bg-gradient-to-b from-indigo-50/60 to-white;}
  .iconCircle{@apply h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0;}

  .chip{@apply h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center gap-2;}
  .title{@apply font-semibold text-slate-800;}
  .muted{@apply text-slate-500 text-sm;}
  .kpi{@apply mt-1.5 text-2xl font-bold;}

  /* ขยาย padding ในตารางให้โปร่งขึ้น */
  .table{@apply min-w-full table-auto;}
  .table th{@apply text-left text-xs text-slate-500 px-4 py-3 border-b;}
  .table td{@apply px-4 py-3 border-b;}

  .note{@apply mb-3 text-sm text-slate-500;}
  .empty{@apply px-3 py-6 text-center text-slate-500;}

  .badge{@apply inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold;}
  .badge.ok{@apply bg-emerald-50 text-emerald-700;}
  .badge.warn{@apply bg-amber-50 text-amber-700;}
  .badge.bad{@apply bg-rose-50 text-rose-700;}
  `;
    if (typeof document !== "undefined" && !document.getElementById("rev-style")) {
        const el = document.createElement("style");
        el.id = "rev-style";
        el.innerHTML = css;
        document.head.appendChild(el);
    }
    return null;
}
