"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { usePublicData } from "@/components/providers/PublicDataProvider";
import { useBooking } from "@/components/providers/BookingProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Scissors, UserCheck, AlertCircle, RefreshCw, X, Check, ArrowRight, ShieldCheck } from "lucide-react";

export function ClientAccount() {
  const { barbers } = usePublicData();
  const booking = useBooking();
  const { user, client, login, register, logout, refresh: refreshAuth } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Change request modal state
  const [changeModalAppt, setChangeModalAppt] = useState<any | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [changeNotes, setChangeNotes] = useState("");
  const [changeSlots, setChangeSlots] = useState<string[]>([]);
  const [changeSlotsLoading, setChangeSlotsLoading] = useState(false);
  const [submittingChange, setSubmittingChange] = useState(false);

  async function loadData() {
    const token = typeof window !== "undefined" ? localStorage.getItem("thechair_client_token") : null;
    if (!token) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api<any>("/clients/me");
      setData(res);
    } catch {
      localStorage.removeItem("thechair_client_token");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  // Load available slots when newDate is selected in change modal
  useEffect(() => {
    if (changeModalAppt && newDate) {
      setChangeSlotsLoading(true);
      setNewTime("");
      const barberId = changeModalAppt.barber?._id || changeModalAppt.barber;
      const serviceId = changeModalAppt.service?._id || changeModalAppt.service;
      api<any>(`/availability?barberId=${barberId}&serviceId=${serviceId}&date=${newDate}`)
        .then((d) => {
          const s = d.slots || [];
          setChangeSlots(s.length ? s : ["09:30", "10:15", "11:00", "11:45", "14:00", "15:30", "16:45", "18:00"]);
        })
        .catch(() => {
          setChangeSlots(["09:30", "10:15", "11:00", "11:45", "14:00", "15:30", "16:45", "18:00"]);
        })
        .finally(() => setChangeSlotsLoading(false));
    }
  }, [changeModalAppt, newDate]);

  async function handleAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();

    setAuthLoading(true);
    try {
      if (mode === "register") {
        if (!name) throw new Error("Please enter your name");
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        await register(name, email, password, phone);
      } else {
        await login(email, password);
      }
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function submitChangeRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!changeModalAppt || !newDate || !newTime) {
      toast.error("Please pick a date and time");
      return;
    }
    setSubmittingChange(true);
    try {
      await api(`/appointments/${changeModalAppt._id}/request-change`, {
        method: "POST",
        body: JSON.stringify({
          newDate,
          newTime,
          notes: changeNotes
        })
      });
      toast.success("Schedule change requested. Waiting for studio approval.");
      setChangeModalAppt(null);
      setNewDate("");
      setNewTime("");
      setChangeNotes("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not submit change request");
    } finally {
      setSubmittingChange(false);
    }
  }

  async function preferBarber(id: string) {
    try {
      await api("/clients/me", {
        method: "PUT",
        body: JSON.stringify({ preferredBarber: id })
      });
      toast.success("Preferred chair updated");
      await loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function repeatLast() {
    const last = data?.history?.[0];
    if (last?.service) booking.setService(last.service);
    if (last?.barber) booking.setBarber(last.barber);
    router.push("/booking");
  }

  if (loading) {
    return (
      <main className="account-v2">
        <span>CLIENT FILE / LOADING</span>
        <h1>OPENING<br /><em>YOUR FILE.</em></h1>
        <div className="account-skeleton"><i /><i /><i /></div>
      </main>
    );
  }

  if (!data && !user) {
    return (
      <main className="account-v2">
        <section className="account-auth-intro">
          <span>01 / CLIENT ACCOUNT</span>
          <h1>
            {mode === "login" ? "WELCOME" : "YOUR"}
            <br />
            <em>{mode === "login" ? "BACK." : "CHAIR FILE."}</em>
          </h1>
          <p>
            {mode === "login"
              ? "Access your protected appointments, request booking changes, and view your style ledger."
              : "Save your contact details, preferred barber, and repeat previous setups with one tap."}
          </p>
        </section>

        <section className="account-auth-panel">
          <div className="account-auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              SIGN IN
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              NEW CLIENT
            </button>
          </div>

          <form onSubmit={handleAuth}>
            {mode === "register" && (
              <>
                <label>
                  FULL NAME
                  <input name="name" required placeholder="YOUR NAME" />
                </label>
                <label>
                  PHONE NUMBER
                  <input name="phone" required placeholder="+44 7911 123456" />
                </label>
              </>
            )}
            <label>
              EMAIL ADDRESS
              <input name="email" type="email" required placeholder="EMAIL" />
            </label>
            <label>
              PASSWORD
              <input name="password" type="password" minLength={8} required placeholder="8+ CHARACTERS" />
            </label>
            <button type="submit" disabled={authLoading}>
              {authLoading ? "PROCESSING…" : mode === "login" ? "OPEN MY FILE \u2192" : "CREATE MY FILE \u2192"}
            </button>
          </form>
          <small>ONLY CLIENTS CAN CREATE ACCOUNTS. BARBERS AND SHOP SLOTS ARE MANAGED FROM THE ADMIN ROOM.</small>
        </section>

        <section className="account-benefits">
          <span>02 / WHY A CLIENT FILE?</span>
          {[
            ["01", "CHANGE REQUESTS", "Easily request new dates/times for upcoming appointments."],
            ["02", "SAME AS LAST TIME", "Repeat your preferred service + barber without rebuilding."],
            ["03", "PREFERRED CHAIR", "Keep your usual barber one tap away on every visit."],
            ["04", "APPOINTMENT HISTORY", "Complete chronological ledger of all past cuts and treatments."]
          ].map(([n, t, c]) => (
            <article key={n}>
              <span>{n}</span>
              <b>{t}</b>
              <p>{c}</p>
            </article>
          ))}
        </section>
      </main>
    );
  }

  const upcomingList: any[] = data?.upcoming || (data?.next ? [data.next] : []);

  return (
    <main className="account-v2 logged">
      {/* WELCOME BANNER */}
      <section className="account-welcome">
        <div>
          <span>CLIENT FILE &bull; {data?.client?._id ? data.client._id.slice(-6).toUpperCase() : user?.id?.slice(-6).toUpperCase()}</span>
          <h1>
            WELCOME<br />
            <em>BACK, {String(data?.client?.name || user?.name || "CLIENT").split(" ")[0].toUpperCase()}.</em>
          </h1>
          <p className="account-contact-line">
            {data?.client?.email || user?.email} &bull; {data?.client?.phone || "No phone attached"}
          </p>
        </div>
        <div className="account-top-actions">
          <Link href="/booking" className="account-book-btn">
            BOOK NEW CHAIR &rarr;
          </Link>
          <button
            type="button"
            className="account-signout-btn"
            onClick={() => {
              logout();
              setData(null);
            }}
          >
            SIGN OUT
          </button>
        </div>
      </section>

      {/* UPCOMING APPOINTMENTS & CHANGE REQUESTS */}
      <section className="account-upcoming-section">
        <div className="section-head-row">
          <span>01 / UPCOMING APPOINTMENTS</span>
          <small>{upcomingList.length} RESERVED CHAIR{upcomingList.length === 1 ? "" : "S"}</small>
        </div>

        {upcomingList.length > 0 ? (
          <div className="upcoming-cards-grid">
            {upcomingList.map((appt, idx) => {
              const isChangeRequested = appt.status === "change_requested" || appt.changeRequest?.status === "pending";
              const dateStr = new Date(appt.startAt).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              });
              const timeStr = new Date(appt.startAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div key={appt._id || idx} className={`upcoming-card ${isChangeRequested ? "is-change-pending" : ""}`}>
                  <div className="upcoming-card-top">
                    <span className="card-index">TICKET 0{idx + 1}</span>
                    {isChangeRequested ? (
                      <span className="status-pill status-pending">
                        <RefreshCw size={12} className="spin-slow" />
                        CHANGE REQUESTED (WAITING FOR APPROVAL)
                      </span>
                    ) : (
                      <span className="status-pill status-confirmed">
                        <Check size={12} />
                        CONFIRMED &bull; LOCKED
                      </span>
                    )}
                  </div>

                  <div className="upcoming-card-body">
                    <div className="appt-main-info">
                      <h2>{appt.service?.name || "BESPOKE SERVICE"}</h2>
                      <p className="appt-barber">
                        WITH <b>{appt.barber?.name || "MASTER BARBER"}</b> &bull; CHAIR {appt.barber?.chairNumber || "01"}
                      </p>
                    </div>

                    <div className="appt-time-block">
                      <div className="time-row">
                        <Calendar size={15} />
                        <span>{dateStr}</span>
                      </div>
                      <div className="time-row">
                        <Clock size={15} />
                        <b>{timeStr} GMT ({appt.service?.duration || 45} MIN)</b>
                      </div>
                    </div>
                  </div>

                  {/* If change is requested, display the pending details */}
                  {isChangeRequested && appt.changeRequest && (
                    <div className="pending-change-banner">
                      <b>REQUESTED RESCHEDULE:</b>
                      <p>
                        Desired Slot: <strong>{appt.changeRequest.newDate} at {appt.changeRequest.newTime}</strong>
                      </p>
                      {appt.changeRequest.notes && (
                        <small>Note: &ldquo;{appt.changeRequest.notes}&rdquo;</small>
                      )}
                      <span className="awaiting-label">&bull; The shop master will review and update your confirmation shortly.</span>
                    </div>
                  )}

                  <div className="upcoming-card-actions">
                    {!isChangeRequested ? (
                      <button
                        type="button"
                        className="request-change-btn"
                        onClick={() => {
                          setChangeModalAppt(appt);
                          setNewDate("");
                          setNewTime("");
                          setChangeNotes("");
                        }}
                      >
                        REQUEST SCHEDULE CHANGE &rarr;
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="request-change-btn is-disabled"
                        disabled
                      >
                        CHANGE PENDING REVIEW
                      </button>
                    )}
                    <span className="appt-total">TOTAL: £{appt.total || appt.service?.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-upcoming-box">
            <b>NO CHAIR BOOKED CURRENTLY</b>
            <p>Ready for your next cut or beard session? Reserve a chair in real-time.</p>
            <Link href="/booking" className="book-now-cta">
              RESERVE A CHAIR &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* ONE-TAP REPEAT PREVIOUS SETUP */}
      <section className="same-last">
        <span>02 / ONE MOVE</span>
        <h2>SAME AS<br /><em>LAST TIME?</em></h2>
        <p>Your previous service and barber can instantly become the starting state of the next booking.</p>
        <button type="button" onClick={repeatLast}>REPEAT THE SETUP &rarr;</button>
      </section>

      {/* PREFERRED BARBER */}
      <section className="account-preference">
        <div>
          <span>03 / PREFERRED BARBER</span>
          <h2>{data?.client?.preferredBarber?.name || "NOT SET YET"}</h2>
          <p>Choose a default chair for faster repeat appointments.</p>
        </div>
        <div>
          {barbers.map((b, i) => (
            <motion.button
              key={b._id}
              whileHover={{ x: 10 }}
              className={data?.client?.preferredBarber?._id === b._id ? "active" : ""}
              onClick={() => preferBarber(b._id)}
            >
              <span>0{i + 1}</span>
              <b>{b.name}</b>
              <small>CHAIR {b.chairNumber}</small>
            </motion.button>
          ))}
        </div>
      </section>

      {/* HISTORICAL LEDGER */}
      <section className="account-history">
        <span>04 / HISTORY & LEDGER</span>
        <h2>PAST<br /><em>CHAIRS.</em></h2>
        <div>
          {data?.history?.length ? (
            data.history.map((x: any, i: number) => (
              <article key={x._id || i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <b>{new Date(x.startAt).toLocaleDateString("en-GB")}</b>
                <strong>{x.service?.name}</strong>
                <small>{x.barber?.name || "BARBER"}</small>
                <em>£{x.total || x.service?.price}</em>
              </article>
            ))
          ) : (
            <p>NO PREVIOUS APPOINTMENTS IN LEDGER YET.</p>
          )}
        </div>
      </section>

      {/* REVIEW CALLOUT */}
      <section className="account-review">
        <span>05 / AFTER THE CHAIR</span>
        <h2>HOW WAS<br /><em>THE CHAIR?</em></h2>
        <Link href="/review">LEAVE A CLIENT NOTE &rarr;</Link>
      </section>

      {/* CHANGE REQUEST MODAL */}
      <AnimatePresence>
        {changeModalAppt && (
          <motion.div
            className="auth-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setChangeModalAppt(null)}
          >
            <motion.div
              className="change-request-modal"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="auth-modal-close"
                onClick={() => setChangeModalAppt(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="change-modal-head">
                <span>THE CHAIR &bull; RESCHEDULE REQUEST</span>
                <h2>REQUEST NEW<br /><em>APPOINTMENT TIME.</em></h2>
                <p>
                  Current appointment: <strong>{changeModalAppt.service?.name}</strong> with <strong>{changeModalAppt.barber?.name}</strong> on <strong>{new Date(changeModalAppt.startAt).toLocaleDateString("en-GB")} at {new Date(changeModalAppt.startAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</strong>.
                </p>
              </div>

              <form onSubmit={submitChangeRequest} className="change-modal-form">
                <label>
                  SELECT NEW DESIRED DATE
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </label>

                {newDate && (
                  <div className="change-slots-section">
                    <span>SELECT AVAILABLE TIME SLOT</span>
                    {changeSlotsLoading ? (
                      <p className="slots-loading">CHECKING BARBER AVAILABILITY…</p>
                    ) : changeSlots.length > 0 ? (
                      <div className="change-slots-grid">
                        {changeSlots.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            className={`change-slot-btn ${newTime === slot ? "active" : ""}`}
                            onClick={() => setNewTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="no-slots-text">No slots found for this date. Pick another date.</p>
                    )}
                  </div>
                )}

                <label>
                  REASON OR ADDITIONAL NOTES (OPTIONAL)
                  <textarea
                    placeholder="e.g. Flight was delayed by 2 hours, looking to push back to late afternoon..."
                    value={changeNotes}
                    onChange={(e) => setChangeNotes(e.target.value)}
                    rows={3}
                  />
                </label>

                <div className="change-modal-actions">
                  <button
                    type="submit"
                    className="submit-change-btn"
                    disabled={!newDate || !newTime || submittingChange}
                  >
                    {submittingChange ? "SUBMITTING REQUEST…" : "SUBMIT CHANGE REQUEST FOR APPROVAL \u2192"}
                  </button>
                  <button
                    type="button"
                    className="cancel-change-btn"
                    onClick={() => setChangeModalAppt(null)}
                  >
                    Keep Existing Appointment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
