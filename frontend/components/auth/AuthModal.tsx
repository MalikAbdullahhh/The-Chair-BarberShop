"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lock, ArrowRight, UserCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalMode, setAuthModalMode, login, register } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();

    setLoading(true);
    try {
      if (authModalMode === "register") {
        if (!name || name.length < 2) throw new Error("Please enter your full name");
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        await register(name, email, password, phone);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="auth-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setAuthModalOpen(false)}
      >
        <motion.div
          className="auth-modal-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="auth-modal-close"
            onClick={() => setAuthModalOpen(false)}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="auth-modal-header">
            <div className="auth-modal-eyebrow">
              <Lock size={12} />
              <span>THE CHAIR / CLIENT FILE</span>
            </div>
            <h2>
              {authModalMode === "login" ? (
                <>WELCOME<br /><em>BACK.</em></>
              ) : (
                <>OPEN YOUR<br /><em>CLIENT FILE.</em></>
              )}
            </h2>
            <p>
              {authModalMode === "login"
                ? "Sign in to manage upcoming chairs, request changes, and view your style ledger."
                : "Save your preferences, favorite barber, and repeat previous setups with one tap."}
            </p>
          </div>

          <div className="auth-modal-tabs">
            <button
              type="button"
              className={authModalMode === "login" ? "active" : ""}
              onClick={() => setAuthModalMode("login")}
            >
              SIGN IN
            </button>
            <button
              type="button"
              className={authModalMode === "register" ? "active" : ""}
              onClick={() => setAuthModalMode("register")}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-modal-form">
            {authModalMode === "register" && (
              <>
                <div className="auth-field">
                  <label htmlFor="auth-name">FULL NAME</label>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Alexander Vance"
                    autoComplete="name"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-phone">PHONE NUMBER</label>
                  <input
                    id="auth-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+44 7911 123456"
                    autoComplete="tel"
                  />
                </div>
              </>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">EMAIL ADDRESS</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                placeholder="alexander@example.com"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">PASSWORD</label>
              <input
                id="auth-password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="8+ characters"
                autoComplete={authModalMode === "login" ? "current-password" : "new-password"}
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? "PROCESSING FILE…" : authModalMode === "login" ? "OPEN MY FILE" : "REGISTER & CONTINUE"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="auth-modal-footer">
            <small>
              {authModalMode === "login" ? (
                <>Don't have a client file? <button type="button" onClick={() => setAuthModalMode("register")}>Create one now</button></>
              ) : (
                <>Already have a client file? <button type="button" onClick={() => setAuthModalMode("login")}>Sign in</button></>
              )}
            </small>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
