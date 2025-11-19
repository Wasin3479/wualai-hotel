import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/session.jsx";

export default function Login() {
  const nav = useNavigate();
  const from = useLocation().state?.from?.pathname || "/view_dashboard";

  const { authReady, isAuthenticated, loginWithApi } = useAuth();

  const [email, setEmail] = useState("wualai@hotel.com");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authReady && isAuthenticated) {
      nav(from, { replace: true });
    }
  }, [authReady, isAuthenticated, from, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await loginWithApi({ email, password, remember });
      await Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ!",
        timer: 800,
        showConfirmButton: false,
      });
      nav(from, { replace: true });
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl p-8">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Hotel Logo" className="mx-auto h-16 object-contain" />
            <h1 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              สำหรับผู้ดูแลระบบ
            </h1>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-300/90 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-300/90 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">จดจำรหัสผ่าน</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium shadow-lg shadow-indigo-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
