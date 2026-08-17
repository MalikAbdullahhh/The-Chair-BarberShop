"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Scissors, 
  MapPin, 
  ArrowLeft, 
  ShieldCheck, 
  Coffee, 
  Sparkles,
  Share2,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

function SuccessContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("id");
  const [appt, setAppt] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      return;
    }
    api<any>(`/appointments/${appointmentId}`)
      .then((data) => {
        if (data?.appointment) {
          setAppt(data.appointment);
        }
      })
      .catch(() => {
        // Graceful fallback
      })
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const serviceName = appt?.service?.name || "Full Restyle & Beard Sculpture";
  const serviceDuration = appt?.service?.duration || 45;
  const servicePrice = appt?.total ?? 49;
  const barberName = appt?.barber?.name || "Master Barber";
  const chairNumber = appt?.barber?.chairNumber || "001";
  const clientName = appt?.client?.name || "Julian Sterling";
  
  const formattedDate = appt?.startAt 
    ? new Date(appt.startAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Wednesday, 26 August 2026";

  const formattedTime = appt?.startAt
    ? new Date(appt.startAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) + " HRS"
    : "12:45 HRS";

  const passCode = appointmentId ? `#TC-${appointmentId.slice(-6).toUpperCase()}` : "#TC-70D84E";

  function handleAddToCalendar() {
    const title = encodeURIComponent(`Appointment at THE CHAIR with ${barberName}`);
    const details = encodeURIComponent(`Service: ${serviceName} (${serviceDuration} mins)\nStation: Chair ${chairNumber}\nAddress: 42 Redchurch Street, Shoreditch, London E2 7DP`);
    const location = encodeURIComponent("THE CHAIR, 42 Redchurch St, London E2 7DP");
    
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalUrl, "_blank");
    toast.success("Opening Google Calendar…");
  }

  function handleCopyReference() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(passCode);
      toast.success("Pass code copied to clipboard");
    }
  }

  return (
    <main className="theme-success-viewport">
      {/* STUDIO TOP HEADER */}
      <header className="theme-success-header">
        <div className="success-header-left">
          <Link href="/" className="success-logo">
            <span>THE</span> <b>CHAIR</b>
          </Link>
          <div className="success-status-tag">
            <span className="success-green-dot" />
            <span>CHAIR 0{chairNumber} RESERVED</span>
          </div>
        </div>

        <div className="success-header-right">
          <Link href="/" className="success-back-link">
            <ArrowLeft size={13} />
            <span>RETURN TO FRONT HOUSE</span>
          </Link>
        </div>
      </header>

      {/* CENTERED EDITORIAL CANVAS */}
      <div className="theme-success-canvas">
        <div className="theme-success-wrapper">
          {/* HERO TITLE SECTION */}
          <motion.div 
            className="theme-success-hero"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="success-eyebrow">STEP 06 / RESERVATION CONFIRMED</span>
            <h1 className="success-main-heading">
              YOUR CHAIR IS <em className="success-heading-em">LOCKED.</em>
            </h1>
            <p className="success-desc">
              Your appointment is confirmed and protected in our live atelier ledger. We look forward to welcoming you, <b>{clientName}</b>.
            </p>
          </motion.div>

          {/* DUAL-TONE EDITORIAL BOARDING PASS CARD */}
          <motion.div 
            className="theme-ticket-card"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* TICKET TOP (DARK LUXURY INK) */}
            <div className="ticket-top-dark">
              <div className="ticket-top-head">
                <div>
                  <span className="ticket-head-eyebrow">THE CHAIR &bull; LONDON E2</span>
                  <h3 className="ticket-head-title">OFFICIAL APPOINTMENT PASS</h3>
                </div>
                <div className="ticket-ref-badge">
                  <ShieldCheck size={14} />
                  <span>PASS {passCode}</span>
                </div>
              </div>

              {/* TICKET 4-GRID LEDGER */}
              <div className="ticket-ledger-grid">
                {/* SERVICE */}
                <div className="ticket-ledger-cell">
                  <span className="ledger-cell-lbl">
                    <Scissors size={12} /> SELECTED SERVICE
                  </span>
                  <b className="ledger-cell-title">{serviceName}</b>
                  <span className="ledger-cell-meta">{serviceDuration} MINS &bull; £{servicePrice}</span>
                </div>

                {/* BARBER / STATION */}
                <div className="ticket-ledger-cell">
                  <span className="ledger-cell-lbl">
                    <User size={12} /> BARBER &bull; STATION
                  </span>
                  <b className="ledger-cell-title">{barberName}</b>
                  <span className="ledger-cell-meta">CHAIR 0{chairNumber} &bull; MASTER SUITE</span>
                </div>

                {/* DATE */}
                <div className="ticket-ledger-cell">
                  <span className="ledger-cell-lbl">
                    <CalendarIcon size={12} /> APPOINTMENT DATE
                  </span>
                  <b className="ledger-cell-title">{formattedDate}</b>
                  <span className="ledger-cell-meta">TIMETABLE PROTECTED</span>
                </div>

                {/* TIME */}
                <div className="ticket-ledger-cell">
                  <span className="ledger-cell-lbl">
                    <Clock size={12} /> TIME WINDOW
                  </span>
                  <b className="ledger-cell-title font-mono">{formattedTime}</b>
                  <span className="ledger-cell-meta">ARRIVE 5 MINS PRIOR</span>
                </div>
              </div>
            </div>

            {/* PERFORATED NOTCHES DIVISION */}
            <div className="ticket-perforated-row">
              <div className="perforated-notch notch-left" />
              <div className="perforated-line" />
              <div className="perforated-notch notch-right" />
            </div>

            {/* TICKET BOTTOM (WARM PARCHMENT / BONE) */}
            <div className="ticket-bottom-bone">
              {/* PRIVILEGES */}
              <div className="ticket-amenities-row">
                <div className="amenity-pill">
                  <Coffee size={14} />
                  <span>Complimentary Single Malt &amp; House Pour Espresso</span>
                </div>
                <div className="amenity-pill">
                  <Sparkles size={14} />
                  <span>Hot Towel Conditioning &amp; Scalp Reset</span>
                </div>
                <div className="amenity-pill">
                  <MapPin size={14} />
                  <span>42 Redchurch St, Shoreditch</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="ticket-actions-row">
                <button 
                  type="button" 
                  className="ticket-btn is-primary"
                  onClick={handleAddToCalendar}
                >
                  <CalendarIcon size={14} />
                  <span>ADD TO CALENDAR</span>
                </button>

                <button 
                  type="button" 
                  className="ticket-btn is-secondary"
                  onClick={handleCopyReference}
                >
                  <Share2 size={14} />
                  <span>COPY PASS CODE</span>
                </button>

                <Link href="/account" className="ticket-btn is-secondary">
                  <User size={14} />
                  <span>CLIENT FILE</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* BOTTOM QUICK LINKS */}
          <motion.div 
            className="theme-success-foot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/house" className="success-foot-link">
              <span>EXPLORE ATELIER</span>
            </Link>
            <span className="foot-sep">&bull;</span>
            <Link href="/lookbook" className="success-foot-link">
              <span>LOOKBOOK ARCHIVE</span>
            </Link>
            <span className="foot-sep">&bull;</span>
            <Link href="/" className="success-foot-link is-strong">
              <span>BACK TO FRONT HOUSE &rarr;</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="theme-success-loading">LOADING RESERVATION…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
