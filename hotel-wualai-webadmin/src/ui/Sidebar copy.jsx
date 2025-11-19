import React from 'react'
import { NavLink } from 'react-router-dom'
import { useFakeAuth } from '../auth/fakeSession'


export default function Sidebar() {
    const { session, logout } = useFakeAuth()

    function handleLogout() {
        logout();
        nav("/login", { replace: true });
    }

    return (
        <aside className="deznav">
            <div className="brand">
                <img src="/logo.png" alt="logo" style={{ height: 36, borderRadius: 8 }} />
                <div>
                    <div style={{ fontWeight: 700 }}>สำหรับผู้ดูแลระบบ</div>
                    <div style={{ opacity: .7, fontSize: 12 }}>{session?.Username || '—'}</div>
                </div>
            </div>
            <nav style={{ padding: 12 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                    <li><NavLink to="/view_dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
                    <li><NavLink to="/view_users" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink></li>
                </ul>

                <button className="btn mt-4" style={{ width: "100%", background: "#ef4444", color: "#fff" }} onClick={handleLogout}>
                    Logout
                </button>            </nav>
        </aside>
    )
}