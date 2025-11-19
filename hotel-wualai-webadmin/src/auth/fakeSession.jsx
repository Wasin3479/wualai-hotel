import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { createFakeJWT, parseFakeJWT, isExpired } from "./token.js";

const Ctx = createContext(null);

export function FakeAuthProvider({ children }) {
  const [authReady, setAuthReady] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adm_token");
      setToken(saved || null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (token) localStorage.setItem("adm_token", token);
    else localStorage.removeItem("adm_token");
  }, [token, authReady]);

  const user = useMemo(() => {
    if (!token) return null;
    const p = parseFakeJWT(token);
    if (!p || isExpired(token)) return null;
    return { id: p.sub, email: p.email, role_id: p.role_id, name: p.name };
  }, [token]);

  const isAuthenticated = !!user;

  function login({ email, role = 1, name = "Admin" }) {
    const newToken = createFakeJWT({ sub: 1, email, role_id: Number(role), name }, 60 * 60 * 8);
    setToken(newToken);
  }

  function logout() {
    setToken(null);
  }

  async function guardSuperAdmin() {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return false;
    }
    if (user.role_id !== 1) {
      await Swal.fire({
        icon: "success",
        title: "หน้าสำหรับผู้ดูแลระบบเท่านั้น",
        confirmButtonText: "ตกลง",
        timer: 3000,
        timerProgressBar: true,
      });
      window.location.href = "/login";
      return false;
    }
    return true;
  }

  return (
    <Ctx.Provider value={{ authReady, token, user, isAuthenticated, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFakeAuth() {
  return useContext(Ctx);
}
