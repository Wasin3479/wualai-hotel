import React, { useEffect, useState } from "react";
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

  const isPathActive = (item, pathname) => {
    if (item.type === "link") return pathname.startsWith(item.to);
    if (item.type === "group") return item.items?.some((ch) => isPathActive(ch, pathname));
    return false;
  };

  const onlyActiveOpenMap = (pathname) => {
    const map = {};
    MENU.forEach((it) => {
      if (it.type === "group") {
        map[it.id] = isPathActive(it, pathname);
      }
    });
    return map;
  };

  const [openGroups, setOpenGroups] = useState(() => onlyActiveOpenMap(location.pathname));

  useEffect(() => {
    setOpenGroups(onlyActiveOpenMap(location.pathname));
  }, [location.pathname]);

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

  const Bullet = () => (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: 9999,
        background: "currentColor",
        opacity: 0.75,
        marginRight: 8,
      }}
    />
  );

  const renderItem = (item, depth = 0) => {
    if (item.type === "link") {
      return (
        <li key={`${item.to}-${depth}`}>
          <NavLink to={item.to} className={linkCls} onClick={() => onClose?.()}>
            {depth > 0 && <Bullet />}
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
            onClick={() =>
              setOpenGroups((prev) => {
                const willOpen = !prev[item.id];
                if (willOpen) {
                  const next = {};
                  MENU.forEach((it) => {
                    if (it.type === "group") next[it.id] = false;
                  });
                  next[item.id] = true;
                  return next;
                }
                return { ...prev, [item.id]: false };
              })
            }
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
              paddingLeft: 12,
            }}
          >
            {item.items?.map((child) => renderItem(child, depth + 1))}
          </ul>
        </li>
      );
    }
    return null;
  };

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
