import React from "react";

export default function Topbar({ onMenu }) {
  return (
    <div className="topbar" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <button className="icon-btn" aria-label="Toggle menu" onClick={onMenu}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      <div style={{ fontWeight: 700 }}>ผู้ดูแลระบบ</div>
      <div style={{ marginLeft: "auto", opacity: .7, fontSize: 13 }}></div>
    </div>
  );
}
