import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const StatusBadge = ({ s }) => {
    const map = {
        active: "bg-emerald-50 text-emerald-700",
        maintenance: "bg-amber-50 text-amber-700",
        inactive: "bg-slate-100 text-slate-600",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-slate-100 text-slate-600"}`}>
            {s}
        </span>
    );
};
const Field = ({ label, children }) => (
    <label className="block">
        <div className="text-xs text-slate-500 mb-1">{label}</div>
        {children}
    </label>
);

function EditRoomModal({ open, onClose, onSaved, roomTypes, initial }) {
    const isEdit = !!initial?.id;
    const [form, setForm] = useState({
        room_no: "",
        room_type_id: "",
        floor: "",
        status: "active",
    });

    useEffect(() => {
        if (open) {
            setForm({
                room_no: initial?.room_no || "",
                room_type_id: initial?.room_type_id || (roomTypes[0]?.id ?? ""),
                floor: initial?.floor ?? "",
                status: initial?.status || "active",
            });
        }
    }, [open, initial, roomTypes]);

    function set(k, v) { setForm((s) => ({ ...s, [k]: v })); }

    async function submit() {
        try {
            const url = isEdit
                ? `${API_URL}/api/v1/admin/rooms/${initial.id}`
                : `${API_URL}/api/v1/admin/rooms`;

            const payload = {
                room_no: form.room_no,
                room_type_id: Number(form.room_type_id),
                floor: form.floor === "" ? null : Number(form.floor),
                status: form.status,
            };

            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", ...onSaved.authHeader() },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`${isEdit ? "อัปเดต" : "สร้าง"}ห้องล้มเหลว (${res.status})`);
            await res.json();
            Swal.fire({ icon: "success", title: isEdit ? "อัปเดตแล้ว" : "เพิ่มห้องแล้ว", timer: 900, showConfirmButton: false });
            onClose?.();
            onSaved.refresh();
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ดำเนินการไม่สำเร็จ" });
        }
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-5">
                <div className="text-lg font-semibold mb-3">{isEdit ? "แก้ไขห้องพัก" : "เพิ่มห้องพัก"}</div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="หมายเลขห้อง">
                        <input className="input" value={form.room_no} onChange={(e) => set("room_no", e.target.value)} placeholder="301" />
                    </Field>
                    <Field label="ชั้น (ตัวเลข)">
                        <input className="input" value={form.floor} onChange={(e) => set("floor", e.target.value)} placeholder="3" />
                    </Field>
                    <Field label="ประเภทห้อง">
                        <select className="input" value={form.room_type_id} onChange={(e) => set("room_type_id", e.target.value)}>
                            {roomTypes.map(rt => (
                                <option key={rt.id} value={rt.id}>{rt.name} • {rt.capacity} ท่าน</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="สถานะ">
                        <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
                            <option value="active">active</option>
                            <option value="maintenance">maintenance</option>
                            <option value="inactive">inactive</option>
                        </select>
                    </Field>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn" onClick={onClose}>ยกเลิก</button>
                    <button className="btn bg-blue-100" onClick={submit}>{isEdit ? "บันทึก" : "เพิ่มห้อง"}</button>
                </div>
            </div>
        </div>
    );
}

function RoomsList() {
    const nav = useNavigate();
    const { authHeader } = useAuth();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const [roomTypes, setRoomTypes] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("%");
    const [roomTypeId, setRoomTypeId] = useState("");
    const [page, setPage] = useState(1);
    const limit = 20;

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    const fetchRoomTypes = async () => {
        const res = await fetch(`${API_URL}/api/v1/admin/rooms/room-types`, { headers: authHeader() });
        const js = await res.json();
        setRoomTypes(js);
    };

    const fetchList = async () => {
        setLoading(true); setErr("");
        try {
            const params = new URLSearchParams();
            params.set("status", status);
            if (roomTypeId) params.set("room_type_id", roomTypeId);
            if (q) params.set("q", q);
            params.set("page", page);
            params.set("limit", limit);

            const res = await fetch(`${API_URL}/api/v1/admin/rooms?${params.toString()}`, {
                headers: { "Content-Type": "application/json", ...authHeader() },
            });
            if (!res.ok) throw new Error(`โหลดรายการล้มเหลว (${res.status})`);
            const js = await res.json();
            setItems(js.items || []);
            setTotal(js.total || 0);
        } catch (e) {
            console.error(e);
            setErr(e.message || "เกิดข้อผิดพลาด");
            setItems([]); setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRoomTypes(); }, []);
    useEffect(() => { fetchList(); }, [status, roomTypeId, page]);
    function doSearch(e) { e?.preventDefault?.(); setPage(1); fetchList(); }

    function openCreate() { setEditTarget(null); setModalOpen(true); }
    function openEdit(r) { setEditTarget(r); setModalOpen(true); }

    async function changeStatus(r, newStatus) {
        const ok = await Swal.fire({
            icon: "question", title: `เปลี่ยนเป็น ${newStatus}?`,
            showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก"
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/rooms/${r.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error(`เปลี่ยนสถานะไม่สำเร็จ (${res.status})`);
            await res.json();
            Swal.fire({ icon: "success", title: "อัปเดตแล้ว", timer: 800, showConfirmButton: false });
            fetchList();
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "อัปเดตไม่สำเร็จ" });
        }
    }

    async function remove(r) {
        const ok = await Swal.fire({
            icon: "warning",
            title: `ปิดใช้งานห้อง ${r.room_no}?`,
            text: "ระบบจะตั้งสถานะเป็น inactive",
            showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก"
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/rooms/${r.id}`, {
                method: "DELETE", headers: authHeader()
            });
            if (!res.ok) throw new Error(`ลบไม่สำเร็จ (${res.status})`);
            await res.json();
            Swal.fire({ icon: "success", title: "ปิดใช้งานแล้ว", timer: 900, showConfirmButton: false });
            fetchList();
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ลบไม่สำเร็จ" });
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <Boiler title="จัดการห้องพัก">
            <form onSubmit={doSearch} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <input className="input" placeholder="ค้นหา (เลขห้อง/ประเภท)"
                    value={q} onChange={(e) => setQ(e.target.value)} />
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="%">สถานะทั้งหมด</option>
                    <option value="active">active</option>
                    <option value="maintenance">maintenance</option>
                    <option value="inactive">inactive</option>
                </select>
                <select className="input" value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}>
                    <option value="">ประเภทห้องทั้งหมด</option>
                    {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
                <button className="btn bg-green-100">ค้นหา</button>
            </form>

            <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-slate-500">ทั้งหมด {total} รายการ</div>
                <div className="flex gap-2">
                    <button className="btn" onClick={fetchList}>รีเฟรช</button>
                    <button className="btn bg-green-100" onClick={openCreate}>+ เพิ่มห้อง</button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="text-left text-xs text-slate-500">
                            <th className="px-3 py-2 border-b">ห้อง</th>
                            <th className="px-3 py-2 border-b">ประเภท</th>
                            <th className="px-3 py-2 border-b">ชั้น</th>
                            <th className="px-3 py-2 border-b">สถานะ</th>
                            <th className="px-3 py-2 border-b text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading && (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">กำลังโหลด…</td></tr>
                        )}
                        {!loading && items.length === 0 && (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">ไม่มีข้อมูล</td></tr>
                        )}
                        {!loading && items.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 border-b font-semibold">{r.room_no}</td>
                                <td className="px-3 py-2 border-b">{r.room_type_name}</td>
                                <td className="px-3 py-2 border-b">{r.floor ?? "-"}</td>
                                <td className="px-3 py-2 border-b"><StatusBadge s={r.status} /></td>
                                <td className="px-3 py-2 border-b">
                                    <div className="flex flex-wrap gap-2 justify-end">

                                        <Link to={`/rooms/${r.id}`} className="btn text-violet-600">รายละเอียด</Link>
                                        <button className="btn text-yellow-600" onClick={() => openEdit(r)}>แก้ไข</button>
                                        <div className="relative">
                                            <details>
                                                <summary className="btn text-orange-600 cursor-pointer list-none">สถานะ ▾</summary>
                                                <div className="absolute right-0 mt-1 w-36 rounded-xl border bg-white shadow-lg overflow-hidden z-10">
                                                    {["active", "maintenance", "inactive"].map(s => (
                                                        <button key={s} className="w-full text-left px-3 py-2 hover:bg-slate-50"
                                                            onClick={() => changeStatus(r, s)}>{s}</button>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                        <button className="btn text-red-600" onClick={() => remove(r)}>ปิดใช้งาน</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-3 flex items-center gap-2">
                    <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>ก่อนหน้า</button>
                    <div className="px-3 text-sm text-slate-600">หน้า {page} / {totalPages}</div>
                    <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>ถัดไป</button>
                </div>
            )}

            <EditRoomModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={{ authHeader, refresh: fetchList }}
                roomTypes={roomTypes}
                initial={editTarget}
            />
        </Boiler>
    );
}

function RoomDetail() {
    const { id } = useParams();
    const { authHeader } = useAuth();
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null);

    const load = async () => {
        setLoading(true); setErr("");
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/rooms/${id}`, { headers: authHeader() });
            if (!res.ok) throw new Error(`โหลดข้อมูลล้มเหลว (${res.status})`);
            const js = await res.json();
            setData(js);
        } catch (e) {
            console.error(e);
            setErr(e.message || "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    if (loading) return <Boiler title="รายละเอียดห้อง"><div className="text-slate-500">กำลังโหลด…</div></Boiler>;
    if (err) return <Boiler title="รายละเอียดห้อง"><div className="text-amber-600">ผิดพลาด: {err}</div></Boiler>;
    if (!data) return null;

    const { room } = data;

    return (
        <Boiler title={`ห้อง ${room.room_no} — ${room.room_type_name}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-4 md:col-span-2">
                    <div className="text-slate-500 text-sm">รายละเอียดห้อง</div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><div className="text-slate-500">หมายเลข</div><div className="font-semibold">{room.room_no}</div></div>
                        <div><div className="text-slate-500">ประเภท</div><div className="font-semibold">{room.room_type_name}</div></div>
                        <div><div className="text-slate-500">ชั้น</div><div className="font-semibold">{room.floor ?? "-"}</div></div>
                        <div><div className="text-slate-500">สถานะ</div><div className="font-semibold"><StatusBadge s={room.status} /></div></div>
                    </div>
                    <div className="mt-3">
                        <button className="btn" onClick={() => nav(-1)}>ย้อนกลับ</button>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-4">
                    <div className="text-slate-500 text-sm">สรุปด่วน</div>
                    <div className="mt-2 text-sm">
                        <div>ความจุ: <span className="font-semibold">{room.capacity}</span> ท่าน</div>
                        <div>ราคาเริ่มต้น: <span className="font-semibold">{Number(room.base_price).toLocaleString("th-TH")} บาท</span></div>
                        <div className="mt-1">อัปเดตล่าสุด: <span className="font-semibold">{new Date(room.updated_at || room.created_at).toLocaleString("th-TH")}</span></div>
                    </div>
                </div>
            </div>

            <section className="mt-4">
                <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
                    <div className="p-4 md:p-5">
                        <div className="font-semibold text-slate-800 mb-3">ประวัติการจองล่าสุด</div>
                        <div className="overflow-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="text-left text-xs text-slate-500">
                                        <th className="px-3 py-2 border-b">บุ๊กกิ้ง</th>
                                        <th className="px-3 py-2 border-b">ผู้เข้าพัก</th>
                                        <th className="px-3 py-2 border-b">เข้า</th>
                                        <th className="px-3 py-2 border-b">ออก</th>
                                        <th className="px-3 py-2 border-b">คืน</th>
                                        <th className="px-3 py-2 border-b">สถานะ</th>
                                        <th className="px-3 py-2 border-b text-right">ยอดรวม</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {data.bookings?.length ? data.bookings.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 border-b font-semibold">{b.booking_no}</td>
                                            <td className="px-3 py-2 border-b">{b.guest_name}</td>
                                            <td className="px-3 py-2 border-b">{new Date(b.check_in_date).toLocaleDateString("th-TH")}</td>
                                            <td className="px-3 py-2 border-b">{new Date(b.check_out_date).toLocaleDateString("th-TH")}</td>
                                            <td className="px-3 py-2 border-b">{b.nights}</td>
                                            <td className="px-3 py-2 border-b"><StatusBadge s={b.status} /></td>
                                            <td className="px-3 py-2 border-b text-right">{Number(b.total_amount || 0).toLocaleString("th-TH")}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-500">ยังไม่มีประวัติ</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-4">
                <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
                    <div className="p-4 md:p-5">
                        <div className="font-semibold text-slate-800 mb-3">งานทำความสะอาดล่าสุด</div>
                        <div className="overflow-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="text-left text-xs text-slate-500">
                                        <th className="px-3 py-2 border-b">วันที่</th>
                                        <th className="px-3 py-2 border-b">ประเภท</th>
                                        <th className="px-3 py-2 border-b">ความสำคัญ</th>
                                        <th className="px-3 py-2 border-b">สถานะ</th>
                                        <th className="px-3 py-2 border-b">หมายเหตุ</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {data.housekeeping?.length ? data.housekeeping.map(h => (
                                        <tr key={h.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 border-b">{new Date(h.task_date).toLocaleDateString("th-TH")}</td>
                                            <td className="px-3 py-2 border-b">{h.task_type}</td>
                                            <td className="px-3 py-2 border-b">{h.priority}</td>
                                            <td className="px-3 py-2 border-b"><StatusBadge s={h.status} /></td>
                                            <td className="px-3 py-2 border-b">{h.notes || "-"}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">ไม่มีข้อมูล</td></tr>
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

export default function RoomsPage() {
    const { id } = useParams();
    return id ? <RoomDetail /> : <RoomsList />;
}

const styles = `
.input {
  @apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500;
}
.btn { @apply h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50; }
.btn-primary { @apply h-10 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700; }
.act-btn { @apply h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50; }
.act-btn.indigo { @apply bg-indigo-600 text-white hover:bg-indigo-700 border-transparent; }
.act-btn.sky { @apply bg-sky-600 text-white hover:bg-sky-700 border-transparent; }
.act-btn.red { @apply bg-rose-600 text-white hover:bg-rose-700 border-transparent; }
`;
if (typeof document !== "undefined" && !document.getElementById("rooms-tailwind-inline")) {
    const style = document.createElement("style");
    style.id = "rooms-tailwind-inline";
    style.innerHTML = styles;
    document.head.appendChild(style);
}
