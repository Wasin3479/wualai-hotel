import React, { useEffect, useMemo, useState } from "react";
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

function SlideCard({ s, onEdit, onToggle, onRemove, onMoveUp, onMoveDown }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex">
            <div className="w-40 h-28 bg-slate-100 overflow-hidden">
                {s.image_path ? (
                    <img src={`${API_URL}${s.image_path}`} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full grid place-items-center text-slate-400 text-sm">ไม่มีรูป</div>
                )}
            </div>
            <div className="flex-1 p-3">
                <div className="flex items-center justify-between">
                    <div className="font-semibold">{s.title || "(ไม่มีหัวเรื่อง)"}</div>
                    <div className="text-xs text-slate-500">ลำดับ: {s.sort_order}</div>
                </div>
                {s.subtitle && <div className="text-sm text-slate-600 line-clamp-2 mt-0.5">{s.subtitle}</div>}
                <div className="text-xs text-slate-500 mt-1">
                    CTA: {s.cta_text || "-"} → {s.cta_link || "-"}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    <button className="act-btn" onClick={() => onEdit(s)}>แก้ไข</button>
                    <button className={`act-btn ${s.is_active ? "sky" : "indigo"}`} onClick={() => onToggle(s)}>
                        {s.is_active ? "ปิดการแสดงผล" : "เปิดการแสดงผล"}
                    </button>
                    <button className="act-btn red" onClick={() => onRemove(s)}>ลบ</button>

                    <div className="ml-auto flex gap-2">
                        <button className="act-btn" onClick={() => onMoveUp(s)}>↑ ขึ้น</button>
                        <button className="act-btn" onClick={() => onMoveDown(s)}>↓ ลง</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditSlideModal({ open, onClose, onSaved, initial }) {
    const isEdit = !!initial?.id;
    const { authHeader } = useAuth();

    const [form, setForm] = useState({
        title: "",
        subtitle: "",
        cta_text: "",
        cta_link: "#",
        image_path: "",
        is_active: 1,
    });

    useEffect(() => {
        if (open) {
            setForm({
                title: initial?.title || "",
                subtitle: initial?.subtitle || "",
                cta_text: initial?.cta_text || "",
                cta_link: initial?.cta_link || "#",
                image_path: initial?.image_path || "",
                is_active: initial?.is_active ?? 1,
            });
        }
    }, [open, initial]);

    const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    async function uploadImg(file) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`${API_URL}/api/v1/admin/upload`, {
            method: "POST",
            headers: { ...authHeader() }, // no content-type (browser sets)
            body: fd,
        });
        if (!res.ok) throw new Error(`อัปโหลดรูปไม่สำเร็จ (${res.status})`);
        const js = await res.json();
        return js.path; // /uploads/xxx.ext
    }

    async function submit() {
        try {
            const payload = { ...form, is_active: form.is_active ? 1 : 0 };
            const url = isEdit
                ? `${API_URL}/api/v1/admin/home-slides/${initial.id}`
                : `${API_URL}/api/v1/admin/home-slides`;
            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`${isEdit ? "อัปเดต" : "สร้าง"} สไลด์ล้มเหลว (${res.status})`);
            await res.json();
            Swal.fire({ icon: "success", title: isEdit ? "บันทึกแล้ว" : "เพิ่มสไลด์แล้ว", timer: 900, showConfirmButton: false });
            onClose?.();
            onSaved?.();
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ดำเนินการไม่สำเร็จ" });
        }
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/40 z-[60] grid place-items-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold">{isEdit ? "แก้ไขสไลด์" : "เพิ่มสไลด์"}</div>
                    <button className="h-9 px-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700" onClick={onClose}>ปิด</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field label="หัวเรื่อง">
                            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="ยินดีต้อนรับ..." />
                        </Field>
                        <Field label="ข้อความย่อย">
                            <input className="input" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="ข้อความอธิบายสั้นๆ" />
                        </Field>
                        <Field label="CTA Text">
                            <input className="input" value={form.cta_text} onChange={(e) => set("cta_text", e.target.value)} placeholder="จองตอนนี้" />
                        </Field>
                        <Field label="CTA Link">
                            <input className="input" value={form.cta_link} onChange={(e) => set("cta_link", e.target.value)} placeholder="/booking" />
                        </Field>

                        <label className="inline-flex items-center gap-2">
                            <input type="checkbox" checked={!!form.is_active} onChange={(e) => set("is_active", e.target.checked ? 1 : 0)} />
                            <span className="text-sm">แสดงผล</span>
                        </label>
                    </div>

                    <div>
                        <div className="text-xs text-slate-500 mb-1">รูปภาพ</div>
                        <div className="w-full aspect-[4/3] rounded-xl border border-dashed grid place-items-center overflow-hidden bg-slate-50">
                            {form.image_path ? (
                                <img src={`${API_URL}${form.image_path}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-slate-400 text-sm">ยังไม่มีรูป</div>
                            )}
                        </div>
                        <div className="mt-2 flex gap-2">
                            <label className="btn cursor-pointer">
                                เลือกรูป
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={async (e) => {
                                        const f = e.target.files?.[0];
                                        if (!f) return;
                                        try {
                                            const path = await uploadImg(f);
                                            set("image_path", path);
                                        } catch (err) {
                                            Swal.fire({ icon: "error", title: "อัปโหลดรูปไม่สำเร็จ", text: err.message || "" });
                                        } finally {
                                            e.target.value = "";
                                        }
                                    }}
                                />
                            </label>
                            {form.image_path && (
                                <button className="btn" onClick={() => set("image_path", "")}>ลบรูป</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button className="h-10 px-4 rounded-xl bg-rose-600 text-white hover:bg-rose-700">ยกเลิก</button>
                    <button className="h-10 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700" onClick={submit}>
                        {isEdit ? "บันทึก" : "เพิ่มสไลด์"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function HomeSlides() {
    const { authHeader } = useAuth();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const [q, setQ] = useState("");
    const [active, setActive] = useState("all"); // all|1|0
    const [page, setPage] = useState(1);
    const limit = 20;

    const [openModal, setOpenModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    async function load() {
        setLoading(true); setErr("");
        try {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (active !== "all") params.set("active", active);
            params.set("page", page);
            params.set("limit", limit);

            const res = await fetch(`${API_URL}/api/v1/admin/home-slides?${params.toString()}`, {
                headers: { "Content-Type": "application/json", ...authHeader() },
            });
            if (!res.ok) throw new Error(`โหลดข้อมูลล้มเหลว (${res.status})`);
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
    }

    useEffect(() => { load(); }, [page, active]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    function openCreate() { setEditTarget(null); setOpenModal(true); }
    function openEdit(s) { setEditTarget(s); setOpenModal(true); }

    async function toggleActive(s) {
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/home-slides/${s.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ is_active: s.is_active ? 0 : 1 })
            });
            if (!res.ok) throw new Error(`อัปเดตสถานะไม่สำเร็จ (${res.status})`);
            await res.json();
            await load();
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "" });
        }
    }

    async function remove(s) {
        const ok = await Swal.fire({
            icon: "warning",
            title: "ลบสไลด์นี้?",
            text: s.title || "",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/home-slides/${s.id}`, {
                method: "DELETE",
                headers: authHeader(),
            });
            if (!res.ok) throw new Error(`ลบไม่สำเร็จ (${res.status})`);
            await res.json();
            Swal.fire({ icon: "success", title: "ลบแล้ว", timer: 800, showConfirmButton: false });
            await load();
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "" });
        }
    }

    function moveUp(s) {
        const idx = items.findIndex(x => x.id === s.id);
        if (idx <= 0) return;
        const newList = items.slice();
        [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
        setItems(newList);
        saveOrder(newList);
    }
    function moveDown(s) {
        const idx = items.findIndex(x => x.id === s.id);
        if (idx === -1 || idx >= items.length - 1) return;
        const newList = items.slice();
        [newList[idx + 1], newList[idx]] = [newList[idx], newList[idx + 1]];
        setItems(newList);
        saveOrder(newList);
    }
    async function saveOrder(list) {
        try {
            const ids = list.map(x => x.id);
            const res = await fetch(`${API_URL}/api/v1/admin/home-slides/reorder`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ ids })
            });
            if (!res.ok) throw new Error(`บันทึกลำดับไม่สำเร็จ (${res.status})`);
            await res.json();
            await load(); // sync sort_order
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "" });
        }
    }

    function onSaved() { setOpenModal(false); load(); }

    return (
        <Boiler title="สไลด์หน้าแรก">
            <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <input className="input" placeholder="ค้นหา (หัวเรื่อง/ข้อความ/ลิงก์)" value={q} onChange={(e) => setQ(e.target.value)} />
                <select className="input" value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}>
                    <option value="all">ทั้งหมด</option>
                    <option value="1">แสดงผล</option>
                    <option value="0">ปิดการแสดงผล</option>
                </select>
                <div className="md:col-span-2 flex gap-2">
                    <button className="btn bg-red-500 text-white">ค้นหา</button>
                    <button type="button" className="btn" onClick={() => { setQ(""); setActive("all"); setPage(1); }}>
                        ล้างตัวกรอง
                    </button>
                    <button type="button" className="btn bg-green-500 text-white ml-auto" onClick={openCreate}>+ เพิ่มสไลด์</button>
                </div>
            </form>

            <div className="grid gap-3">
                {loading && <div className="text-slate-500">กำลังโหลด…</div>}
                {!loading && err && <div className="text-amber-600">ผิดพลาด: {err}</div>}
                {!loading && !err && items.length === 0 && <div className="text-slate-500">ไม่มีข้อมูล</div>}
                {!loading && !err && items.map(s => (
                    <SlideCard
                        key={s.id}
                        s={s}
                        onEdit={openEdit}
                        onToggle={toggleActive}
                        onRemove={remove}
                        onMoveUp={moveUp}
                        onMoveDown={moveDown}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-3 flex items-center gap-2">
                    <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>ก่อนหน้า</button>
                    <div className="px-3 text-sm text-slate-600">หน้า {page} / {totalPages}</div>
                    <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>ถัดไป</button>
                </div>
            )}

            {/* modal */}
            <EditSlideModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSaved={onSaved}
                initial={editTarget}
            />
        </Boiler>
    );
}

const styles = `
.input {
  @apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500;
}
.btn { @apply h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50; }
.btn-primary { @apply h-10 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700; }
.act-btn { @apply h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors; }
.act-btn.indigo { @apply bg-indigo-600 text-white hover:bg-indigo-700 border-transparent shadow-sm; }
.act-btn.sky { @apply bg-sky-600 text-white hover:bg-sky-700 border-transparent shadow-sm; }
.act-btn.red { @apply bg-rose-600 text-white hover:bg-rose-700 border-transparent shadow-sm; }
`;
if (typeof document !== "undefined") {
    let style = document.getElementById("homeslides-tailwind-inline");
    if (!style) {
        style = document.createElement("style");
        style.id = "homeslides-tailwind-inline";
        document.head.appendChild(style);
    }
    style.innerHTML = styles;
}
