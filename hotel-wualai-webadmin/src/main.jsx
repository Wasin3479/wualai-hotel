import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import { AuthProvider, useAuth } from "./auth/session.jsx";
import AuthGate from "./auth/AuthGate.jsx";
import "./styles/fixes.css";

function RoutedApp() {
  const { isAuthenticated } = useAuth();
  return <AppRoutes key={isAuthenticated ? "auth" : "guest"} />;
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <AuthGate>
        <RoutedApp />
      </AuthGate>
    </AuthProvider>
  </BrowserRouter>
);
