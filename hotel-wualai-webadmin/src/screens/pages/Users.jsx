import React, { useEffect, useMemo, useState } from "react";
import Boiler from "./_Boiler";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";
import { Link } from "react-router-dom";

function TextInput(props) {
    return (
        <input
            {...props}
            className={
                "h-10 px-3 rounded-xl border w-full " +
                "border-gray-300/90 dark:border-gray-700 bg-white dark:bg-gray-900 " +
                "text-gray-900 dark:text-gray-100 placeholder:text-gray-400 " +
                "outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            }
        />
    );
}
function qs(obj = {}) {
    const p = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        p.append(k, v);
    });
    const s = p.toString();
    return s ? `?${s}` : "";
}

export default function Users() {
    const { authReady, isAuthenticated, authHeader } = useAuth();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const limit = 20;

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const [showPwd, setShowPwd] = useState(null);
    const [pwd, setPwd] = useState("");

    async function api(path, { method = "GET", body } = {}) {
        const res = await fetch(`${API_URL}${path}`, {
            method,
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
            const t = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}${t ? `: ${t}` : ""}`);
        }
        return res.json();
    }

    async function load() {
        setLoading(true);
        try {
            const json = await api(`/api/v1/admin/users${qs({ page, limit, q })}`);
            setItems(json.items || []);
            setTotal(json.total || 0);
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "โหลดผู้ใช้ล้มเหลว", text: e.message });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!authReady || !isAuthenticated) return;
        load();
    }, [authReady, isAuthenticated, page]);

    function openCreate() {
        setEditing({ id: null, email: "", full_name: "", phone: "", password: "" });
        setShowForm(true);
    }
    function openEdit(row) {
        setEditing({
            id: row.id,
            email: row.email || "",
            full_name: row.full_name || "",
            phone: row.phone || "",
            password: "",
        });
        setShowForm(true);
    }

    async function saveUser() {
        try {
            if (!editing.id) {
                if (!editing.password || editing.password.length < 6) {
                    return Swal.fire({ icon: "warning", title: "กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัว" });
                }
                await api(`/api/v1/admin/users`, {
                    method: "POST",
                    body: {
                        email: editing.email,
                        password: editing.password,
                        full_name: editing.full_name,
                        phone: editing.phone,
                    },
                });
            } else {
                await api(`/api/v1/admin/users/${editing.id}`, {
                    method: "PATCH",
                    body: {
                        email: editing.email,
                        full_name: editing.full_name,
                        phone: editing.phone,
                    },
                });
            }
            setShowForm(false);
            await load();
            Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 900, showConfirmButton: false });
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: "error", title: "บันทึกล้มเหลว", text: e.message });
        }
    }

    async function submitPassword() {
        try {
            if (!pwd || pwd.length < 6) {
                return Swal.fire({ icon: "warning", title: "รหัสผ่านใหม่อย่างน้อย 6 ตัว" });
            }
            await api(`/api/v1/admin/users/${showPwd}/password`, {
                method: "PATCH",
                body: { new_password: pwd },
            });
            setShowPwd(null);
            setPwd("");
            Swal.fire({ icon: "success", title: "เปลี่ยนรหัสผ่านเรียบร้อย", timer: 900, showConfirmButton: false });
        } catch (e) {
            Swal.fire({ icon: "error", title: "เปลี่ยนรหัสผ่านล้มเหลว", text: e.message });
        }
    }

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

    return (
        <Boiler title="ลูกค้า (Users)">
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
                <div className="md:w-1/3">
                    <label className="block text-sm text-gray-600 mb-1">ค้นหา (ชื่อ/อีเมล/โทร)</label>
                    <div className="flex gap-2">
                        <TextInput placeholder="พิมพ์คำค้น…" value={q} onChange={(e) => setQ(e.target.value)} />
                        <button
                            onClick={() => { setPage(1); load(); }}
                            className="h-10 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            ค้นหา
                        </button>
                    </div>
                </div>

                <div className="md:ml-auto">
                    <button className="h-10 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" onClick={openCreate}>
                        + เพิ่มลูกค้า
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="text-left text-xs text-slate-500">
                            <th className="px-3 py-2 border-b">ชื่อ</th>
                            <th className="px-3 py-2 border-b">อีเมล</th>
                            <th className="px-3 py-2 border-b">โทรศัพท์</th>
                            <th className="px-3 py-2 border-b">สร้างเมื่อ</th>
                            <th className="px-3 py-2 border-b w-48" style={{ width: 280 }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {!loading && items.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 border-b font-medium">{u.full_name || "-"}</td>
                                <td className="px-3 py-2 border-b">{u.email}</td>
                                <td className="px-3 py-2 border-b">{u.phone || "-"}</td>
                                <td className="px-3 py-2 border-b">
                                    {u.created_at ? new Date(u.created_at).toLocaleString("th-TH") : "-"}
                                </td>
                                <td className="px-3 py-2 border-b">
                                    <div className="flex gap-2">
                                        <Link className="px-3 h-9 rounded-lg border hover:bg-gray-50 flex items-center" to={`/users/${u.id}`}>
                                            รายละเอียด
                                        </Link>
                                        <button className="px-3 h-9 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => openEdit(u)}>
                                            แก้ไข
                                        </button>
                                        <button className="px-3 h-9 rounded-lg bg-sky-600 text-white hover:bg-sky-700" onClick={() => setShowPwd(u.id)}>
                                            รหัสผ่าน
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {loading && (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">กำลังโหลด…</td></tr>
                        )}
                        {!loading && items.length === 0 && (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">ไม่พบข้อมูล</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
                <div>ทั้งหมด {total} รายการ</div>
                <div className="flex items-center gap-2">
                    <button className="px-3 h-9 rounded-lg border hover:bg-gray-50 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        ก่อนหน้า
                    </button>
                    <div>หน้า {page}/{totalPages}</div>
                    <button className="px-3 h-9 rounded-lg border hover:bg-gray-50 disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                        ถัดไป
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
                        <div className="text-lg font-semibold mb-4">{editing.id ? "แก้ไขลูกค้า" : "เพิ่มลูกค้า"}</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm text-gray-600">อีเมล</label>
                                <TextInput value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">ชื่อ-นามสกุล</label>
                                <TextInput value={editing.full_name} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">โทรศัพท์</label>
                                <TextInput value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                            </div>

                            {!editing.id && (
                                <div className="md:col-span-2">
                                    <label className="text-sm text-gray-600">รหัสผ่าน (≥ 6 ตัว)</label>
                                    <TextInput type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button className="px-4 h-10 rounded-xl border" onClick={() => setShowForm(false)}>ยกเลิก</button>
                            <button className="px-4 h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700" onClick={saveUser}>
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPwd && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="text-lg font-semibold mb-4">เปลี่ยนรหัสผ่าน</div>
                        <TextInput type="password" placeholder="รหัสผ่านใหม่ (≥ 6 ตัว)" value={pwd} onChange={(e) => setPwd(e.target.value)} />
                        <div className="mt-5 flex justify-end gap-2">
                            <button className="px-4 h-10 rounded-xl border" onClick={() => setShowPwd(null)}>ยกเลิก</button>
                            <button className="px-4 h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700" onClick={submitPassword}>
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Boiler>
    );
}
