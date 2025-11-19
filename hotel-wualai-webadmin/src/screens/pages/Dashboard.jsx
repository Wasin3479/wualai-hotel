import React, { useEffect, useMemo, useState } from "react";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const fmtTHB = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

function Sparkline({ data, height = 56, color = "#7c3aed" }) {
  const max = Math.max(...data, 1);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

function ymd(d) {
  const dt = (d instanceof Date) ? d : new Date(d);
  const m = `${dt.getMonth() + 1}`.padStart(2, "0");
  const day = `${dt.getDate()}`.padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
}
function isToday(dateStr) {
  return ymd(dateStr) === ymd(new Date());
}

export default function Dashboard() {
  const { authReady, isAuthenticated, authHeader } = useAuth();

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [bookings, setBookings] = useState([]);
  const [paymentsPending, setPaymentsPending] = useState([]);

  const mock = useMemo(
    () => ({
      kpi: {
        totalRooms: 15,
        availableRooms: 9,
        occTodayPct: 40,
        revenueToday: 6000,
        pendingBookings: 3,
        checkinToday: 2,
        checkoutToday: 1,
      },
      occupancy7d: [40, 55, 35, 60, 48, 72, 58],
      arrivals: [
        { time: "13:30", guest: "TESET TEST", roomType: "Economy", nights: 1, ref: "WUA-57811604" },
        { time: "16:00", guest: "ทดสอบ ระบบ", roomType: "Standard", nights: 2, ref: "WUA-57811688" },
      ],
      departures: [{ time: "11:00", guest: "ครอบครัวคุณเอ", room: "302", ref: "WUA-57811501" }],
      payments: [
        { at: "10:05", booking: "WUA-57811604", method: "โอน/QR", amount: 800, status: "pending" },
        { at: "09:10", booking: "WUA-57811598", method: "เงินสด", amount: 1500, status: "verified" },
      ],
    }),
    []
  );

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!authReady || !isAuthenticated) return;
      setLoading(true);
      setErrMsg("");
      try {
        const resBk = await fetch(`${API_URL}/api/v1/admin/dashboard/bookings?status=%`, {
          headers: { "Content-Type": "application/json", ...authHeader() },
        });
        if (!resBk.ok) throw new Error(`ดึงข้อมูลการจองล้มเหลว (${resBk.status})`);
        const bookingsJson = await resBk.json();

        const resPay = await fetch(`${API_URL}/api/v1/admin/dashboard/payments/pending`, {
          headers: { "Content-Type": "application/json", ...authHeader() },
        });
        if (!resPay.ok) throw new Error(`ดึงข้อมูลการชำระเงินล้มเหลว (${resPay.status})`);
        const paymentsJson = await resPay.json();

        if (!alive) return;
        setBookings(Array.isArray(bookingsJson) ? bookingsJson : []);
        setPaymentsPending(Array.isArray(paymentsJson) ? paymentsJson : []);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setErrMsg(e.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setBookings([]);
        setPaymentsPending([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, [authReady, isAuthenticated, authHeader]);


  const arrivalsToday = useMemo(() => {
    if (!bookings.length) return mock.arrivals;
    return bookings
      .filter(b => isToday(b.check_in_date) && ["confirmed", "pending"].includes(b.status))
      .map(b => ({
        time: "14:00",
        guest: b.guest_name || "-",
        roomType: b.room_type_name || "-",
        nights: b.nights || 1,
        ref: b.booking_no || "",
      }));
  }, [bookings, mock.arrivals]);

  const departuresToday = useMemo(() => {
    if (!bookings.length) return mock.departures;
    return bookings
      .filter(b => isToday(b.check_out_date) && ["confirmed", "checked_in"].includes(b.status))
      .map(b => ({
        time: "11:00",
        guest: b.guest_name || "-",
        room: b.room_no || b.room_type_name || "-",
        ref: b.booking_no || "",
      }));
  }, [bookings, mock.departures]);

  const paymentsTable = useMemo(() => {
    if (!paymentsPending.length) return mock.payments;
    return paymentsPending.map(p => ({
      at: new Date(p.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      booking: p.booking_no || p.booking_id,
      method: p.method === "transfer" ? "โอน/QR" : (p.method || "-"),
      amount: Number(p.amount) || 0,
      status: p.status,
    }));
  }, [paymentsPending, mock.payments]);


  const kpi = useMemo(() => {
    if (!bookings.length) return mock.kpi;

    const pendingBookings = bookings.filter(b => b.status === "pending").length;
    const checkinToday = arrivalsToday.length;
    const checkoutToday = departuresToday.length;

    const totalRooms = 15;
    const availableRooms = Math.max(totalRooms - checkinToday, 0);
    const occTodayPct = Math.round(((totalRooms - availableRooms) / totalRooms) * 100);

    const revenueToday = 0;

    return {
      totalRooms,
      availableRooms,
      occTodayPct,
      revenueToday,
      pendingBookings,
      checkinToday,
      checkoutToday,
    };
  }, [bookings, arrivalsToday, departuresToday, mock.kpi]);

  const occColor = "#7c3aed";
  const occupancy7d = mock.occupancy7d;

  const kpis = [
    { label: "ห้องทั้งหมด", val: kpi.totalRooms },
    { label: "ห้องว่าง", val: kpi.availableRooms },
    { label: "อัตราเข้าพักวันนี้", val: `${kpi.occTodayPct}%` },
    { label: "รายได้วันนี้", val: fmtTHB.format(kpi.revenueToday) },
    { label: "บุ๊กกิ้งรอดำเนินการ", val: kpi.pendingBookings },
    { label: "เช็คอินวันนี้", val: kpi.checkinToday },
    { label: "เช็คเอาต์วันนี้", val: kpi.checkoutToday },
  ];

  return (
    <Boiler title="Dashboard — โรงแรมวัวลาย เชียงใหม่">
      {loading && (
        <div className="mb-3 text-sm text-slate-500">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์…</div>
      )}
      {!loading && errMsg && (
        <div className="mb-3 text-sm text-amber-600">ใช้ข้อมูลจำลองชั่วคราว: {errMsg}</div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm hover:shadow-md transition-shadow px-4 py-3"
          >
            <div className="text-slate-500 text-sm">{k.label}</div>
            <div className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight">{k.val}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mt-4">
        <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
          <div className="p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-800">อัตราเข้าพัก 7 วันล่าสุด</div>
                <div className="text-xs text-slate-500">โดยรวมทุกประเภทห้อง</div>
              </div>
              <div className="text-violet-700 bg-violet-50 px-3 py-1.5 rounded-xl text-sm font-semibold">
                วันนี้ {kpi.occTodayPct}%
              </div>
            </div>
            <div className="mt-2">
              <Sparkline data={occupancy7d} color={occColor} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
          <div className="p-4 md:p-5">
            <div>
              <div className="font-semibold text-slate-800 mb-2">เช็คอินวันนี้</div>
              <div className="space-y-2">
                {arrivalsToday.map((a, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50 transition"
                  >
                    <div className="col-span-2 text-xs md:text-sm text-slate-500">{a.time}</div>
                    <div className="col-span-4 md:col-span-5 font-semibold">{a.guest}</div>
                    <div className="col-span-4 text-xs md:text-sm text-slate-700">
                      {a.roomType} • {a.nights} คืน
                    </div>
                    <div className="col-span-2 text-right text-xs md:text-sm text-slate-500">{a.ref}</div>
                  </div>
                ))}
                {arrivalsToday.length === 0 && (
                  <div className="text-sm text-slate-500">ไม่มีเช็คอินวันนี้</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="font-semibold text-slate-800 mb-2">เช็คเอาต์วันนี้</div>
              <div className="space-y-2">
                {departuresToday.map((d, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50 transition"
                  >
                    <div className="col-span-2 text-xs md:text-sm text-slate-500">{d.time}</div>
                    <div className="col-span-4 md:col-span-5 font-semibold">{d.guest}</div>
                    <div className="col-span-4 text-xs md:text-sm">ห้อง {d.room}</div>
                    <div className="col-span-2 text-right text-xs md:text-sm text-slate-500">{d.ref}</div>
                  </div>
                ))}
                {departuresToday.length === 0 && (
                  <div className="text-sm text-slate-500">ไม่มีเช็คเอาต์วันนี้</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
          <div className="p-4 md:p-5">
            <div className="font-semibold text-slate-800 mb-3">การชำระเงินล่าสุด</div>
            <div className="overflow-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-xs md:text-sm text-slate-500">
                    <th className="py-2.5 px-3 border-b border-slate-200">เวลา</th>
                    <th className="py-2.5 px-3 border-b border-slate-200">เลขบุ๊กกิ้ง</th>
                    <th className="py-2.5 px-3 border-b border-slate-200">วิธีชำระ</th>
                    <th className="py-2.5 px-3 border-b border-slate-200 text-right">จำนวนเงิน</th>
                    <th className="py-2.5 px-3 border-b border-slate-200">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {paymentsTable.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 border-b border-slate-100 text-slate-700">{p.at}</td>
                      <td className="py-2.5 px-3 border-b border-slate-100">{p.booking}</td>
                      <td className="py-2.5 px-3 border-b border-slate-100">{p.method}</td>
                      <td className="py-2.5 px-3 border-b border-slate-100 text-right">
                        {fmtTHB.format(p.amount)}
                      </td>
                      <td className="py-2.5 px-3 border-b border-slate-100">
                        <span
                          className={
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold " +
                            (p.status === "verified"
                              ? "bg-emerald-50 text-teal-700"
                              : "bg-amber-50 text-amber-700")
                          }
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paymentsTable.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        ไม่พบรายการชำระเงิน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </section>
    </Boiler>
  );
}
