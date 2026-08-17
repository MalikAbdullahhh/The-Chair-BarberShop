"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight, Lock, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("thechair_admin_token") : null;
    if (token) {
      router.replace("/admin");
    } else {
      setChecking(false);
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();

    try {
      const data = await api<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      if (data.user?.role !== "admin") {
        throw new Error("Access restricted: Administrator privileges required.");
      }

      localStorage.setItem("thechair_admin_token", data.token);
      toast.success("Administrator access authorized.");
      router.replace("/admin");
    } catch (err: any) {
      toast.error(err.message || "Invalid administrative credentials.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="admin-auth-shield">
        <div className="admin-shield-card">
          <Loader2 className="animate-spin admin-shield-spinner" size={26} />
          <span className="admin-shield-label">THE CHAIR &bull; CONTROL ROOM</span>
          <p className="admin-shield-sub">Checking administrative status…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="admin-login-viewport">
      {/* TOP BAR */}
      <header className="admin-login-topbar">
        <Link href="/" className="admin-login-logo">
          <span>THE</span> <b>CHAIR</b> <small>CONTROL ROOM</small>
        </Link>
        <Link href="/" className="admin-login-exit">
          <ArrowLeft size={13} />
          <span>BACK TO MAIN HOUSE</span>
        </Link>
      </header>

      {/* CENTERED LOGIN CARD */}
      <div className="admin-login-canvas">
        <motion.div 
          className="admin-login-card"
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="admin-card-head">
            <span className="admin-card-eyebrow">RESTRICTED ACCESS</span>
            <h1 className="admin-card-title">
              ADMIN <em className="admin-title-em">PORTAL.</em>
            </h1>
            <p className="admin-card-sub">
              Sign in with your administrative credentials to manage appointments, barbers, services, and live house operations.
            </p>
          </div>

          <form onSubmit={handleLogin} className="admin-card-form">
            <div className="admin-input-group">
              <label htmlFor="admin-email">
                <Mail size={12} />
                <span>ADMINISTRATOR EMAIL</span>
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue="admin@thechair.local"
                placeholder="admin@thechair.local"
              />
            </div>

            <div className="admin-input-group">
              <label htmlFor="admin-password">
                <Lock size={12} />
                <span>ADMINISTRATOR PASSWORD</span>
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                defaultValue="ChangeMe123!"
                placeholder="Enter password"
              />
            </div>

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              <span>{loading ? "VERIFYING CREDENTIALS…" : "ENTER CONTROL ROOM"}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="admin-card-footer">
            <div className="admin-hint-badge">
              <ShieldCheck size={13} />
              <span>DEFAULT ACCESS: admin@thechair.local &bull; ChangeMe123!</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}