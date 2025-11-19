// src/ui/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/session.jsx";
import { MENU, MENU_OPEN_DEFAULT } from "./menu.config.js";

export default function Sidebar({ open = false, onClose }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    onClose?.();
    nav("/login", { replace: true });
  }

  const linkCls = ({ isActive }) => (isActive ? "active" : "");

  // ใช้เช็คว่า path ปัจจุบันอยู่ใน link/group ตัวไหน
  const isPathActive = (item, pathname) => {
    if (item.type === "link") return pathname.startsWith(item.to);
    if (item.type === "group") return item.items?.some((ch) => isPathActive(ch, pathname));
    return false;
  };

  // สร้าง map ของสถานะเปิด/ปิดเริ่มต้นตามตัวแปร + override รายกลุ่ม + path ปัจจุบัน
  const buildDefaultOpenMap = (pathname) => {
    const globalDefault = MENU_OPEN_DEFAULT === "expanded";
    const map = {};
    MENU.forEach((it) => {
      if (it.type === "group") {
        const base = typeof it.defaultOpen === "boolean" ? it.defaultOpen : globalDefault;
        const active = isPathActive(it, pathname);
        map[it.id] = base || active; // ถ้าเส้นทางอยู่ใน group ให้เปิดไว้เสมอ
      }
    });
    return map;
  };

  const [openGroups, setOpenGroups] = useState(() => buildDefaultOpenMap(location.pathname));

  // เมื่อ path เปลี่ยน: บังคับเปิด group ที่ routing อยู่ภายใน
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      MENU.forEach((it) => {
        if (it.type === "group" && isPathActive(it, location.pathname)) {
          next[it.id] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  // ปุ่มหัวข้อใหญ่ (ให้หน้าตาเข้ากับลิงก์)
  const groupBtnBase = {
    width: "100%",
    textAlign: "left",
    color: "#c7d2fe",
    background: "transparent",
    border: 0,
    padding: "12px 14px",
    borderRadius: 12,
    cursor: "pointer",
  };
  const groupActiveStyle = {
    background: "linear-gradient(180deg, rgba(124,58,237,.35), rgba(124,58,237,.18))",
    color: "#fff",
    boxShadow: "inset 0 0 0 1px rgba(124,58,237,.35)",
  };

  const renderItem = (item) => {
    if (item.type === "link") {
      return (
        <li key={item.to}>
          <NavLink to={item.to} className={linkCls} onClick={() => onClose?.()}>
            {item.label}
          </NavLink>
        </li>
      );
    }
    if (item.type === "group") {
      const isActive = isPathActive(item, location.pathname);
      const opened = !!openGroups[item.id];
      return (
        <li key={item.id} style={{ marginTop: 6 }}>
          <button
            type="button"
            className="nav-group-btn"
            onClick={() => setOpenGroups((o) => ({ ...o, [item.id]: !o[item.id] }))}
            aria-expanded={opened}
            aria-controls={`sub-${item.id}`}
            style={{
              ...groupBtnBase,
              ...(opened || isActive ? groupActiveStyle : {}),
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ flex: 1 }}>{item.label}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ transform: `rotate(${opened ? 180 : 0}deg)`, transition: "transform .15s ease" }}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <ul
            id={`sub-${item.id}`}
            style={{
              listStyle: "none",
              padding: 0,
              margin: opened ? "6px 0 0" : 0,
              display: opened ? "grid" : "none",
              gap: 6,
            }}
          >
            {item.items?.map((child) => renderItem(child))}
          </ul>
        </li>
      );
    }
    return null;
  };
  // console.log(user)
  return (
    <aside className="deznav sidebar" data-open={open ? "true" : "false"}>
      <div className="brand">
        <img src="/logo.png" alt="logo" style={{ height: 36, borderRadius: 8 }} />
        <div>
          <div style={{ fontWeight: 700 }}>สำหรับผู้ดูแลระบบ</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>{user?.email || "—"}</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>{user?.roles || "—"}</div>

        </div>
      </div>

      {/* ปุ่มปิดสำหรับจอเล็ก */}
      <div style={{ padding: "0 12px 8px 12px", display: "none" }} className="sidebar-close-mobile">
        <button className="icon-btn" aria-label="Close menu" onClick={() => onClose?.()}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav style={{ padding: 12 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
          {MENU.map((it) => renderItem(it))}
        </ul>

        <button
          className="btn mt-4"
          style={{ width: "100%", background: "#ef4444", color: "#fff" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
