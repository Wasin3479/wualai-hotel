import React, { useEffect, useState } from "react";
import Boiler from "./_Boiler";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const btn =
  "h-10 px-3 rounded-xl border border-slate-300 bg-slate-100 !text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";
const btnPrimary =
  "h-10 px-4 rounded-xl !bg-violet-600 !text-white hover:!bg-violet-700 active:!bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";
const actBtnBase =
  "h-9 px-3 rounded-lg border bg-white !text-slate-900 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2";
const actIndigo = "border-indigo-400 hover:bg-indigo-50 focus-visible:ring-indigo-300";
const actRed    = "border-rose-400 hover:bg-rose-50 focus-visible:ring-rose-300";

const Field = ({ label, children }) => (
  <label className="block">
    <div className="text-xs text-slate-500 mb-1">{label}</div>
    {children}
  </label>
);

export default function AdminRolesPage(){
  const { authHeader } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  async function load(){
    setLoading(true); setErr("");
    try{
      const res = await fetch(`${API_URL}/api/v1/admin/admins/roles/list`, { headers: authHeader() });
      const raw = await res.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}
      if(!res.ok){
        const msg = (data && (data.message || data.error)) || raw || `โหลดรายการล้มเหลว (${res.status})`;
        throw new Error(msg);
      }
      setItems(Array.isArray(data) ? data : (data?.items || []));
    }catch(e){
      console.error("GET /admins/roles/list failed:", e);
      setErr(e.message || "เกิดข้อผิดพลาด"); setItems([]);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  function openCreate(){ setEdit(null); setModalOpen(true); }
  function openEdit(r){ setEdit(r); setModalOpen(true); }

  async function remove(r){
    const ok = await Swal.fire({ icon:"warning", title:`ลบบทบาท ${r.code}?`, text:"(จะลบ mapping ที่เกี่ยวข้องด้วย)", showCancelButton:true, confirmButtonText:"ยืนยัน" });
    if(!ok.isConfirmed) return;
    try{
      const res = await fetch(`${API_URL}/api/v1/admin/admins/roles/${r.id}`, {
        method:"DELETE", headers: authHeader()
      });
      if(!res.ok) throw new Error(`ลบไม่สำเร็จ (${res.status})`);
      await res.json();
      Swal.fire({ icon:"success", title:"ลบแล้ว", timer:900, showConfirmButton:false });
      load();
    }catch(e){
      console.error(e);
      Swal.fire({ icon:"error", title:"ผิดพลาด", text:e.message||"ลบไม่สำเร็จ" });
    }
  }

  return (
    <Boiler title="บทบาท (RBAC)">
      {err && (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2">
          ผิดพลาด: {err}
          <button className="ml-2 underline" type="button" onClick={load}>ลองใหม่</button>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-slate-500">ทั้งหมด {items.length} บทบาท</div>
        <div className="flex gap-2">
          <button className={btn} onClick={load}>รีเฟรช</button>
          <button className={btnPrimary} onClick={openCreate}>+ เพิ่มบทบาท</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-x-auto overflow-y-visible relative">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="px-3 py-2 border-b">code</th>
              <th className="px-3 py-2 border-b">name</th>
              <th className="px-3 py-2 border-b text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-slate-500">กำลังโหลด…</td>
              </tr>
            )}
            {!loading && items.length===0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-slate-500">ไม่มีข้อมูล</td>
              </tr>
            )}
            {!loading && items.map(r=>(
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 border-b font-semibold">{r.code}</td>
                <td className="px-3 py-2 border-b">{r.name}</td>
                <td className="px-3 py-2 border-b">
                  <div className="flex gap-2 justify-end">
                    <button className={`${actBtnBase} ${actIndigo}`} onClick={()=>openEdit(r)}>แก้ไข</button>
                    <button className={`${actBtnBase} ${actRed}`} onClick={()=>remove(r)}>ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RoleModal
        open={modalOpen}
        onClose={()=>setModalOpen(false)}
        onSaved={{authHeader, refresh: load}}
        initial={edit}
      />

      <StyleInject />
    </Boiler>
  );
}

function RoleModal({ open, onClose, onSaved, initial }) {
  const isEdit = !!initial?.id;
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  useEffect(()=>{
    if(open){
      setCode(initial?.code || "");
      setName(initial?.name || "");
    }
  },[open, initial]);

  async function submit(){
    try{
      if(!name || (!isEdit && !code)) {
        return Swal.fire({ icon:"warning", title:"กรอกข้อมูลให้ครบ" });
      }
      const url = isEdit
        ? `${API_URL}/api/v1/admin/admins/roles/${initial.id}`
        : `${API_URL}/api/v1/admin/admins/roles`;
      const method = isEdit ? "PATCH" : "POST";
      const payload = { code, name };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type":"application/json", ...onSaved.authHeader() },
        body: JSON.stringify(payload)
      });

      const raw = await res.text();
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}

      if(!res.ok){
        const msg = (data && (data.message || data.error)) || raw || `${isEdit?"อัปเดต":"สร้าง"}บทบาทล้มเหลว (${res.status})`;
        throw new Error(msg);
      }

      Swal.fire({ icon:"success", title: isEdit?"บันทึกแล้ว":"สร้างแล้ว", timer:900, showConfirmButton:false });
      onClose?.(); onSaved.refresh();
    }catch(e){
      console.error(e);
      Swal.fire({ icon:"error", title:"ผิดพลาด", text:e.message||"ดำเนินการไม่สำเร็จ" });
    }
  }

  if(!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
        <div className="text-lg font-semibold mb-3">{isEdit?"แก้ไขบทบาท":"เพิ่มบทบาท"}</div>
        <div className="grid grid-cols-1 gap-3">
          <Field label="code (เช่น superadmin / manager / staff)">
            <input
              className="input"
              value={code}
              onChange={e=>setCode(e.target.value)}
              placeholder="manager"
              disabled={isEdit}
            />
          </Field>
          <Field label="name">
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Manager" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className={btn} onClick={onClose}>ยกเลิก</button>
          <button className={btnPrimary} onClick={submit}>{isEdit?"บันทึก":"เพิ่มบทบาท"}</button>
        </div>
      </div>
    </div>
  );
}

function StyleInject(){
  const css = `
  .input{
    @apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400
           outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500;
  }
  `;
  if (typeof document!=="undefined" && !document.getElementById("roles-style")) {
    const el=document.createElement("style"); el.id="roles-style"; el.innerHTML=css; document.head.appendChild(el);
  }
  return null;
}
