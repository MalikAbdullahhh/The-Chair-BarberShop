"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight, ChevronUp, ChevronDown, X, RotateCcw } from "lucide-react";
import { useBooking } from "@/components/providers/BookingProvider";

export function BookingDock() {
  const pathname = usePathname();
  const b = useBooking();
  const [open, setOpen] = useState(false);

  // Suppress dock on booking pages, success page, or admin dashboard to prevent UI clutter
  if (pathname.startsWith("/booking") || pathname.startsWith("/admin")) {
    return null;
  }

  const hasSelection = !!(b.service || b.barber || b.date || b.time);

  if (!hasSelection) {
    return (
      <motion.div
        className="booking-nudge"
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 140, damping: 22 }}
      >
        <div className="nudge-left">
          <span className="nudge-pulse" />
          <span>NEXT CHAIR &bull; TODAY 17:30</span>
        </div>
        <Link href="/booking" data-cursor="BOOK">
          <span>RESERVE SLOT</span>
          <ArrowUpRight size={15} />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.aside
      layout
      className={`booking-dock-v2 ${open ? "expanded" : ""}`}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 24 }}
    >
      <div className="dock-summary-bar">
        <button
          type="button"
          className="dock-summary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle active booking summary"
        >
          <div className="dock-left">
            <small>CURRENT SELECTION</small>
            <b>{b.service?.name || "SERVICE PENDING"}</b>
            {b.addons.length > 0 && <span className="dock-addons-pill">+{b.addons.length} ADD-ONS</span>}
          </div>

          <div className="dock-meta">
            <span>{b.barber ? b.barber.name : "CHAIR OPEN"}</span>
            <small>{b.date ? `${b.date} ${b.time ? `@ ${b.time}` : ""}` : "TIME PENDING"}</small>
          </div>

          <div className="dock-right">
            <strong>£{b.totalPrice || 0}</strong>
            <i>{open ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</i>
          </div>
        </button>

        <button
          type="button"
          className="dock-clear-btn"
          title="Clear current selection"
          onClick={(e) => {
            e.stopPropagation();
            b.clear();
            setOpen(false);
          }}
        >
          <X size={15} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="dock-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="dock-step-card">
              <span>01 &bull; SERVICE</span>
              <b>{b.service?.name || "NOT SELECTED"}</b>
            </div>
            <div className="dock-step-card">
              <span>02 &bull; BARBER</span>
              <b>{b.barber ? `${b.barber.name} (CHAIR ${b.barber.chairNumber})` : "FIRST AVAILABLE"}</b>
            </div>
            <div className="dock-step-card">
              <span>03 &bull; DATE</span>
              <b>{b.date || "SELECT DATE"}</b>
            </div>
            <div className="dock-step-card">
              <span>04 &bull; TIME</span>
              <b>{b.time ? `${b.time} GMT` : "SELECT TIME"}</b>
            </div>

            <div className="dock-actions-row">
              <button
                type="button"
                className="dock-reset-action"
                onClick={() => {
                  b.clear();
                  setOpen(false);
                }}
              >
                <RotateCcw size={13} />
                <span>CLEAR</span>
              </button>
              <Link href="/booking" className="dock-continue-btn">
                <span>COMPLETE INTAKE &rarr;</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

