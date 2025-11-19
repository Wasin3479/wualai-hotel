import React, { useEffect, useMemo, useState } from "react";
import Boiler from "./_Boiler";
import Swal from "sweetalert2";
import { API_URL } from "../../lib/env.js";
import { useAuth } from "../../auth/session.jsx";

const THB = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

function StatusBadge({ s }) {
    const map = {
        pending: "bg-amber-50 text-amber-700",
        verified: "bg-emerald-50 text-emerald-700",
        rejected: "bg-rose-50 text-rose-700",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-slate-100 text-slate-700"}`}>
            {s}
        </span>
    );
}

function SlipModal({ open, onClose, src }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-3 flex items-center justify-between border-b">
                    <div className="font-semibold">สลิปโอนเงิน</div>
                    <button className="btn" onClick={onClose}>ปิด</button>
                </div>
                <div className="p-3">
                    {src ? (
                        <img src={`${API_URL}${src}`} alt="payment slip" className="w-full max-h-[75vh] object-contain" />
                    ) : (
                        <div className="text-slate-500">ไม่มีสลิปแนบมา</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminPayments() {
    const { authHeader } = useAuth();

    const [tab, setTab] = useState("pending"); // pending | recent
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [pending, setPending] = useState([]);
    const [recent, setRecent] = useState([]);
    const [slipSrc, setSlipSrc] = useState(null);

    async function loadPending() {
        setLoading(true); setErr("");
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/payments/pending`, { headers: authHeader() });
            if (!res.ok) throw new Error(`โหลด pending ล้มเหลว (${res.status})`);
            const js = await res.json();
            setPending(Array.isArray(js) ? js : []);
        } catch (e) {
            console.error(e); setErr(e.message || "เกิดข้อผิดพลาด"); setPending([]);
        } finally {
            setLoading(false);
        }
    }

    async function loadRecent() {
        setLoading(true); setErr("");
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/payments/recent?limit=50`, { headers: authHeader() });
            if (!res.ok) throw new Error(`โหลด recent ล้มเหลว (${res.status})`);
            const js = await res.json();
            setRecent(Array.isArray(js) ? js : []);
        } catch (e) {
            console.error(e); setErr(e.message || "เกิดข้อผิดพลาด"); setRecent([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (tab === "pending") loadPending();
        else loadRecent();
    }, [tab]);

    async function verify(item, approved) {
        const confirm = await Swal.fire({
            icon: approved ? "question" : "warning",
            title: approved ? "ยืนยันการชำระเงิน?" : "ปฏิเสธการชำระเงิน?",
            text: approved
                ? `จะบันทึกเป็น verified และเปลี่ยนบุ๊กกิ้ง ${item.booking_no} เป็น confirmed`
                : `ระบบจะปฏิเสธและคืนสถานะการจอง ${item.booking_no} เป็น pending`,
            showCancelButton: true,
            confirmButtonText: approved ? "ยืนยัน" : "ปฏิเสธ",
            cancelButtonText: "ยกเลิก",
        });
        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`${API_URL}/api/v1/admin/payments/${item.id}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ approved }),
            });
            if (!res.ok) throw new Error(`อัปเดตไม่สำเร็จ (${res.status})`);
            const js = await res.json();
            await Swal.fire({ icon: "success", title: js.message || "สำเร็จ", timer: 1000, showConfirmButton: false });
            // refresh
            if (tab === "pending") loadPending();
            else loadRecent();
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "อัปเดตไม่สำเร็จ" });
        }
    }

    const activeList = tab === "pending" ? pending : recent;

    return (
        <Boiler title="ตรวจสอบการชำระเงิน">
            <div className="mb-3 flex items-center gap-2">
                <button
                    className={`h-10 px-4 rounded-xl ${tab === "pending" ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white hover:bg-slate-50"}`}
                    onClick={() => setTab("pending")}
                >รอตรวจ</button>
                <button
                    className={`h-10 px-4 rounded-xl ${tab === "recent" ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white hover:bg-slate-50"}`}
                    onClick={() => setTab("recent")}
                >ประวัติล่าสุด</button>

                <div className="ml-auto">
                    <button className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50" onClick={() => tab === "pending" ? loadPending() : loadRecent()}>
                        รีเฟรช
                    </button>
                </div>
            </div>

            {loading && <div className="mb-2 text-slate-500 text-sm">กำลังโหลด…</div>}
            {!loading && err && <div className="mb-2 text-amber-600 text-sm">ผิดพลาด: {err}</div>}

            <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="text-left text-xs text-slate-500">
                            <th className="px-3 py-2 border-b">เวลา</th>
                            <th className="px-3 py-2 border-b">บุ๊กกิ้ง</th>
                            <th className="px-3 py-2 border-b">ลูกค้า</th>
                            <th className="px-3 py-2 border-b">วิธี</th>
                            <th className="px-3 py-2 border-b text-right">จำนวน</th>
                            <th className="px-3 py-2 border-b">สลิป</th>
                            <th className="px-3 py-2 border-b">สถานะ</th>
                            <th className="px-3 py-2 border-b text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {!loading && activeList.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-3 py-6 text-center text-slate-500">ไม่มีรายการ</td>
                            </tr>
                        )}
                        {activeList.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 border-b">
                                    {new Date(item.created_at).toLocaleString("th-TH")}
                                </td>
                                <td className="px-3 py-2 border-b font-semibold">{item.booking_no || item.booking_id}</td>
                                <td className="px-3 py-2 border-b">{item.guest_name || "-"}</td>
                                <td className="px-3 py-2 border-b">{item.method === "transfer" ? "โอน/QR" : (item.method || "-")}</td>
                                <td className="px-3 py-2 border-b text-right">{THB.format(item.amount || 0)}</td>
                                <td className="px-3 py-2 border-b">
                                    {item.slip_path ? (
                                        <button className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                            onClick={() => setSlipSrc(item.slip_path)}>
                                            ดูสลิป
                                        </button>
                                    ) : <span className="text-slate-400">—</span>}
                                </td>
                                <td className="px-3 py-2 border-b"><StatusBadge s={item.status} /></td>
                                <td className="px-3 py-2 border-b">
                                    <div className="flex justify-end gap-2">
                                        {item.status === "pending" ? (
                                            <>
                                                <button className="h-9 px-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                                    onClick={() => verify(item, true)}>ยืนยัน</button>
                                                <button className="h-9 px-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                                                    onClick={() => verify(item, false)}>ปฏิเสธ</button>
                                            </>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SlipModal open={!!slipSrc} src={slipSrc} onClose={() => setSlipSrc(null)} />
        </Boiler>
    );
}
