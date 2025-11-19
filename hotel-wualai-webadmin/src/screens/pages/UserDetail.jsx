import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const fmtTHB = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const fmtDT = (s) => (s ? new Date(s).toLocaleString("th-TH") : "-");
const fmtD = (s) => (s ? new Date(s).toLocaleDateString("th-TH") : "-");

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    sky: "bg-sky-50 text-sky-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function Section({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <div className="p-4 md:p-5 flex items-center justify-between gap-3">
        <div className="font-semibold text-slate-800">{title}</div>
        {right}
      </div>
      <div className="px-4 pb-4 md:px-5 md:pb-5">{children}</div>
    </div>
  );
}

export default function UserDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { authReady, isAuthenticated, authHeader } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null); // { user, summary, bookings }
  const [err, setErr] = useState("");

  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${id}/detail`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (!res.ok) throw new Error(`โหลดรายละเอียดลูกค้าล้มเหลว (${res.status})`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    load();
  }, [authReady, isAuthenticated, id]);

  const cards = useMemo(() => {
    const s = data?.summary || { total: 0, upcoming: 0, in_house: 0, completed: 0, no_show: 0, cancelled: 0 };
    return [
      { label: "ทั้งหมด", val: s.total },
      { label: "ยังไม่เข้า", val: s.upcoming },
      { label: "กำลังเข้าพัก", val: s.in_house },
      { label: "เช็คเอาต์แล้ว", val: s.completed },
      { label: "No-Show", val: s.no_show },
      { label: "ยกเลิก", val: s.cancelled },
    ];
  }, [data]);

  const groups = [
    { key: "upcoming", title: "จองแล้ว (ยังไม่เข้าพัก)", tone: "violet" },
    { key: "in_house", title: "กำลังเข้าพัก", tone: "emerald" },
    { key: "completed", title: "ออกแล้ว (Completed)", tone: "slate" },
    { key: "no_show", title: "พ้นวันเข้าพัก (ยังไม่เช็คอิน)", tone: "amber" },
    { key: "cancelled", title: "ยกเลิก", tone: "rose" },
  ];

  const BookingTable = ({ rows = [] }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-xs text-slate-500">
            <th className="py-2.5 px-3 border-b">บุ๊กกิ้ง</th>
            <th className="py-2.5 px-3 border-b">ช่วงเข้าพัก</th>
            <th className="py-2.5 px-3 border-b">ประเภทห้อง</th>
            <th className="py-2.5 px-3 border-b text-right">ยอดรวม</th>
            <th className="py-2.5 px-3 border-b">จ่ายเงิน</th>
            <th className="py-2.5 px-3 border-b">สถานะ</th>
            <th className="py-2.5 px-3 border-b w-40">จัดการ</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {rows.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50 transition">
              <td className="py-2.5 px-3 border-b font-semibold">{b.booking_no}</td>
              <td className="py-2.5 px-3 border-b">
                {fmtD(b.check_in_date)} – {fmtD(b.check_out_date)} ({b.nights} คืน)
              </td>
              <td className="py-2.5 px-3 border-b">{b.room_type_name || "-"}</td>
              <td className="py-2.5 px-3 border-b text-right">{fmtTHB.format(b.total_amount || 0)}</td>
              <td className="py-2.5 px-3 border-b">
                {b.payment_status
                  ? <Badge tone={b.payment_status === "verified" ? "emerald" : "amber"}>{b.payment_status}</Badge>
                  : <span className="text-slate-500">—</span>}
              </td>
              <td className="py-2.5 px-3 border-b">
                <Badge tone={
                  b.status === "checked_in" ? "emerald" :
                    b.status === "checked_out" ? "slate" :
                      b.status === "cancelled" ? "rose" :
                        "violet"
                }>
                  {b.status}
                </Badge>
              </td>
              <td className="py-2.5 px-3 border-b">
                <div className="flex gap-2">
                  <button
                    className="px-3 h-9 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                    onClick={() => setSelected(b)}
                  >
                    รายละเอียด
                  </button>

                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={7} className="py-6 text-center text-slate-500">ไม่มีข้อมูล</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <Boiler title="รายละเอียดลูกค้า">
      {loading && <div className="mb-3 text-sm text-slate-500">กำลังโหลดข้อมูล…</div>}
      {!loading && err && (
        <div className="mb-3 text-sm text-rose-600">{err}</div>
      )}
      {!loading && data && (
        <>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {data.user.full_name || "—"}
              </div>
              <div className="text-sm text-slate-600">{data.user.email}</div>
              <div className="text-sm text-slate-600">{data.user.phone || "-"}</div>
              <div className="text-xs text-slate-500 mt-1">สร้างเมื่อ: {fmtDT(data.user.created_at)}</div>
            </div>
            <div>
              <button className="px-3 h-10 rounded-xl border hover:bg-gray-50" onClick={() => nav(-1)}>กลับ</button>
            </div>
          </div>

          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {cards.map((c, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3">
                <div className="text-slate-500 text-sm">{c.label}</div>
                <div className="mt-1.5 text-2xl font-bold">{c.val}</div>
              </div>
            ))}
          </section>

          <div className="mt-4 space-y-4">
            {groups.map(g => (
              <Section
                key={g.key}
                title={g.title}
                right={<Badge tone={g.tone}>{(data.bookings?.[g.key] || []).length} รายการ</Badge>}
              >
                <BookingTable rows={data.bookings?.[g.key] || []} />
              </Section>
            ))}
          </div>

          {selected && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">รายละเอียดการจอง</div>
                  <button className="icon-btn" onClick={() => setSelected(null)}>
                    <svg width="22" height="22" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="#334155" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><div className="text-xs text-slate-500">เลขบุ๊กกิ้ง</div><div className="font-semibold">{selected.booking_no}</div></div>
                  <div><div className="text-xs text-slate-500">สถานะ</div><div><Badge tone={
                    selected.status === "checked_in" ? "emerald" :
                      selected.status === "checked_out" ? "slate" :
                        selected.status === "cancelled" ? "rose" : "violet"
                  }>{selected.status}</Badge></div></div>

                  <div><div className="text-xs text-slate-500">Check-in</div><div className="font-semibold">{fmtDT(selected.check_in_date)}</div></div>
                  <div><div className="text-xs text-slate-500">Check-out</div><div className="font-semibold">{fmtDT(selected.check_out_date)}</div></div>

                  <div><div className="text-xs text-slate-500">คืน</div><div className="font-semibold">{selected.nights}</div></div>
                  <div><div className="text-xs text-slate-500">ประเภทห้อง</div><div className="font-semibold">{selected.room_type_name || "-"}</div></div>

                  <div><div className="text-xs text-slate-500">ยอดรวม</div><div className="font-semibold">{fmtTHB.format(selected.total_amount || 0)}</div></div>
                  <div><div className="text-xs text-slate-500">ชำระเงิน</div><div>
                    {selected.payment_status
                      ? <Badge tone={selected.payment_status === "verified" ? "emerald" : "amber"}>{selected.payment_status}</Badge>
                      : <span className="text-slate-500">—</span>}
                  </div></div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button className="px-4 h-10 rounded-xl border mr-2" onClick={() => setSelected(null)}>ปิด</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Boiler>
  );
}
