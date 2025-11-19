import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/session.jsx";
import { isExpired } from "../auth/token.js";

function Loader() {
  return <div style={{ padding: 24, textAlign: "center" }}>กำลังโหลด…</div>;
}

export function RequireAuth() {
  const { authReady, token, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!authReady) return <Loader />;

  if (!token || !isAuthenticated || isExpired(token)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireGuest() {
  const { authReady, token, isAuthenticated } = useAuth();

  if (!authReady) return <Loader />;

  if (token && isAuthenticated && !isExpired(token)) {
    return <Navigate to="/view_dashboard" replace />;
  }
  return <Outlet />;
}
