"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { media } from "@/data/media";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, ShieldCheck, Check, Sparkles } from "lucide-react";

export function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { register, user } = useAuth();
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
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();

    if (!name || name.length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone);
      router.push(redirectUrl);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="split-auth-page">
      {/* 50% LEFT: EDITORIAL PHOTOGRAPHY & BENEFITS */}
      <section className="split-auth-media">
        <Image
          src={media.tools}
          alt="Japanese steel shears and barber tools"
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
          <span className="split-media-eyebrow">CLIENT PRIVILEGES</span>
          <h2>A FILE BUILT<br /><em>FOR CONTINUITY.</em></h2>
          <div className="split-benefits-list">
            <div className="benefit-item">
              <Check size={14} />
              <span>Request appointment reschedules directly from your client file</span>
            </div>
            <div className="benefit-item">
              <Check size={14} />
              <span>One-tap rebooking with your preferred master barber</span>
            </div>
            <div className="benefit-item">
              <Check size={14} />
              <span>Complete timeline of style reference records and past treatments</span>
            </div>
          </div>
        </div>
      </section>

      {/* 50% RIGHT: REGISTRATION FORM */}
      <section className="split-auth-form-panel">
        <div className="split-form-container">
          <div className="split-top-nav">
            <Link href="/" className="split-back-link">
              <ArrowLeft size={15} />
              <span>RETURN TO MAIN HOUSE</span>
            </Link>
            <span className="split-portal-tag">01 / NEW CLIENT FILE</span>
          </div>

          <header className="split-form-header">
            <div className="split-eyebrow">
              <ShieldCheck size={12} />
              <span>NEW DOSSIER &bull; REGISTER</span>
            </div>
            <h1>
              OPEN YOUR<br />
              <em>CLIENT FILE.</em>
            </h1>
            <p>
              Create your account once. Save your contact details, preferred chair, and manage booking adjustments effortlessly.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="split-form">
            <div className="split-field">
              <label htmlFor="signup-name">YOUR FULL NAME</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                required
                placeholder="e.g. Julian Sterling"
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className="split-field">
              <label htmlFor="signup-phone">PHONE NUMBER</label>
              <input
                id="signup-phone"
                name="phone"
                type="tel"
                required
                placeholder="+44 7911 123456"
                autoComplete="tel"
              />
            </div>

            <div className="split-field">
              <label htmlFor="signup-email">EMAIL ADDRESS</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>

            <div className="split-field">
              <label htmlFor="signup-password">PASSWORD</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="8+ characters"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="split-submit-btn" disabled={loading}>
              <span>{loading ? "CREATING YOUR FILE…" : "CREATE MY CLIENT FILE"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <footer className="split-form-footer">
            <div className="split-switch-row">
              <span>ALREADY HAVE A CLIENT FILE?</span>
              <Link href={`/signin${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}>
                SIGN IN &rarr;
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
