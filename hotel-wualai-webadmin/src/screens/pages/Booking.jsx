import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Boiler from "./_Boiler";
import { useAuth } from "../../auth/session.jsx";
import { API_URL } from "../../lib/env.js";

const money0 = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(Number(n || 0));
const money2 = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n || 0));

const StatusBadge = ({ s }) => {
  const map = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-indigo-50 text-indigo-700",
    checked_in: "bg-emerald-50 text-emerald-700",
    checked_out: "bg-slate-100 text-slate-600",
    cancelled: "bg-rose-50 text-rose-700",
    no_show: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-slate-100 text-slate-600"
        }`}
    >
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

function BookingModal({ open, onClose, onSaved, initial, roomTypes, rooms, guests }) {
  const isEdit = !!initial?.id;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    guest_id: "",
    guest: { full_name: "", email: "", phone: "" },
    room_type_id: roomTypes[0]?.id ?? "",
    room_id: "",
    check_in_date: "",
    check_out_date: "",
    adults: 2,
    children: 0,
    status: "pending",
    remarks: "",
    override_total: ""
  });

  useEffect(() => {
    if (open) {
      setForm({
        guest_id: initial?.guest_id || "",
        guest: initial?.guest || { full_name: "", email: "", phone: "" },
        room_type_id: initial?.room_type_id || (roomTypes[0]?.id ?? ""),
        room_id: initial?.room_id || "",
        check_in_date: initial?.check_in_date || "",
        check_out_date: initial?.check_out_date || "",
        adults: initial?.adults ?? 2,
        children: initial?.children ?? 0,
        status: initial?.status || "pending",
        remarks: initial?.remarks || "",
        override_total: initial?.override_total ?? ""
      });
      setSaving(false);
    }
  }, [open, initial, roomTypes]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); if (!saving) onClose?.(); }
      if (e.key === "Enter") {
        const tag = (document.activeElement?.tagName || "").toLowerCase();
        if (tag !== "textarea") { e.preventDefault(); if (!saving) submit(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving]);

  function set(k, v) { setForm(s => ({ ...s, [k]: v })); }

  const canSave =
    (form.guest_id || form.guest.full_name || form.guest.email || form.guest.phone) &&
    form.room_type_id &&
    form.check_in_date &&
    form.check_out_date &&
    !saving;

  async function submit() {
    try {
      setSaving(true);
      const payload = {
        guest_id: form.guest_id || undefined,
        guest: form.guest_id ? undefined : form.guest,
        room_type_id: Number(form.room_type_id),
        room_id: form.room_id ? Number(form.room_id) : null,
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
        adults: Number(form.adults),
        children: Number(form.children),
        remarks: form.remarks || null,
        status: form.status,
        override_total: form.override_total === "" ? null : Number(form.override_total)
      };
      const url = isEdit ? `${API_URL}/api/v1/admin/bookings/${initial.id}` : `${API_URL}/api/v1/admin/bookings`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...onSaved.authHeader() },
        body: JSON.stringify(payload)
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js.message || "ไม่สำเร็จ");

      Swal.fire({ icon: "success", title: isEdit ? "อัปเดตแล้ว" : "สร้างการจองแล้ว", timer: 900, showConfirmButton: false });
      onClose?.();
      onSaved.refresh();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ดำเนินการไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  }

  async function removeBooking() {
    if (!isEdit) return;
    const ok = await Swal.fire({ icon: "warning", title: `ลบการจองนี้?`, text: "การกระทำนี้ไม่สามารถย้อนกลับได้", showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก" });
    if (!ok.isConfirmed) return;
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/v1/admin/bookings/${initial.id}`, {
        method: "DELETE",
        headers: onSaved.authHeader()
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js.message || "ไม่สำเร็จ");
      Swal.fire({ icon: "success", title: "ลบแล้ว", timer: 800, showConfirmButton: false });
      onClose?.();
      onSaved.refresh();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "ลบไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-5">
        <div className="text-lg font-semibold mb-3">{isEdit ? "แก้ไขการจอง" : "สร้างการจอง"}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border p-3">
            <div className="text-xs text-slate-500 mb-2">ลูกค้า</div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="เลือกจากรายชื่อ (ทางลัด)">
                <select className="input"
                  value={form.guest_id}
                  onChange={(e) => set("guest_id", e.target.value)}>
                  <option value="">— ไม่เลือก (กรอกด้านล่าง) —</option>
                  {guests.map(g => <option key={g.id} value={g.id}>{g.full_name || g.email} • {g.phone || "-"}</option>)}
                </select>
              </Field>
              <div />
              <Field label="ชื่อ-สกุล">
                <input className="input" disabled={!!form.guest_id}
                  value={form.guest.full_name}
                  onChange={(e) => set("guest", { ...form.guest, full_name: e.target.value })} />
              </Field>
              <Field label="อีเมล">
                <input className="input" disabled={!!form.guest_id}
                  value={form.guest.email}
                  onChange={(e) => set("guest", { ...form.guest, email: e.target.value })} />
              </Field>
              <Field label="โทรศัพท์">
                <input className="input" disabled={!!form.guest_id}
                  value={form.guest.phone}
                  onChange={(e) => set("guest", { ...form.guest, phone: e.target.value })} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border p-3">
            <div className="text-xs text-slate-500 mb-2">รายละเอียดการเข้าพัก</div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="ประเภทห้อง">
                <select className="input" value={form.room_type_id} onChange={(e) => set("room_type_id", e.target.value)}>
                  {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name} • {rt.capacity} ท่าน</option>)}
                </select>
              </Field>
              <Field label="กำหนดห้อง (ถ้ามี)">
                <select className="input" value={form.room_id} onChange={(e) => set("room_id", e.target.value)}>
                  <option value="">— ไม่กำหนด —</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.room_no} • {r.room_type_name}</option>)}
                </select>
              </Field>
              <Field label="เช็คอิน">
                <input type="date" className="input" value={form.check_in_date} onChange={(e) => set("check_in_date", e.target.value)} />
              </Field>
              <Field label="เช็คเอาต์">
                <input type="date" className="input" value={form.check_out_date} onChange={(e) => set("check_out_date", e.target.value)} />
              </Field>
              <Field label="ผู้ใหญ่">
                <input className="input" value={form.adults} onChange={(e) => set("adults", e.target.value)} />
              </Field>
              <Field label="เด็ก">
                <input className="input" value={form.children} onChange={(e) => set("children", e.target.value)} />
              </Field>
              <Field label="สถานะ">
                <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="กำหนดยอดรวม (ถ้าต้องการ)">
                <input className="input" placeholder="เช่น 1800" value={form.override_total}
                  onChange={(e) => set("override_total", e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="หมายเหตุ">
                  <textarea className="input" rows={3} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t flex items-center justify-between gap-3">
          <div>
            {isEdit && (
              <button
                className="h-10 px-4 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={removeBooking}
                disabled={saving}
                title="ลบการจองนี้"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                    กำลังลบ…
                  </span>
                ) : "ลบการจอง"}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="h-10 px-4 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={saving}
            >
              ยกเลิก
            </button>
            <button
              className={`h-10 px-4 rounded-xl text-white ${canSave ? "bg-green-600 hover:bg-green-700" : "bg-green-600 opacity-60 cursor-not-allowed"}`}
              onClick={submit}
              disabled={!canSave}
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  กำลังบันทึก…
                </span>
              ) : (isEdit ? "บันทึก" : "สร้างการจอง")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomAssignModal({
  open,
  onClose,
  onConfirm,
  rooms = [],
  roomTypes = [],
  defaultRoomTypeId,
  currentRoomId = null
}) {
  const [query, setQuery] = useState("");
  const [roomTypeId, setRoomTypeId] = useState(String(defaultRoomTypeId || ""));
  const [selected, setSelected] = useState(currentRoomId ?? null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setRoomTypeId(String(defaultRoomTypeId || ""));
      setSelected(currentRoomId ?? null);
    }
  }, [open, defaultRoomTypeId, currentRoomId]);

  if (!open) return null;

  const filtered = rooms.filter(r => {
    const matchType = !roomTypeId || String(r.room_type_id) === String(roomTypeId);
    const text = `${r.room_no ?? ""} ${r.room_type_name ?? ""}`.toLowerCase();
    const matchQuery = !query || text.includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">กำหนดห้อง</div>
          <button className="h-9 px-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700" onClick={onClose}>ปิด</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <input
            className="input md:col-span-2"
            placeholder="ค้นหาเลขห้อง / ชื่อประเภท"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="input" value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}>
            <option value="">ประเภททั้งหมด</option>
            {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
          </select>
        </div>

        <div className="max-h-[50vh] overflow-auto rounded-xl border">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="px-3 py-2 border-b">เลือก</th>
                <th className="px-3 py-2 border-b">ห้อง</th>
                <th className="px-3 py-2 border-b">ประเภท</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-slate-500">ไม่พบห้องตามเงื่อนไข</td>
                </tr>
              )}
              {filtered.map(r => {
                const isSel = String(selected ?? "") === String(r.id);
                return (
                  <tr key={r.id} className={`hover:bg-slate-50 ${isSel ? "bg-indigo-50" : ""}`} onClick={() => setSelected(r.id)}>
                    <td className="px-3 py-2 border-b">
                      <input type="radio" name="pick-room" checked={isSel} onChange={() => setSelected(r.id)} />
                    </td>
                    <td className="px-3 py-2 border-b font-semibold">{r.room_no}</td>
                    <td className="px-3 py-2 border-b">{r.room_type_name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button className="h-9 px-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700" onClick={() => onConfirm(null)}>
            เอาออก (ไม่กำหนด)
          </button>
          <div className="flex gap-2">
            <button className="h-9 px-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700" onClick={onClose}>ยกเลิก</button>
            <button
              className="h-9 px-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => onConfirm(selected)}
              disabled={selected === undefined}
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusChangeModal({ open, onClose, onConfirm, currentStatus }) {
  const statuses = ["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"];
  const [selected, setSelected] = useState(currentStatus || "pending");

  useEffect(() => {
    if (open) setSelected(currentStatus || "pending");
  }, [open, currentStatus]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">เปลี่ยนสถานะ</div>
          <button className="h-9 px-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700" onClick={onClose}>ปิด</button>
        </div>

        <div className="rounded-xl border max-h-[50vh] overflow-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="px-3 py-2 border-b">เลือก</th>
                <th className="px-3 py-2 border-b">สถานะ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {statuses.map(s => {
                const isSel = selected === s;
                return (
                  <tr key={s} className={`hover:bg-slate-50 ${isSel ? "bg-indigo-50" : ""}`} onClick={() => setSelected(s)}>
                    <td className="px-3 py-2 border-b">
                      <input type="radio" name="pick-status" checked={isSel} onChange={() => setSelected(s)} />
                    </td>
                    <td className="px-3 py-2 border-b">
                      <div className="inline-flex items-center gap-2">
                        <StatusBadge s={s} /> <span className="font-medium">{s}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="h-9 px-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700" onClick={onClose}>ยกเลิก</button>
          <button className="h-9 px-3 rounded-lg bg-green-600 text-white hover:bg-green-700" onClick={() => onConfirm(selected)}>ยืนยัน</button>
        </div>
      </div>
    </div>
  );
}

function BookingsList() {
  const { authHeader } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("%");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [roomPickOpen, setRoomPickOpen] = useState(false);
  const [roomPickTarget, setRoomPickTarget] = useState(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  async function loadDropdowns() {
    const [rt, rr, gg] = await Promise.all([
      fetch(`${API_URL}/api/v1/admin/bookings/room-types`, { headers: authHeader() }),
      fetch(`${API_URL}/api/v1/admin/bookings/rooms`, { headers: authHeader() }),
      fetch(`${API_URL}/api/v1/admin/bookings/guests`, { headers: authHeader() }),
    ]);
    setRoomTypes(await rt.json());
    setRooms(await rr.json());
    setGuests(await gg.json());
  }

  async function fetchList() {
    setLoading(true); setErr("");
    try {
      const params = new URLSearchParams();
      params.set("status", status);
      if (roomTypeId) params.set("room_type_id", roomTypeId);
      if (q) params.set("q", q);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      params.set("page", page);
      params.set("limit", limit);

      const res = await fetch(`${API_URL}/api/v1/admin/bookings?${params.toString()}`, {
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

  useEffect(() => { loadDropdowns(); }, []);
  useEffect(() => { fetchList(); }, [status, roomTypeId, page]);
  function doSearch(e) { e?.preventDefault?.(); setPage(1); fetchList(); }

  function openCreate() { setEditTarget(null); setModalOpen(true); }
  function openEdit(row) {
    setEditTarget({
      id: row.id,
      guest_id: undefined,
      room_type_id: row.room_type_id,
      room_id: row.room_id || "",
      check_in_date: row.check_in_date?.slice(0, 10),
      check_out_date: row.check_out_date?.slice(0, 10),
      adults: row.adults, children: row.children,
      remarks: row.remarks, status: row.status,
    });
    setModalOpen(true);
  }

  async function changeStatus(row, newStatus) {
    const ok = await Swal.fire({ icon: "question", title: `เปลี่ยนเป็น ${newStatus}?`, showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก" });
    if (!ok.isConfirmed) return;
    const res = await fetch(`${API_URL}/api/v1/admin/bookings/${row.id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ status: newStatus })
    });
    const js = await res.json();
    if (!res.ok) return Swal.fire({ icon: "error", title: "ผิดพลาด", text: js.message || "ไม่สำเร็จ" });
    Swal.fire({ icon: "success", title: "อัปเดตแล้ว", timer: 800, showConfirmButton: false });
    fetchList();
  }

  async function assignRoom(row, room_id) {
    const res = await fetch(`${API_URL}/api/v1/admin/bookings/${row.id}/assign-room`, {
      method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ room_id })
    });
    const js = await res.json();
    if (!res.ok) return Swal.fire({ icon: "error", title: "ผิดพลาด", text: js.message || "ไม่สำเร็จ" });
    Swal.fire({ icon: "success", title: room_id ? "กำหนดห้องแล้ว" : "เอาออกแล้ว", timer: 800, showConfirmButton: false });
    fetchList();
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Boiler title="จัดการการจอง">
      <form onSubmit={doSearch} className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-3">
        <input className="input" placeholder="ค้นหา (บุ๊กกิ้ง/ชื่อ/อีเมล/โทร)"
          value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="%">สถานะทั้งหมด</option>
          {["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}>
          <option value="">ประเภทห้องทั้งหมด</option>
          {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
        </select>
        <input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <button type="submit" className="h-10 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">ค้นหา</button>
      </form>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-slate-500">ทั้งหมด {total} รายการ</div>
        <div className="flex gap-2">
          <button className="btn" onClick={fetchList}>รีเฟรช</button>
          <button className="h-10 px-4 rounded-xl bg-violet-600 text-white hover:bg-violet-700" onClick={openCreate}>+ สร้างการจอง</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="px-3 py-2 border-b">บุ๊กกิ้ง</th>
              <th className="px-3 py-2 border-b">ลูกค้า</th>
              <th className="px-3 py-2 border-b">ประเภท/ห้อง</th>
              <th className="px-3 py-2 border-b">เข้า</th>
              <th className="px-3 py-2 border-b">ออก</th>
              <th className="px-3 py-2 border-b">คืน</th>
              <th className="px-3 py-2 border-b">สถานะ</th>
              <th className="px-3 py-2 border-b text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && (<tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">กำลังโหลด…</td></tr>)}
            {!loading && items.length === 0 && (<tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">ไม่พบข้อมูล</td></tr>)}
            {!loading && items.map(row => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 border-b font-semibold">{row.booking_no}</td>
                <td className="px-3 py-2 border-b">{row.guest_name}</td>
                <td className="px-3 py-2 border-b">
                  {row.room_type_name}{row.room_no ? ` • ห้อง ${row.room_no}` : ""}
                </td>
                <td className="px-3 py-2 border-b">{new Date(row.check_in_date).toLocaleDateString("th-TH")}</td>
                <td className="px-3 py-2 border-b">{new Date(row.check_out_date).toLocaleDateString("th-TH")}</td>
                <td className="px-3 py-2 border-b">{row.nights}</td>
                <td className="px-3 py-2 border-b"><StatusBadge s={row.status} /></td>
                <td className="px-3 py-2 border-b">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Link to={`/bookings/${row.id}`} className="act-btn text-violet-600">รายละเอียด</Link>
                    <button className="act-btn indigo" onClick={() => openEdit(row)}>แก้ไข</button>

                    <button
                      className="act-btn sky"
                      onClick={() => { setRoomPickTarget(row); setRoomPickOpen(true); }}
                    >
                      กำหนดห้อง
                    </button>

                    <button
                      className="act-btn orange"
                      onClick={() => { setStatusTarget(row); setStatusOpen(true); }}
                    >
                      สถานะ
                    </button>

                    {row.status === "checked_out" && (
                      <Link to={`/bookings/${row.id}/receipt`} className="act-btn emerald">
                        พิมพ์ใบเสร็จ
                      </Link>
                    )}

                    <button className="act-btn red text-white" onClick={() => remove(row)}>ยกเลิก</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Math.ceil(total / limit) > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>ก่อนหน้า</button>
          <div className="px-3 text-sm text-slate-600">หน้า {page} / {Math.max(1, Math.ceil(total / limit))}</div>
          <button className="btn" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>ถัดไป</button>
        </div>
      )}

      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={{ authHeader, refresh: fetchList }}
        initial={editTarget}
        roomTypes={roomTypes}
        rooms={rooms}
        guests={guests}
      />

      <RoomAssignModal
        open={roomPickOpen}
        onClose={() => { setRoomPickOpen(false); setRoomPickTarget(null); }}
        rooms={rooms}
        roomTypes={roomTypes}
        defaultRoomTypeId={roomPickTarget?.room_type_id}
        currentRoomId={roomPickTarget?.room_id ?? null}
        onConfirm={async (pickedRoomId) => {
          if (!roomPickTarget) return;
          await assignRoom(roomPickTarget, pickedRoomId);
          setRoomPickOpen(false);
          setRoomPickTarget(null);
        }}
      />

      <StatusChangeModal
        open={statusOpen}
        onClose={() => { setStatusOpen(false); setStatusTarget(null); }}
        currentStatus={statusTarget?.status}
        onConfirm={async (pickedStatus) => {
          if (!statusTarget) return;
          await changeStatus(statusTarget, pickedStatus);
          setStatusOpen(false);
          setStatusTarget(null);
        }}
      />
    </Boiler>
  );

  async function remove(row) {
    const ok = await Swal.fire({ icon: "warning", title: `ยกเลิกการจอง ${row.booking_no}?`, showCancelButton: true, confirmButtonText: "ยืนยัน" });
    if (!ok.isConfirmed) return;
    const res = await fetch(`${API_URL}/api/v1/admin/bookings/${row.id}`, { method: "DELETE", headers: authHeader() });
    const js = await res.json();
    if (!res.ok) return Swal.fire({ icon: "error", title: "ผิดพลาด", text: js.message || "ไม่สำเร็จ" });
    Swal.fire({ icon: "success", title: "ยกเลิกแล้ว", timer: 800, showConfirmButton: false });
    fetchList();
  }
}

function BookingDetail() {
  const { id } = useParams();
  const { authHeader } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  async function load() {
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/bookings/${id}`, { headers: authHeader() });
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

  if (loading) return <Boiler title="รายละเอียดการจอง"><div className="text-slate-500">กำลังโหลด…</div></Boiler>;
  if (err) return <Boiler title="รายละเอียดการจอง"><div className="text-amber-600">ผิดพลาด: {err}</div></Boiler>;
  if (!data) return null;

  const b = data.booking;

  return (
    <Boiler title={`บุ๊กกิ้ง ${b.booking_no}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-4 md:col-span-2">
          <div className="text-slate-500 text-sm">รายละเอียด</div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><div className="text-slate-500">ลูกค้า</div><div className="font-semibold">{b.guest_name}</div></div>
            <div><div className="text-slate-500">อีเมล</div><div className="font-semibold">{b.guest_email || "-"}</div></div>
            <div><div className="text-slate-500">โทร</div><div className="font-semibold">{b.guest_phone || "-"}</div></div>
            <div><div className="text-slate-500">สถานะ</div><div><StatusBadge s={b.status} /></div></div>
            <div><div className="text-slate-500">ประเภทห้อง</div><div className="font-semibold">{b.room_type_name}</div></div>
            <div><div className="text-slate-500">ห้อง</div><div className="font-semibold">{b.room_no || "-"}</div></div>
            <div><div className="text-slate-500">เข้า</div><div className="font-semibold">{new Date(b.check_in_date).toLocaleDateString("th-TH")}</div></div>
            <div><div className="text-slate-500">ออก</div><div className="font-semibold">{new Date(b.check_out_date).toLocaleDateString("th-TH")}</div></div>
            <div><div className="text-slate-500">คืน</div><div className="font-semibold">{b.nights}</div></div>
            <div><div className="text-slate-500">ยอดรวม</div><div className="font-semibold">{money0(b.total_amount)} บาท</div></div>
          </div>

          {b.remarks && <div className="mt-3 text-sm"><span className="text-slate-500">หมายเหตุ:</span> {b.remarks}</div>}

          <div className="mt-3 flex gap-2">
            <button className="btn" onClick={() => nav(-1)}>ย้อนกลับ</button>

            {b.status === "checked_out" && (
              <button
                className="h-10 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => nav(`/bookings/${b.id}/receipt?print=1`)}
                title="เปิดใบเสร็จและสั่งพิมพ์อัตโนมัติ"
              >
                พิมพ์ใบเสร็จรับเงิน
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-4">
          <div className="text-slate-500 text-sm">การชำระเงิน</div>
          <div className="mt-2">
            {data.payments?.length ? (
              <div className="overflow-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="text-left text-xs text-slate-500">
                      <th className="px-3 py-2 border-b">วันที่</th>
                      <th className="px-3 py-2 border-b">วิธี</th>
                      <th className="px-3 py-2 border-b">สถานะ</th>
                      <th className="px-3 py-2 border-b text-right">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {data.payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 border-b">{new Date(p.created_at).toLocaleString("th-TH")}</td>
                        <td className="px-3 py-2 border-b">{p.method}</td>
                        <td className="px-3 py-2 border-b"><StatusBadge s={p.status} /></td>
                        <td className="px-3 py-2 border-b text-right">{money0(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-slate-500">ยังไม่มีการชำระเงิน</div>
            )}
          </div>
        </div>
      </div>
    </Boiler>
  );
}

function BookingReceipt({ autoPrint = true }) {
  const { id } = useParams();
  const { authHeader } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  async function load() {
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/bookings/${id}`, { headers: authHeader() });
      const js = await res.json();
      if (!res.ok) throw new Error(js.message || "โหลดล้มเหลว");
      setData(js);
    } catch (e) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!loading && data && autoPrint) {
      const t = setTimeout(() => window.print(), 150);
      return () => clearTimeout(t);
    }
  }, [loading, data, autoPrint]);

  if (loading) return <Boiler title="ใบเสร็จรับเงิน"><div className="text-slate-500">กำลังโหลด…</div></Boiler>;
  if (err || !data) return <Boiler title="ใบเสร็จรับเงิน"><div className="text-amber-600">ผิดพลาด: {err || "ไม่พบข้อมูล"}</div></Boiler>;

  const b = data.booking;
  const pays = data.payments || [];
  const fmtTH = (d) => new Date(d).toLocaleString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <Boiler title={`ใบเสร็จรับเงิน — ${b.booking_no}`}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-bold">WUALAI HOTEL</div>
            <div className="text-sm text-slate-600">
              1/1 ซอย 5 ถนนวัวลาย ต.หายยา อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50100<br />
              โทร 080-000-0000
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">ใบเสร็จรับเงิน</div>
            <div className="text-sm text-slate-600">เลขที่การจอง: <span className="font-semibold">{b.booking_no}</span></div>
            <div className="text-sm text-slate-600">ออกเมื่อ: {fmtTH(Date.now())}</div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-slate-500">ชื่อลูกค้า</div>
            <div className="font-semibold">{b.guest_name}</div>
            <div className="text-slate-500 mt-2">อีเมล / โทรศัพท์</div>
            <div className="font-semibold">{b.guest_email || "-"} / {b.guest_phone || "-"}</div>
          </div>
          <div>
            <div className="text-slate-500">รายละเอียดเข้าพัก</div>
            <div className="font-semibold">ประเภทห้อง: {b.room_type_name} {b.room_no ? `• ห้อง ${b.room_no}` : ""}</div>
            <div className="font-semibold">เช็คอิน: {new Date(b.check_in_date).toLocaleDateString("th-TH")} • เช็คเอาท์: {new Date(b.check_out_date).toLocaleDateString("th-TH")}</div>
            <div className="font-semibold">จำนวนคืน: {b.nights}</div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border overflow-hidden">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="px-4 py-2 border-b">รายการ</th>
                <th className="px-4 py-2 border-b w-40 text-right">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 border-b">ค่าห้องพัก {b.room_type_name} × {b.nights} คืน</td>
                <td className="px-4 py-2 border-b text-right">{Number(b.total_amount || 0).toLocaleString("th-TH")}</td>
              </tr>
              {pays.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 border-b text-slate-600">
                    ชำระเงิน ({p.method}) • {fmtTH(p.created_at)} • สถานะ {p.status}
                  </td>
                  <td className="px-4 py-2 border-b text-right">-{Number(p.amount || 0).toLocaleString("th-TH")}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3 font-semibold text-right">ยอดสุทธิชำระแล้ว</td>
                <td className="px-4 py-3 font-bold text-right">{Number((pays.reduce((s, p) => s + (p.amount || 0), 0)) || 0).toLocaleString("th-TH")}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-right">ยอดคงเหลือ</td>
                <td className="px-4 py-3 font-bold text-right">
                  {Number((b.total_amount || 0) - pays.reduce((s, p) => s + (p.amount || 0), 0)).toLocaleString("th-TH")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-slate-600">
          * ใบเสร็จรับเงินนี้ออกโดยระบบอัตโนมัติ ใช้สำหรับอ้างอิงการชำระเงิน
        </div>

        <div className="no-print mt-6 flex justify-end gap-2">
          <button className="btn" onClick={() => nav(-1)}>ย้อนกลับ</button>
          <button className="btn-primary" onClick={() => window.print()}>พิมพ์อีกครั้ง</button>
        </div>
      </div>
    </Boiler>
  );
}


export default function BookingsPage() {
  const { id, action } = useParams();
  const isReceipt = action === "receipt" || window.location.pathname.endsWith("/receipt");
  const auto = new URLSearchParams(window.location.search).get("print") === "1";

  if (id && isReceipt) return <BookingReceipt autoPrint={auto} />;
  return id ? <BookingDetail /> : <BookingsList />;
}

const styles = `
.input { @apply w-full h-10 px-3 rounded-xl border border-gray-300/90 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500; }
.btn { @apply h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50; }
.btn-primary { @apply h-10 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700; }

.act-btn { @apply h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors; }
.act-btn.indigo { @apply bg-indigo-600 text-white hover:bg-indigo-700 border-transparent shadow-sm; }
.act-btn.sky { @apply bg-sky-600 text-white hover:bg-sky-700 border-transparent shadow-sm; }
.act-btn.red { @apply bg-rose-600 text-white hover:bg-rose-700 border-transparent shadow-sm; }
.act-btn.orange { @apply bg-orange-500 text-white hover:bg-orange-600 border-transparent shadow-sm; }
.act-btn.emerald { @apply bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-sm; }
`;
if (typeof document !== "undefined") {
  let style = document.getElementById("bookings-inline");
  if (!style) {
    style = document.createElement("style");
    style.id = "bookings-inline";
    document.head.appendChild(style);
  }
  style.innerHTML = styles;
}
