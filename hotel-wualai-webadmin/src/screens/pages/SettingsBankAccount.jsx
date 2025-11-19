import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const BANKS = [
  { value: "", label: "เลือกธนาคารของท่าน ..." },
  { value: "kbank", label: "กสิกร" },
  { value: "scb", label: "ไทยพาณิชย์" },
  { value: "bbl", label: "กรุงเทพ" },
  { value: "ktb", label: "กรุงไทย" },
  { value: "ttb", label: "ทหารไทยธนชาต" },
  { value: "bay", label: "กรุงศรีอยุธยา" },
  { value: "gsb", label: "ออมสิน" },
  { value: "uob", label: "ยูโอบี" },
  { value: "baac", label: "ธกส" },
  { value: "cimb", label: "ซีไอเอ็มบี" },
  { value: "gh", label: "อาคารสงเคราะห์" },
  { value: "kkp", label: "เกียรตินาคิน" },
];

function bankLabelFromCode(code = "") {
  const found = BANKS.find((b) => b.value === String(code).toLowerCase());
  return found?.label || code || "-";
}

const btn =
  "h-10 px-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

const btnPrimary =
  "h-10 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

const actBtnBase =
  "h-9 px-3 rounded-lg border bg-white !text-slate-900 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2";

const actIndigo = "border-indigo-400 hover:bg-indigo-50 focus-visible:ring-indigo-300";
const actSky = "border-sky-400 hover:bg-sky-50 focus-visible:ring-sky-300";
const actRed = "border-rose-400 hover:bg-rose-50 focus-visible:ring-rose-300";


const Badge = ({ children, tone = "slate" }) => {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
};
const Field = ({ label, children }) => (
  <label className="block">
    <div className="text-xs text-slate-500 mb-1">{label}</div>
    {children}
  </label>
);

function EditModal({ open, onClose, onSaved, initial }) {
  const { authHeader } = useAuth();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState({
    bank_code: (initial?.bank_code || "").toLowerCase(),
    bank_name: initial?.bank_name || "",
    account_name: initial?.account_name || "",
    account_number: initial?.account_number || "",
    is_active: initial?.is_active ?? 1,
    is_default: initial?.is_default ?? 0,
    sort_order: initial?.sort_order ?? 0,
  });

  useEffect(() => {
    if (!open) return;
    const code = (initial?.bank_code || "").toLowerCase();
    setForm({
      bank_code: code,
      bank_name: initial?.bank_name || bankLabelFromCode(code) || "",
      account_name: initial?.account_name || "",
      account_number: initial?.account_number || "",
      is_active: initial?.is_active ?? 1,
      is_default: initial?.is_default ?? 0,
      sort_order: initial?.sort_order ?? 0,
    });
  }, [open, initial]);

  function set(k, v) { setForm((s) => ({ ...s, [k]: v })); }
  function onChangeBank(e) {
    const code = e.target.value.toLowerCase();
    setForm((s) => ({ ...s, bank_code: code, bank_name: bankLabelFromCode(code) }));
  }

  async function submit() {
    try {
      if (!form.bank_code) throw new Error("กรุณาเลือกธนาคาร");
      if (!form.account_name) throw new Error("กรุณากรอกชื่อบัญชี");
      if (!form.account_number) throw new Error("กรุณากรอกเลขที่บัญชี");

      const payload = {
        bank_code: form.bank_code,
        bank_name: form.bank_name || bankLabelFromCode(form.bank_code),
        account_name: form.account_name,
        account_number: form.account_number,
        is_active: Number(form.is_active) ? 1 : 0,
        is_default: Number(form.is_default) ? 1 : 0,
        sort_order: Number(form.sort_order) || 0,
      };

      const url = isEdit
        ? `${API_URL}/api/v1/admin/bank-accounts/${initial.id}`
        : `${API_URL}/api/v1/admin/bank-accounts`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`${isEdit ? "อัปเดต" : "เพิ่ม"}บัญชีไม่สำเร็จ (${res.status})`);
      await res.json();
      Swal.fire({ icon: "success", title: isEdit ? "บันทึกแล้ว" : "เพิ่มบัญชีแล้ว", timer: 900, showConfirmButton: false });
      onClose?.();
      onSaved?.();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ดำเนินการไม่สำเร็จ" });
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl p-5">
        <div className="text-lg font-semibold mb-3">{isEdit ? "แก้ไขบัญชีธนาคาร" : "เพิ่มบัญชีธนาคาร"}</div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="ธนาคาร">
            <select className="h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
              value={form.bank_code} onChange={onChangeBank}>
              {BANKS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label || "—"}{b.value ? ` (${b.value.toUpperCase()})` : ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="ชื่อธนาคาร (กำหนดอัตโนมัติ)">
            <input className="h-10 px-3 rounded-xl border border-gray-300/90 bg-slate-50 text-gray-900" value={form.bank_name} readOnly />
          </Field>

          <Field label="ชื่อบัญชี">
            <input className="h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900"
              value={form.account_name} onChange={(e) => set("account_name", e.target.value)} />
          </Field>

          <Field label="เลขที่บัญชี">
            <input className="h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900"
              inputMode="numeric" value={form.account_number} onChange={(e) => set("account_number", e.target.value)} />
          </Field>

          <Field label="ลำดับ (sort)">
            <input className="h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900"
              type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
          </Field>

          <Field label="สถานะ">
            <select className="h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900"
              value={form.is_active} onChange={(e) => set("is_active", e.target.value)}>
              <option value={1}>active</option>
              <option value={0}>inactive</option>
            </select>
          </Field>

          <Field label="ตั้งเป็นบัญชีหลัก (default)">
            <select className="h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900"
              value={form.is_default} onChange={(e) => set("is_default", e.target.value)}>
              <option value={0}>ไม่ใช่</option>
              <option value={1}>ใช่</option>
            </select>
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className={btn} onClick={onClose}>ยกเลิก</button>
          <button className={btnPrimary} onClick={submit}>{isEdit ? "บันทึก" : "เพิ่มบัญชี"}</button>
        </div>
      </div>
    </div>
  );
}

export default function BankAccountsPage() {
  const { authHeader } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", page);
      params.set("limit", limit);

      const res = await fetch(`${API_URL}/api/v1/admin/bank-accounts?${params.toString()}`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (!res.ok) throw new Error(`โหลดรายการล้มเหลว (${res.status})`);
      const js = await res.json();
      setItems(js.items || []);
      setTotal(js.total || 0);
    } catch (e) {
      console.error(e);
      setItems([]); setTotal(0);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [page]);

  function openCreate() { setEditTarget(null); setModalOpen(true); }
  function openEdit(it) { setEditTarget(it); setModalOpen(true); }

  async function setDefault(it) {
    const ok = await Swal.fire({ icon: "question", title: `ตั้ง ${it.bank_name} • ${it.account_number} เป็นบัญชีหลัก?`, showCancelButton: true });
    if (!ok.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/bank-accounts/${it.id}/default`, {
        method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (!res.ok) throw new Error(`ตั้งค่าไม่สำเร็จ (${res.status})`);
      await res.json();
      Swal.fire({ icon: "success", title: "ตั้งเป็นบัญชีหลักแล้ว", timer: 900, showConfirmButton: false });
      load();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ไม่สำเร็จ" });
    }
  }

  async function toggleActive(it, toActive) {
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/bank-accounts/${it.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ is_active: toActive ? 1 : 0 }),
      });
      if (!res.ok) throw new Error(`อัปเดตสถานะไม่สำเร็จ (${res.status})`);
      await res.json();
      load();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ไม่สำเร็จ" });
    }
  }

  async function remove(it) {
    const ok = await Swal.fire({ icon: "warning", title: `ลบบัญชี ${it.bank_name}?`, showCancelButton: true });
    if (!ok.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/bank-accounts/${it.id}`, {
        method: "DELETE", headers: authHeader(),
      });
      if (!res.ok) throw new Error(`ลบไม่สำเร็จ (${res.status})`);
      await res.json();
      load();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ลบไม่สำเร็จ" });
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Boiler title="บัญชีธนาคารสำหรับโอนเงิน">
      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}
        className="mb-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2"
      >
        <input
          className="h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500"
          placeholder="ค้นหา (ธนาคาร/ชื่อบัญชี/เลขบัญชี)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className={btnPrimary}>ค้นหา</button>
      </form>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-slate-500">ทั้งหมด {total} รายการ</div>
        <div className="flex gap-2">
          <button className={btn} onClick={load}>รีเฟรช</button>
          <button className={btnPrimary} onClick={openCreate}>+ เพิ่มบัญชี</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="px-3 py-2 border-b">ธนาคาร</th>
              <th className="px-3 py-2 border-b">ชื่อบัญชี</th>
              <th className="px-3 py-2 border-b">เลขที่บัญชี</th>
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
            {!loading && items.map((it) => (
              <tr key={it.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 border-b">
                  <div className="font-semibold">{bankLabelFromCode(it.bank_code)}</div>
                  <div className="text-xs text-slate-500">{(it.bank_code || "").toString().toUpperCase()}</div>
                </td>
                <td className="px-3 py-2 border-b">{it.account_name}</td>
                <td className="px-3 py-2 border-b">{it.account_number}</td>
                <td className="px-3 py-2 border-b">
                  <div className="flex items-center gap-2">
                    {it.is_active ? <Badge tone="green">active</Badge> : <Badge>inactive</Badge>}
                    {it.is_default ? <Badge tone="violet">default</Badge> : null}
                  </div>
                </td>
                <td className="px-3 py-2 border-b">
                  <div className="flex flex-wrap gap-2 justify-end">
                    {!it.is_default && (
                      <button className={actBtnBase} onClick={() => setDefault(it)}>ตั้งเป็นหลัก</button>
                    )}
                    <button className={`${actBtnBase} ${actIndigo}`} onClick={() => openEdit(it)}>แก้ไข</button>
                    <button className={`${actBtnBase} ${actSky}`} onClick={() => toggleActive(it, !it.is_active)}>
                      {it.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    </button>
                    <button className={`${actBtnBase} ${actRed}`} onClick={() => remove(it)}>ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <button className={btn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>ก่อนหน้า</button>
          <div className="px-3 text-sm text-slate-600">หน้า {page} / {totalPages}</div>
          <button className={btn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>ถัดไป</button>
        </div>
      )}

      <EditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        initial={editTarget}
      />
    </Boiler>
  );
}
