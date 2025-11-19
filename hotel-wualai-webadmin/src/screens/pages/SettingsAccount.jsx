import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const btn =
  "h-10 px-3 rounded-xl border border-slate-300 bg-slate-100 !text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const btnPrimary =
  "h-10 px-4 rounded-xl !bg-indigo-600 !text-white hover:!bg-indigo-700 active:!bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

export default function MyAccount() {
  const { authHeader, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ email: "", full_name: "", phone: "" });
  const [pwd, setPwd] = useState({ new_password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  function setF(k, v) { setForm((s) => ({ ...s, [k]: v })); }
  function setP(k, v) { setPwd((s) => ({ ...s, [k]: v })); }

  async function loadMe() {
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/settings/me`, {
        headers: { "Content-Type": "application/json", ...authHeader() }
      });
      if (!res.ok) throw new Error(`โหลดข้อมูลล้มเหลว (${res.status})`);
      const js = await res.json();
      setMe(js);
      setForm({
        email: js.email || "",
        full_name: js.full_name || "",
        phone: js.phone || "",
      });
    } catch (e) {
      console.error(e);
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally { setLoading(false); }
  }

  async function saveProfile() {
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/v1/admin/settings/me/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.message || `บันทึกไม่สำเร็จ (${res.status})`);
      }
      await loadMe();
      Swal.fire({ icon: "success", title: "บันทึกโปรไฟล์แล้ว", timer: 900, showConfirmButton: false });
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "บันทึกไม่สำเร็จ" });
    } finally { setSaving(false); }
  }

  async function changePassword() {
    if (!pwd.new_password || pwd.new_password.length < 6) {
      return Swal.fire({ icon: "warning", title: "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร" });
    }
    if (pwd.new_password !== pwd.confirm) {
      return Swal.fire({ icon: "warning", title: "รหัสผ่านใหม่ไม่ตรงกัน" });
    }
    try {
      setSavingPwd(true);
      const res = await fetch(`${API_URL}/api/v1/admin/settings/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ new_password: pwd.new_password }),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.message || `เปลี่ยนรหัสผ่านไม่สำเร็จ (${res.status})`);
      }
      setPwd({ new_password: "", confirm: "" });
      Swal.fire({ icon: "success", title: "เปลี่ยนรหัสผ่านแล้ว", timer: 900, showConfirmButton: false });
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
    } finally { setSavingPwd(false); }
  }

  useEffect(() => { loadMe(); }, []);

  return (
    <Boiler title="บัญชีของฉัน">
      {loading && <div className="text-slate-500">กำลังโหลด…</div>}
      {!loading && err && <div className="text-amber-600">ผิดพลาด: {err}</div>}
      {!loading && !err && me && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-5">
            <div className="text-lg font-semibold mb-3">ข้อมูลโปรไฟล์</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="อีเมล">
                <input className="input" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="admin@hotel.com" />
              </Field>
              <Field label="ชื่อ-นามสกุล">
                <input className="input" value={form.full_name} onChange={e => setF("full_name", e.target.value)} placeholder="ชื่อที่แสดง" />
              </Field>
              <Field label="เบอร์โทร">
                <input className="input" value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="08x-xxx-xxxx" />
              </Field>
              <Field label="สถานะบัญชี">
                <div className="h-10 px-3 flex items-center">
                  <StatusBadge s={me.status} />
                </div>
              </Field>
            </div>
            <div className="mt-4 flex gap-2">
              <button className={btn} onClick={loadMe}>รีเฟรช</button>
              <button className={btnPrimary} disabled={saving} onClick={saveProfile}>
                {saving ? "กำลังบันทึก…" : "บันทึก"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-5">
            <div className="text-lg font-semibold mb-3">สรุปบัญชี</div>
            <div className="space-y-2 text-sm">
              <div className="text-slate-500">อีเมล</div>
              <div className="font-semibold">{me.email || "-"}</div>
              <div className="text-slate-500 mt-3">ชื่อ</div>
              <div className="font-semibold">{me.full_name || "-"}</div>
              <div className="text-slate-500 mt-3">บทบาท</div>
              <div className="flex flex-wrap gap-2">
                {me.roles?.length
                  ? me.roles.map((r, i) => <span key={i} className="badge">{r.code}</span>)
                  : <span className="text-slate-500">—</span>}
              </div>
              <div className="text-slate-500 mt-3">สร้างเมื่อ</div>
              <div className="font-semibold">
                {me.created_at ? new Date(me.created_at).toLocaleString("th-TH") : "-"}
              </div>
            </div>
          </section>

          <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-5">
            <div className="text-lg font-semibold mb-3">เปลี่ยนรหัสผ่าน</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="รหัสผ่านใหม่">
                <input className="input" type="password" value={pwd.new_password} onChange={e => setP("new_password", e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" />
              </Field>
              <Field label="ยืนยันรหัสผ่านใหม่">
                <input className="input" type="password" value={pwd.confirm} onChange={e => setP("confirm", e.target.value)} placeholder="พิมพ์ซ้ำอีกครั้ง" />
              </Field>
              <div className="flex items-end">
                <button className={btnPrimary} disabled={savingPwd} onClick={changePassword}>
                  {savingPwd ? "กำลังบันทึก…" : "เปลี่ยนรหัสผ่าน"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </Boiler>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      {children}
    </label>
  );
}
function StatusBadge({ s }) {
  const map = {
    active: "bg-emerald-50 text-emerald-700",
    suspended: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-slate-100 text-slate-600"}`}>
      {s || "-"}
    </span>
  );
}

const styles = `
.input {
  @apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500;
}
.badge { @apply inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700; }
`;
if (typeof document !== "undefined" && !document.getElementById("myaccount-tailwind-inline")) {
  const style = document.createElement("style");
  style.id = "myaccount-tailwind-inline";
  style.innerHTML = styles;
  document.head.appendChild(style);
}
