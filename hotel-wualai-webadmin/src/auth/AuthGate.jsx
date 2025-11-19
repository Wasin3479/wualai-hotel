import React from "react";
import { useAuth } from "./session.jsx";

export default function AuthGate({ children }) {
  const { authReady } = useAuth();
  if (!authReady) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        กำลังโหลด…
      </div>
    );
  }
  return children;
}
