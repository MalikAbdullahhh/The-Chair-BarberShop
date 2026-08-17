"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { media } from "@/data/media";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="split-auth-page">
      {/* 50% LEFT: EDITORIAL IMAGE & BRAND STATEMENT */}
      <section className="split-auth-media">
        <Image
          src={media.house}
          alt="The Chair studio interior and leather grooming chairs"
          fill
          priority
          sizes="50vw"
          className="split-auth-img"
        />
        <div className="split-auth-shade" />
        <div className="split-media-top">
          <Link href="/" className="split-brand-mark">
            <b>THE</b><strong>CHAIR</strong>
          </Link>
          <span>14 KING STREET / M2</span>
        </div>
        <div className="split-media-bottom">
          <span className="split-media-eyebrow">CLIENT DOSSIER</span>
          <h2>TIME,<br /><em>PROTECTED.</em></h2>
          <p>
            Your appointment history, master barber notes, and schedule change requests — all kept in one private ledger.
          </p>
        </div>
      </section>

      {/* 50% RIGHT: HEADING, FORM & ACTIONS */}
      <section className="split-auth-form-panel">
        <div className="split-form-container">
          <div className="split-top-nav">
            <Link href="/" className="split-back-link">
              <ArrowLeft size={15} />
              <span>RETURN TO MAIN HOUSE</span>
            </Link>
            <span className="split-portal-tag">01 / CLIENT ACCESS</span>
          </div>

          <header className="split-form-header">
            <div className="split-eyebrow">
              <Lock size={12} />
              <span>CLIENT FILE &bull; SIGN IN</span>
            </div>
            <h1>
              WELCOME<br />
              <em>BACK.</em>
            </h1>
            <p>
              Enter your email and password to access your protected appointments, submit schedule changes, or rebook with 1 tap.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="split-form">
            <div className="split-field">
              <label htmlFor="signin-email">EMAIL ADDRESS</label>
              <input
                id="signin-email"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="split-field">
              <div className="field-label-row">
                <label htmlFor="signin-password">PASSWORD</label>
              </div>
              <input
                id="signin-password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="split-submit-btn" disabled={loading}>
              <span>{loading ? "OPENING YOUR FILE…" : "SIGN IN TO CLIENT FILE"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <footer className="split-form-footer">
            <div className="split-switch-row">
              <span>NEW TO THE CHAIR?</span>
              <Link href={`/signup${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}>
                CREATE A CLIENT FILE &rarr;
              </Link>
            </div>
            <p className="split-disclaimer">
              Only customers have accounts. Staff, barbers, and shop slots are managed in the Control Room.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
