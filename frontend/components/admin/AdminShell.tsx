"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Scissors,
  Users,
  Star,
  BookOpen,
  Images,
  Settings,
  LayoutDashboard,
  PanelsTopLeft,
  LogOut,
  Crown,
  Shield,
  Loader2
} from "lucide-react";

const nav = [
  ["Overview", "/admin", LayoutDashboard],
  ["Appointments", "/admin/appointments", CalendarDays],
  ["Services", "/admin/services", Scissors],
  ["Barbers", "/admin/barbers", Users],
  ["Clients", "/admin/clients", Users],
  ["Reviews", "/admin/reviews", Star],
  ["Journal", "/admin/journal", BookOpen],
  ["Lookbook", "/admin/lookbook", Images],
  ["Content", "/admin/content", PanelsTopLeft],
  ["Memberships", "/admin/memberships", Crown],
  ["Settings", "/admin/settings", Settings]
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const p = usePathname();
  const r = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("thechair_admin_token") : null;
    if (!token) {
      setAuthorized(false);
      setChecking(false);
      r.replace("/admin/login");
    } else {
      setAuthorized(true);
      setChecking(false);
    }
  }, [p, r]);

  // NEVER render the admin dashboard or shell if not authorized
  if (checking || !authorized) {
    return (
      <div className="admin-auth-shield">
        <div className="admin-shield-card">
          <Loader2 className="animate-spin admin-shield-spinner" size={26} />
          <span className="admin-shield-label">THE CHAIR &bull; CONTROL ROOM</span>
          <p className="admin-shield-sub">Verifying administrator authorization…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside>
        <Link href="/admin" className="admin-brand">
          THE CHAIR
          <small>CONTROL ROOM</small>
        </Link>
        <nav>
          {nav.map(([l, h, I]) => (
            <Link className={p === h ? "active" : ""} href={h} key={h}>
              <I size={17} />
              {l}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("thechair_admin_token");
            r.replace("/admin/login");
          }}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>
      <section className="admin-main">{children}</section>
    </div>
  );
}
