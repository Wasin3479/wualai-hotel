import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout() {
    const [open, setOpen] = useState(false);

    function closeMenu() { setOpen(false); }
    function toggleMenu() { setOpen(o => !o); }

    return (
        <div id="main-wrapper">
            <Sidebar open={open} onClose={closeMenu} />

            <main>
                <Topbar onMenu={toggleMenu} />

                <div className="content-body">
                    <Outlet />
                </div>

                <footer className="footer app-footer">
                    <div className="app-footer__grid">
                        <div className="app-footer__brand">
                            <img src="/logo.png" alt="logo" />
                            <div>
                                <strong>ผู้ดูแลระบบ</strong>
                                <span>© {new Date().getFullYear()}</span>
                            </div>
                        </div>

                        <div className="app-footer__meta">
                            <span>
                                Distributed by{" "}
                                <a href="https://wasin-jira.com" target="_blank" rel="noreferrer">wasin-jira.com</a>
                            </span>
                        </div>
                    </div>
                </footer>

            </main>

            {open && <div className="backdrop" onClick={closeMenu} />}
        </div>
    );
}
