import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const Field = ({ label, children }) => (
    <label className="block">
        <div className="text-xs text-slate-500 mb-1">{label}</div>
        {children}
    </label>
);
const StatusDot = ({ on }) => (
    <span className={"inline-block w-2.5 h-2.5 rounded-full " + (on ? "bg-emerald-500" : "bg-slate-300")} />
);


function ImagesManager({ typeId, images, setImages, authHeader }) {
    async function handleUpload(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const fd = new FormData();
        files.forEach(f => fd.append("files", f));
        const res = await fetch(`${API_URL}/api/v1/admin/room-types/${typeId}/images`, {
            method: "POST",
            headers: authHeader(),
            body: fd
        });
        if (!res.ok) throw new Error(`อัปโหลดรูปไม่สำเร็จ (${res.status})`);
        const js = await res.json();
        setImages(js.images || []);
    }

    async function removeAt(idx) {
        const path = images[idx];
        const res = await fetch(`${API_URL}/api/v1/admin/room-types/${typeId}/images`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify({ path })
        });
        if (!res.ok) throw new Error(`ลบรูปไม่สำเร็จ (${res.status})`);
        const js = await res.json();
        setImages(js.images || []);
    }

    function move(idx, dir) {
        const swap = (a, i, j) => { const c = a.slice();[c[i], c[j]] = [c[j], c[i]]; return c; };
        if (dir === "up" && idx > 0) setImages(s => swap(s, idx, idx - 1));
        if (dir === "down" && idx < images.length - 1) setImages(s => swap(s, idx, idx + 1));
    }

    async function saveOrder() {
        const res = await fetch(`${API_URL}/api/v1/admin/room-types/${typeId}/images`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify({ images })
        });
        if (!res.ok) throw new Error(`บันทึกการเรียงไม่สำเร็จ (${res.status})`);
        await res.json();
        Swal.fire({ icon: "success", title: "บันทึกการเรียงแล้ว", timer: 900, showConfirmButton: false });
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-600">รูปภาพ ({images.length})</div>
                <div className="flex gap-2">
                    <label className="btn cursor-pointer bg-green-700 text-white">
                        + เพิ่มรูป
                        <input type="file" accept="image/*" multiple hidden onChange={handleUpload} />
                    </label>
                    <button className="btn" onClick={saveOrder}>บันทึกการเรียง</button>
                </div>
            </div>

            {images.length === 0 && (
                <div className="text-sm text-slate-500">ยังไม่มีรูป</div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.map((src, i) => (
                    <div key={src + i} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                        <div className="aspect-video bg-slate-100">
                            <img src={`${API_URL}${src}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2 flex items-center justify-between gap-2">
                            <div className="text-[11px] text-slate-500 truncate w-[70%]">{src.replace("/uploads/", "")}</div>
                            <div className="flex items-center gap-1">
                                <button className="icon-mini" title="ขึ้น" onClick={() => move(i, "up")}>↑</button>
                                <button className="icon-mini" title="ลง" onClick={() => move(i, "down")}>↓</button>
                                <button className="icon-mini danger" title="ลบ" onClick={() => removeAt(i)}>✕</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EditTypeModal({ open, onClose, onSaved, initial }) {
    const isEdit = !!initial?.id;
    const { authHeader } = useAuth();
    const [form, setForm] = useState({
        code: "", name: "", description: "",
        base_price: "", capacity: "", is_active: 1
    });
    const [images, setImages] = useState([]);

    useEffect(() => {
        if (open) {
            setForm({
                code: initial?.code || "",
                name: initial?.name || "",
                description: initial?.description || "",
                base_price: initial?.base_price ?? "",
                capacity: initial?.capacity ?? "",
                is_active: initial?.is_active ?? 1
            });
            setImages(Array.isArray(initial?.images) ? initial.images : []);
        }
    }, [open, initial]);

    function set(k, v) { setForm(s => ({ ...s, [k]: v })); }

    async function submit() {
        try {
            const url = isEdit
                ? `${API_URL}/api/v1/admin/room-types/${initial.id}`
                : `${API_URL}/api/v1/admin/room-types`;

            // ส่งฟิลด์หลัก ถ้าต้องการอัพเดตรูปแบบ "รวม" ในคำสั่งเดียว ก็ส่ง images ไปด้วยได้
            const payload = {
                code: form.code,
                name: form.name,
                description: form.description || null,
                base_price: form.base_price === "" ? null : Number(form.base_price),
                capacity: form.capacity === "" ? null : Number(form.capacity),
                is_active: Number(form.is_active),
                images // << ถ้าต้องการเซ็ตภาพรวมในครั้งเดียว
            };
            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`${isEdit ? "อัปเดต" : "สร้าง"}ประเภทห้องล้มเหลว (${res.status})`);
            await res.json();
            Swal.fire({ icon: "success", title: isEdit ? "อัปเดตแล้ว" : "เพิ่มประเภทห้องแล้ว", timer: 900, showConfirmButton: false });
            onClose?.(); onSaved?.();
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ดำเนินการไม่สำเร็จ" });
        }
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-5">
                <div className="text-lg font-semibold mb-3">{isEdit ? "แก้ไขประเภทห้อง" : "เพิ่มประเภทห้อง"}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="block">
                        <div className="text-xs text-slate-500 mb-1">รหัส (code)</div>
                        <input className="input" value={form.code} onChange={e => set("code", e.target.value)} placeholder="STD" />
                    </label>
                    <label className="block">
                        <div className="text-xs text-slate-500 mb-1">ชื่อ</div>
                        <input className="input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Standard Room" />
                    </label>
                    <label className="block md:col-span-2">
                        <div className="text-xs text-slate-500 mb-1">คำอธิบาย</div>
                        <textarea className="input" rows={3} value={form.description} onChange={e => set("description", e.target.value)} />
                    </label>
                    <label className="block">
                        <div className="text-xs text-slate-500 mb-1">ราคาเริ่มต้น</div>
                        <input type="number" className="input" value={form.base_price} onChange={e => set("base_price", e.target.value)} />
                    </label>
                    <label className="block">
                        <div className="text-xs text-slate-500 mb-1">ความจุ (ท่าน)</div>
                        <input type="number" className="input" value={form.capacity} onChange={e => set("capacity", e.target.value)} />
                    </label>
                    <label className="block">
                        <div className="text-xs text-slate-500 mb-1">สถานะ</div>
                        <select className="input" value={form.is_active} onChange={e => set("is_active", e.target.value)}>
                            <option value={1}>active</option>
                            <option value={0}>inactive</option>
                        </select>
                    </label>
                </div>

                <div className="mt-5">
                    <ImagesManager typeId={initial?.id} images={images} setImages={setImages} authHeader={authHeader} />
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn" onClick={onClose}>ยกเลิก</button>
                    <button className="btn bg-violet-600 text-white" onClick={submit}>{isEdit ? "บันทึก" : "เพิ่มประเภทห้อง"}</button>
                </div>
            </div>
        </div>
    );
}


function RoomTypesList() {
    const { authHeader } = useAuth();
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const [q, setQ] = useState("");
    const [status, setStatus] = useState("%");
    const [page, setPage] = useState(1);
    const limit = 20;

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    async function fetchList() {
        setLoading(true); setErr("");
        try {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            params.set("status", status);
            params.set("page", page);
            params.set("limit", limit);

            const res = await fetch(`${API_URL}/api/v1/admin/room-types?${params.toString()}`, {
                headers: { "Content-Type": "application/json", ...authHeader() }
            });
            const js = await res.json();
            if (!res.ok) throw new Error(js.message || "โหลดล้มเหลว");
            setItems(js.items || []); setTotal(js.total || 0);
        } catch (e) {
            console.error(e);
            setErr(e.message || "เกิดข้อผิดพลาด");
            setItems([]); setTotal(0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchList(); }, [status, page]);
    function doSearch(e) { e?.preventDefault?.(); setPage(1); fetchList(); }

    function openCreate() { setEditTarget(null); setModalOpen(true); }
    function openEdit(rt) { setEditTarget(rt); setModalOpen(true); }

    async function toggleStatus(rt) {
        const to = rt.is_active ? 0 : 1;
        const res = await fetch(`${API_URL}/api/v1/admin/room-types/${rt.id}/status`, {
            method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify({ is_active: to })
        });
        const js = await res.json();
        if (!res.ok) return Swal.fire({ icon: "error", title: "ผิดพลาด", text: js.message || "ไม่สำเร็จ" });
        Swal.fire({ icon: "success", title: "อัปเดตแล้ว", timer: 800, showConfirmButton: false });
        fetchList();
    }

    async function remove(rt) {
        const ok = await Swal.fire({ icon: "warning", title: `ปิดใช้งาน ${rt.name}?`, showCancelButton: true, confirmButtonText: "ยืนยัน" });
        if (!ok.isConfirmed) return;
        const res = await fetch(`${API_URL}/api/v1/admin/room-types/${rt.id}`, { method: "DELETE", headers: authHeader() });
        const js = await res.json();
        if (!res.ok) return Swal.fire({ icon: "error", title: "ผิดพลาด", text: js.message || "ไม่สำเร็จ" });
        Swal.fire({ icon: "success", title: "ปิดใช้งานแล้ว", timer: 800, showConfirmButton: false });
        fetchList();
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <Boiler title="จัดการประเภทห้อง">
            <form onSubmit={doSearch} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <input className="input" placeholder="ค้นหา (code/ชื่อ/คำอธิบาย)" value={q} onChange={(e) => setQ(e.target.value)} />
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="%">สถานะทั้งหมด</option>
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                </select>
                <div />
                <button className="h-10 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">ค้นหา</button>
            </form>

            <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-slate-500">ทั้งหมด {total} รายการ</div>
                <div className="flex gap-2">
                    <button className="btn" onClick={fetchList}>รีเฟรช</button>
                    <button className="h-10 px-4 rounded-xl bg-violet-600 text-white hover:bg-violet-700" onClick={openCreate}>+ เพิ่มประเภท</button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="text-left text-xs text-slate-500">
                            <th className="px-3 py-2 border-b">รหัส</th>
                            <th className="px-3 py-2 border-b">ชื่อ</th>
                            <th className="px-3 py-2 border-b">ราคาเริ่มต้น</th>
                            <th className="px-3 py-2 border-b">ความจุ</th>
                            <th className="px-3 py-2 border-b">สถานะ</th>
                            <th className="px-3 py-2 border-b text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading && (<tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">กำลังโหลด…</td></tr>)}
                        {!loading && items.length === 0 && (<tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">ไม่มีข้อมูล</td></tr>)}
                        {!loading && items.map(rt => (
                            <tr key={rt.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 border-b font-semibold">{rt.code}</td>
                                <td className="px-3 py-2 border-b">{rt.name}</td>
                                <td className="px-3 py-2 border-b">{Number(rt.base_price || 0).toLocaleString("th-TH")}</td>
                                <td className="px-3 py-2 border-b">{rt.capacity}</td>
                                <td className="px-3 py-2 border-b">
                                    <div className="inline-flex items-center gap-2">
                                        <StatusDot on={!!rt.is_active} /> <span>{rt.is_active ? "active" : "inactive"}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 border-b">
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        <Link to={`/room-types/${rt.id}`} className="btn bg-violet-600 text-white">รายละเอียด</Link>
                                        <button className="btn bg-yellow-600 text-white" onClick={() => openEdit(rt)}>แก้ไข</button>
                                        <button className="btn bg-orange-600 text-white" onClick={() => toggleStatus(rt)}>{rt.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}</button>
                                        <button className="btn bg-red-600 text-white" onClick={() => remove(rt)}>ลบ (inactive)</button>
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

            <EditTypeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={fetchList}
                authHeader={authHeader}
                initial={editTarget}
            />
        </Boiler>
    );
}

function RoomTypeDetail() {
    const { id } = useParams();
    const { authHeader } = useAuth();
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null);

    async function load() {
        setLoading(true); setErr("");
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/room-types/${id}`, { headers: authHeader() });
            const js = await res.json();
            if (!res.ok) throw new Error(js.message || "โหลดล้มเหลว");
            setData(js);
        } catch (e) {
            console.error(e);
            setErr(e.message || "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, [id]);

    if (loading) return <Boiler title="รายละเอียดประเภทห้อง"><div className="text-slate-500">กำลังโหลด…</div></Boiler>;
    if (err) return <Boiler title="รายละเอียดประเภทห้อง"><div className="text-amber-600">ผิดพลาด: {err}</div></Boiler>;
    if (!data) return null;

    return (
        <Boiler title={`ประเภท: ${data.name} (${data.code})`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-4 lg:col-span-2">
                    <div className="text-slate-500 text-sm">รายละเอียด</div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><div className="text-slate-500">รหัส</div><div className="font-semibold">{data.code}</div></div>
                        <div><div className="text-slate-500">ราคาเริ่มต้น</div><div className="font-semibold">{Number(data.base_price || 0).toLocaleString("th-TH")} บาท</div></div>
                        <div><div className="text-slate-500">ความจุ</div><div className="font-semibold">{data.capacity}</div></div>
                        <div><div className="text-slate-500">สถานะ</div><div className="font-semibold">{data.is_active ? "active" : "inactive"}</div></div>
                    </div>
                    {data.description && <div className="mt-3 text-sm"><span className="text-slate-500">คำอธิบาย:</span> {data.description}</div>}
                    <div className="mt-3">
                        <button className="btn" onClick={() => nav(-1)}>ย้อนกลับ</button>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-4">
                    <div className="text-slate-500 text-sm">รูปภาพ</div>
                    {data.images?.length ? (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {data.images.map((u, idx) => (
                                <img key={idx} src={`${API_URL}${u}`} alt="" className="w-full h-28 object-cover rounded-xl border" />
                            ))}
                        </div>
                    ) : <div className="mt-2 text-sm text-slate-500">ไม่มีรูปภาพ</div>}
                </div>
            </div>

            <section className="mt-4">
                <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
                    <div className="p-4 md:p-5">
                        <div className="font-semibold text-slate-800 mb-2">ห้องในประเภทนี้</div>
                        <div className="overflow-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="text-left text-xs text-slate-500">
                                        <th className="px-3 py-2 border-b">หมายเลข</th>
                                        <th className="px-3 py-2 border-b">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {data.rooms?.length ? data.rooms.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 border-b font-semibold">{r.room_no}</td>
                                            <td className="px-3 py-2 border-b">{r.status}</td>
                                        </tr>
                                    )) : <tr><td colSpan={2} className="px-3 py-6 text-center text-slate-500">ไม่มีห้อง</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </Boiler>
    );
}

export default function RoomTypesPage() {
    const { id } = useParams();
    return id ? <RoomTypeDetail /> : <RoomTypesList />;
}

const styles = `
.input { @apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500; }
.btn { @apply h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50; }
.btn-primary { @apply h-10 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700; }
.act-btn { @apply h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50; }
.act-btn.indigo { @apply bg-indigo-600 text-white hover:bg-indigo-700 border-transparent; }
.act-btn.sky { @apply bg-sky-600 text-white hover:bg-sky-700 border-transparent; }
.act-btn.red { @apply bg-rose-600 text-white hover:bg-rose-700 border-transparent; }
`;
if (typeof document !== "undefined" && !document.getElementById("roomtypes-inline")) {
    const style = document.createElement("style");
    style.id = "roomtypes-inline";
    style.innerHTML = styles;
    document.head.appendChild(style);
}
