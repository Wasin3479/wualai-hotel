import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../lib/env";

const Ctx = createContext(null);

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1];
    const payload = JSON.parse(atob(base64));
    return payload || null;
  } catch {
    return null;
  }
}
function isExpired(token) {
  const p = parseJwt(token);
  if (!p || !p.exp) return true;
  return Date.now() >= p.exp * 1000;
}
const STORAGE_KEY = "adm_token";

export function AuthProvider({ children }) {
  const [authReady, setAuthReady] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setToken(saved || null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  const user = useMemo(() => {
    if (!token) return null;
    if (isExpired(token)) return null;
    const p = parseJwt(token);
    if (!p) return null;
    console.log(p)
    return {
      id: p.id,
      email: p.email,
      roles: Array.isArray(p.roles) ? p.roles : [],
      typ: p.typ || "admin",
    };
  }, [token]);

  const isAuthenticated = !!user;

  async function loginWithApi({ email, password, remember = false }) {
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
      const data = await res.json();
      if (!data?.token) throw new Error("ไม่พบ token จากเซิร์ฟเวอร์");

      setToken(data.token);
        localStorage.setItem(STORAGE_KEY, data.token);
      
      return data;
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: e.message || "โปรดลองอีกครั้ง",
      });
      throw e;
    }
  }

  function logout() {
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function authHeader() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return (
    <Ctx.Provider value={{ authReady, token, user, isAuthenticated, loginWithApi, logout, authHeader }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
