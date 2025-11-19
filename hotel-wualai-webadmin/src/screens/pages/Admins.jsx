import React, { useEffect, useState } from "react";
import Boiler from "./_Boiler";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const btn =
  "h-10 px-3 rounded-xl border border-slate-300 bg-slate-100 !text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const btnPrimary =
  "h-10 px-4 rounded-xl !bg-indigo-600 !text-white hover:!bg-indigo-700 active:!bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
const actBtnBase =
  "h-9 px-3 rounded-lg border bg-white !text-slate-900 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2";
const actIndigo = "border-indigo-400 hover:bg-indigo-50 focus-visible:ring-indigo-300";
const actSky = "border-sky-400 hover:bg-sky-50 focus-visible:ring-sky-300";
const actNeutral = "border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300";

function RolesModal({ open, onClose, onSaved, admin, roles }) {
  const [sel, setSel] = useState([]);
  useEffect(() => {
    if (open) setSel(admin?.roles?.map(r => r.code) || []);
  }, [open, admin]);

  async function submit() {
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/admins/${admin.id}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...onSaved.authHeader() },
        body: JSON.stringify({ roles: sel }),
      });
      if (!res.ok) throw new Error(`อัปเดตบทบาทไม่สำเร็จ (${res.status})`);
      await res.json();
      Swal.fire({ icon: "success", title: "อัปเดตบทบาทแล้ว", timer: 900, showConfirmButton: false });
      onClose?.();
      onSaved.refresh();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ดำเนินการไม่สำเร็จ" });
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
        <div className="text-lg font-semibold mb-3">กำหนดบทบาท — {admin?.email}</div>
        <div className="rounded-xl border border-slate-200 p-2 max-h-64 overflow-auto">
          {roles.map((r) => (
            <label key={r.id} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={sel.includes(r.code)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSel(checked ? Array.from(new Set([...sel, r.code])) : sel.filter((x) => x !== r.code));
                }}
              />
              <span>
                {r.code} <span className="text-slate-500">— {r.name}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className={btn} onClick={onClose}>ยกเลิก</button>
          <button className={btnPrimary} onClick={submit}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}


const Badge = ({ s }) => {
  const map = {
    active: "bg-emerald-50 text-emerald-700",
    suspended: "bg-rose-50 text-rose-700",
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

function AdminEditModal({ open, onClose, onSaved, initial, roles }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    email: "", password: "", full_name: "", phone: "", status: "active", roles: ["staff"]
  });

  useEffect(() => {
    if (open) {
      setForm({
        email: initial?.email || "",
        password: "",
        full_name: initial?.full_name || "",
        phone: initial?.phone || "",
        status: initial?.status || "active",
        roles: (initial?.roles?.map(r => r.code) || ["staff"])
      });
    }
  }, [open, initial]);

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  async function submit() {
    try {
      const payload = {
        email: form.email,
        full_name: form.full_name || null,
        phone: form.phone || null,
        status: form.status,
        roles: Array.isArray(form.roles) ? form.roles : [],
        ...(isEdit ? {} : { password: form.password })
      };
      if (!isEdit && (!form.password || form.password.length < 6)) {
        return Swal.fire({ icon: "warning", title: "รหัสผ่านสั้นเกินไป (≥ 6)" });
      }

      const url = isEdit
        ? `${API_URL}/api/v1/admin/admins/${initial.id}`
        : `${API_URL}/api/v1/admin/admins`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json", ...onSaved.authHeader() },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`${isEdit ? "อัปเดต" : "สร้าง"}ผู้ดูแล ล้มเหลว (${res.status})`);
      await res.json();
      Swal.fire({ icon: "success", title: isEdit ? "บันทึกแล้ว" : "สร้างแล้ว", timer: 900, showConfirmButton: false });
      onClose?.(); onSaved.refresh();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ดำเนินการไม่สำเร็จ" });
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-5">
        <div className="text-lg font-semibold mb-3">{isEdit ? "แก้ไขผู้ดูแล" : "เพิ่มผู้ดูแล"}</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="อีเมล">
            <input className="input" value={form.email} onChange={e => set("email", e.target.value)} placeholder="admin@hotel.com" />
          </Field>
          {!isEdit && (
            <Field label="รหัสผ่าน (อย่างน้อย 6)">
              <input className="input" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" />
            </Field>
          )}
          <Field label="ชื่อ-สกุล">
            <input className="input" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
          </Field>
          <Field label="โทรศัพท์">
            <input className="input" value={form.phone} onChange={e => set("phone", e.target.value)} />
          </Field>
          <Field label="สถานะ">
            <select className="input" value={form.status} onChange={e => set("status", e.target.value)}>
              <option value="active">active</option>
              <option value="suspended">suspended</option>
            </select>
          </Field>
          <Field label="บทบาท (เลือกได้หลายรายการ)">
            <div className="rounded-xl border border-slate-200 p-2 max-h-32 overflow-auto">
              {roles.map(r => (
                <label key={r.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={form.roles.includes(r.code)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      set("roles", checked
                        ? Array.from(new Set([...form.roles, r.code]))
                        : form.roles.filter(x => x !== r.code)
                      );
                    }}
                  />
                  <span>{r.code} <span className="text-slate-500">— {r.name}</span></span>
                </label>
              ))}
            </div>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className={btn} onClick={onClose}>ยกเลิก</button>
          <button className={btnPrimary} onClick={submit}>{isEdit ? "บันทึก" : "เพิ่มผู้ดูแล"}</button>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ open, onClose, onSaved, adminId }) {
  const [pwd, setPwd] = useState("");
  async function submit() {
    try {
      if (!pwd || pwd.length < 6) return Swal.fire({ icon: "warning", title: "รหัสผ่านสั้นเกินไป (≥ 6)" });
      const res = await fetch(`${API_URL}/api/v1/admin/admins/${adminId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...onSaved.authHeader() },
        body: JSON.stringify({ new_password: pwd })
      });
      if (!res.ok) throw new Error(`เปลี่ยนรหัสผ่านไม่สำเร็จ (${res.status})`);
      await res.json();
      Swal.fire({ icon: "success", title: "เปลี่ยนรหัสผ่านแล้ว", timer: 900, showConfirmButton: false });
      onClose?.(); onSaved.refresh();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ดำเนินการไม่สำเร็จ" });
    }
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
        <div className="text-lg font-semibold mb-3">เปลี่ยนรหัสผ่าน</div>
        <Field label="รหัสผ่านใหม่">
          <input className="input" type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <button className={btn} onClick={onClose}>ยกเลิก</button>
          <button className={btnPrimary} onClick={submit}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}

function StatusModal({ open, onClose, current = "active", email, onConfirm }) {
  const [val, setVal] = useState(current);
  useEffect(() => { if (open) setVal(current); }, [open, current]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5">
        <div className="text-lg font-semibold mb-1">เปลี่ยนสถานะผู้ดูแล</div>
        <div className="text-sm text-slate-500 mb-3 break-all">{email}</div>
        <div className="space-y-2">
          {["active", "suspended"].map(s => (
            <label key={s} className="flex items-center gap-2">
              <input type="radio" name="admin-status" value={s} checked={val === s} onChange={() => setVal(s)} />
              <span className="capitalize">{s}</span>
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className={btn} onClick={onClose}>ยกเลิก</button>
          <button className={btnPrimary} onClick={() => onConfirm?.(val)}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminsPage() {
  const { authHeader } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [roles, setRoles] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("%");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdTarget, setPwdTarget] = useState(null);

  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesTarget, setRolesTarget] = useState(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  async function loadRoles() {
    const res = await fetch(`${API_URL}/api/v1/admin/admins/roles/list`, { headers: authHeader() });
    const js = await res.json();
    setRoles(js || []);
  }

  async function load() {
    setLoading(true); setErr("");
    try {
      const params = new URLSearchParams();
      params.set("status", status);
      if (q) params.set("q", q);
      params.set("page", page);
      params.set("limit", limit);
      const res = await fetch(`${API_URL}/api/v1/admin/admins?${params.toString()}`, {
        headers: { "Content-Type": "application/json", ...authHeader() }
      });
      if (!res.ok) throw new Error(`โหลดรายการล้มเหลว (${res.status})`);
      const js = await res.json();
      setItems(js.items || []); setTotal(js.total || 0);
    } catch (e) {
      console.error(e); setErr(e.message || "เกิดข้อผิดพลาด"); setItems([]); setTotal(0);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadRoles(); }, []);
  useEffect(() => { load(); }, [status, page]);

  function doSearch(e) { e?.preventDefault?.(); setPage(1); load(); }

  async function changeStatus(a, newStatus) {
    const ok = await Swal.fire({ icon: "question", title: `เปลี่ยนเป็น ${newStatus}?`, showCancelButton: true, confirmButtonText: "ยืนยัน" });
    if (!ok.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/admins/${a.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error(`เปลี่ยนสถานะไม่สำเร็จ (${res.status})`);
      await res.json();
      Swal.fire({ icon: "success", title: "อัปเดตแล้ว", timer: 800, showConfirmButton: false });
      load();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "อัปเดตไม่สำเร็จ" });
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Boiler title="ผู้ดูแลระบบ (Admins)">
      <form onSubmit={doSearch} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <input className="input" placeholder="ค้นหา (อีเมล/ชื่อ/โทร)" value={q} onChange={e => setQ(e.target.value)} />
        <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="%">สถานะทั้งหมด</option>
          <option value="active">active</option>
          <option value="suspended">suspended</option>
        </select>
        <button className={btnPrimary}>ค้นหา</button>
        <div className="text-right">
          <button type="button" className={btnPrimary} onClick={() => { setEditTarget(null); setEditOpen(true); }}>+ เพิ่มผู้ดูแล</button>
        </div>
      </form>

      <div className="mb-3 text-sm text-slate-500">ทั้งหมด {total} รายการ</div>

      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-x-auto overflow-y-visible relative">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="px-3 py-2 border-b">อีเมล</th>
              <th className="px-3 py-2 border-b">ชื่อ</th>
              <th className="px-3 py-2 border-b">โทร</th>
              <th className="px-3 py-2 border-b">บทบาท</th>
              <th className="px-3 py-2 border-b">สถานะ</th>
              <th className="px-3 py-2 border-b text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">กำลังโหลด…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">ไม่มีข้อมูล</td></tr>}
            {!loading && items.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 border-b font-semibold">{a.email}</td>
                <td className="px-3 py-2 border-b">{a.full_name || "-"}</td>
                <td className="px-3 py-2 border-b">{a.phone || "-"}</td>
                <td className="px-3 py-2 border-b">
                  {(a.roles || []).length ? a.roles.map(r => (
                    <span key={r.code} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 mr-1">{r.code}</span>
                  )) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-3 py-2 border-b"><Badge s={a.status} /></td>
                <td className="px-3 py-2 border-b relative">
                  <div className="flex gap-2 justify-end flex-wrap">
                    <button className={`${actBtnBase} ${actIndigo}`} onClick={() => { setEditTarget(a); setEditOpen(true); }}>แก้ไข</button>
                    <button className={`${actBtnBase} ${actSky}`} onClick={() => { setPwdTarget(a.id); setPwdOpen(true); }}>รหัสผ่าน</button>
                    <button className={`${actBtnBase} ${actNeutral}`} onClick={() => { setRolesTarget(a); setRolesOpen(true); }}>บทบาท</button>
                    <button className={`${actBtnBase} ${actNeutral}`} onClick={() => { setStatusTarget(a); setStatusOpen(true); }}>สถานะ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <button className={btn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>ก่อนหน้า</button>
          <div className="px-3 text-sm text-slate-600">หน้า {page} / {totalPages}</div>
          <button className={btn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>ถัดไป</button>
        </div>
      )}

      <AdminEditModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={{ authHeader, refresh: load }} initial={editTarget} roles={roles} />
      <PasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} onSaved={{ authHeader, refresh: load }} adminId={pwdTarget} />
      <RolesModal open={rolesOpen} onClose={() => setRolesOpen(false)} onSaved={{ authHeader, refresh: load }} admin={rolesTarget} roles={roles} />
      <StatusModal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        current={statusTarget?.status}
        email={statusTarget?.email}
        onConfirm={(val) => {
          if (statusTarget) changeStatus(statusTarget, val);
          setStatusOpen(false);
        }}
      />

      <StyleInject />
    </Boiler>
  );
}

function StyleInject() {
  const css = `
.input{
  @apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500;
}
`;
  if (typeof document !== "undefined" && !document.getElementById("admins-style")) {
    const el = document.createElement("style"); el.id = "admins-style"; el.innerHTML = css; document.head.appendChild(el);
  }
  return null;
}
