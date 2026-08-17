"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Calendar as CalendarIcon,
  Scissors,
  UserCheck,
  Plus,
  Minus,
  AlertCircle,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { barbers as localBarbers, services as localServices } from "@/data/site";
import { media } from "@/data/media";
import type { Barber, Service } from "@/lib/types";
import { useBooking } from "@/components/providers/BookingProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePublicData } from "@/components/providers/PublicDataProvider";

const steps = [
  ["01", "SERVICE"],
  ["02", "BARBER"],
  ["03", "DATE"],
  ["04", "TIME"],
  ["05", "DETAILS"]
] as const;

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 })
};

const addonOptions = [
  {
    _id: "addon-beard-oil",
    name: "Hot Towel & Botanical Beard Oil",
    duration: 10,
    price: 12,
    slug: "botanical-beard-oil",
    description: "Deep steam treatment followed by cold-pressed cedar & bergamot tonic."
  },
  {
    _id: "addon-scalp-treatment",
    name: "Purifying Clay Scalp Detox",
    duration: 15,
    price: 18,
    slug: "scalp-detox",
    description: "Exfoliating mineral treatment to stimulate follicle microcirculation."
  },
  {
    _id: "addon-charcoal-mask",
    name: "Activated Charcoal Face Compress",
    duration: 10,
    price: 14,
    slug: "charcoal-compress",
    description: "Deep pore purification and chilled rosewater toning compress."
  }
];

export function BookingFlow() {
  const b = useBooking();
  const { user, client, login, register: registerClient } = useAuth();
  const { services: publicServices, barbers: publicBarbers } = usePublicData();

  const services = useMemo(() => {
    return publicServices?.length ? publicServices : (localServices as Service[]);
  }, [publicServices]);

  const barbers = useMemo(() => {
    return publicBarbers?.length ? publicBarbers : (localBarbers as Barber[]);
  }, [publicBarbers]);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"first" | "choose">("choose");
  const [timeFilter, setTimeFilter] = useState<"all" | "morning" | "afternoon" | "evening">("all");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Auth gate modal state for unauthenticated users reaching Step 5
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateTab, setAuthGateTab] = useState<"choose" | "login" | "register">("choose");
  const [guestConfirmed, setGuestConfirmed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<any>();

  useEffect(() => {
    if (user) {
      if (user.name) setValue("name", user.name);
      if (user.email) setValue("email", user.email);
      if (client?.phone) setValue("phone", client.phone);
    }
  }, [user, client, setValue]);

  // Open auth gate when entering Step 5 if user is not authenticated and has not chosen guest
  useEffect(() => {
    if (step === 4 && !user && !guestConfirmed) {
      setAuthGateOpen(true);
      setAuthGateTab("choose");
    }
  }, [step, user, guestConfirmed]);

  // Fetch real availability slots when step is on TIME
  useEffect(() => {
    if (step === 3 && b.service && b.barber && b.date) {
      setLoading(true);
      api<any>(`/availability?barberId=${b.barber._id}&serviceId=${b.service._id}&date=${b.date}`)
        .then((d) => {
          const fetched = d.slots || [];
          if (fetched.length) {
            setSlots(fetched);
          } else {
            setSlots(["09:30", "10:15", "11:00", "11:45", "13:30", "14:15", "15:00", "16:30", "17:15", "18:00", "18:45"]);
          }
        })
        .catch(() => {
          setSlots(["09:30", "10:15", "11:00", "11:45", "13:30", "14:15", "15:00", "16:30", "17:15", "18:00", "18:45"]);
        })
        .finally(() => setLoading(false));
    }
  }, [step, b.service, b.barber, b.date]);

  // Generate next 14 consecutive calendar dates
  const dates = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      list.push(d.toISOString().split("T")[0]);
    }
    return list;
  }, []);

  // Custom Full House Calendar days generator
  const calendarMonthDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split("T")[0];
    
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isPast: boolean; isToday: boolean }[] = [];
    
    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        dateStr,
        dayNum: prevMonthDays - i,
        isCurrentMonth: false,
        isPast: dateStr < todayStr,
        isToday: dateStr === todayStr
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        isPast: dateStr < todayStr,
        isToday: dateStr === todayStr
      });
    }
    
    // Next month padding to keep grid rectangular (35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isPast: dateStr < todayStr,
        isToday: dateStr === todayStr
      });
    }
    
    return days;
  }, [viewMonth]);

  function prevMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  // Filter slots by time of day
  const filteredSlots = useMemo(() => {
    return slots.filter((time) => {
      const hour = parseInt(time.split(":")[0], 10);
      if (timeFilter === "morning") return hour < 12;
      if (timeFilter === "afternoon") return hour >= 12 && hour < 17;
      if (timeFilter === "evening") return hour >= 17;
      return true;
    });
  }, [slots, timeFilter]);

  const canContinue = [
    !!b.service,
    !!b.barber,
    !!b.date,
    !!b.time,
    true
  ];

  function go(n: number) {
    setDir(n > step ? 1 : -1);
    setStep(Math.max(0, Math.min(4, n)));
  }

  function handleNext() {
    if (step < 4 && canContinue[step]) {
      go(step + 1);
    }
  }

  async function handleGateAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();

    setAuthLoading(true);
    try {
      if (authGateTab === "register") {
        if (!name) throw new Error("Please enter your name");
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        await registerClient(name, email, password, phone);
        setValue("name", name);
        setValue("email", email);
        if (phone) setValue("phone", phone);
      } else {
        const res = await login(email, password);
        setValue("name", res.user.name);
        setValue("email", res.user.email);
        if (res.client?.phone) setValue("phone", res.client.phone);
      }
      setAuthGateOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function submit(v: any) {
    if (!b.service || !b.barber || !b.date || !b.time) return;
    
    const hasPhone = Boolean(v.phone?.trim());
    const hasEmail = Boolean(v.email?.trim());
    if (!hasPhone && !hasEmail) {
      toast.error("Please provide at least a phone number or an email address to confirm your appointment.");
      return;
    }

    setLoading(true);
    try {
      const notesArray = [
        v.notes,
        b.addons.length ? `Selected Add-ons: ${b.addons.map((a) => a.name).join(", ")}` : null
      ].filter(Boolean);

      const token = typeof window !== "undefined" ? localStorage.getItem("thechair_client_token") : null;

      const out = await api<any>("/appointments", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify({
          serviceId: b.service._id,
          barberId: b.barber._id,
          date: b.date,
          time: b.time,
          client: {
            name: v.name?.trim(),
            phone: v.phone?.trim() || "",
            email: v.email?.trim() || "",
            notes: notesArray.join("\n")
          }
        })
      });
      toast.success("Your chair is confirmed and protected.");
      b.clear();
      location.href = `/booking/success?id=${out.appointment._id}`;
    } catch (e: any) {
      toast.error(e.message || "Could not lock that chair");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="booking-studio-viewport">
      {/* COMPACT TOP BAR (56px) */}
      <header className="booking-studio-topbar">
        <div className="booking-top-brand">
          <Link href="/" className="booking-logo">
            <b>THE</b><strong>CHAIR</strong>
          </Link>
          <Link href="/" className="booking-exit-link">
            <ArrowLeft size={12} />
            <span>EXIT TO HOUSE</span>
          </Link>
        </div>

        {/* STEP NAVIGATOR */}
        <nav className="booking-step-pills">
          {steps.map(([num, label], i) => (
            <button
              key={label}
              type="button"
              className={`step-pill ${i === step ? "is-active" : ""} ${i < step ? "is-completed" : ""}`}
              disabled={i > step && !canContinue[i - 1]}
              onClick={() => go(i)}
            >
              <span className="step-pill-num">{i < step ? <Check size={10} /> : num}</span>
              <span className="step-pill-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="booking-top-user">
          {user ? (
            <Link href="/account" className="booking-client-tag">
              <User size={11} />
              <span>{user.name.split(" ")[0].toUpperCase()}</span>
            </Link>
          ) : (
            <span className="booking-client-tag is-guest">
              <span>GUEST INTAKE</span>
            </span>
          )}
        </div>
      </header>

      {/* ZERO-SCROLL BODY (100% CONTAINER FIT) */}
      <div className="booking-studio-body">
        {/* LEFT INTERACTION CANVAS */}
        <section className="booking-studio-canvas">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="booking-step-content"
            >
              {/* STEP 1: SERVICE SELECTION */}
              {step === 0 && (
                <div className="studio-step-pane">
                  <header className="studio-step-header">
                    <span className="studio-step-eyebrow">STEP 01 / APPOINTMENT PURPOSE</span>
                    <h2>SELECT YOUR SERVICE</h2>
                  </header>

                  <div className="studio-service-grid">
                    {services.map((s, i) => {
                      const isSelected = Boolean(
                        b.service && (b.service._id === s._id || (s.slug && b.service.slug === s.slug) || b.service.name === s.name)
                      );
                      return (
                        <button
                          key={s._id || s.slug || `svc-${i}`}
                          type="button"
                          className={`studio-service-card ${isSelected ? "selected" : ""}`}
                          onClick={() => b.setService(s)}
                        >
                          <div className="svc-card-left">
                            <span className="svc-index-num">0{i + 1}</span>
                            <div className="svc-title-wrap">
                              <h3>{s.name}</h3>
                              <p>{s.description}</p>
                            </div>
                          </div>
                          <div className="svc-card-right">
                            <span className="svc-price-tag">£{s.price}</span>
                            <span className="svc-duration-badge">
                              <Clock size={11} />
                              {s.duration}m
                            </span>
                            {isSelected && (
                              <span className="svc-selected-pill">
                                <Check size={10} /> SELECTED
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* COMPACT ADD-ONS */}
                  <div className="studio-addons-shelf">
                    <div className="addons-shelf-head">
                      <span className="addons-shelf-title">OPTIONAL CARE &amp; TREATMENTS</span>
                      <span className="addons-shelf-hint">Select any to include in today&apos;s session</span>
                    </div>
                    <div className="studio-addons-row">
                      {addonOptions.map((addon) => {
                        const isAdded = b.addons.some((x) => x._id === addon._id || x.name === addon.name);
                        return (
                          <button
                            key={addon._id}
                            type="button"
                            className={`studio-addon-pill ${isAdded ? "is-added" : ""}`}
                            onClick={() => b.toggleAddon(addon as any)}
                          >
                            <div className="addon-pill-content">
                              <span className="addon-pill-name">{addon.name}</span>
                              <span className="addon-pill-meta">+{addon.duration}m &bull; +£{addon.price}</span>
                            </div>
                            <span className={`addon-pill-toggle ${isAdded ? "added" : ""}`}>
                              {isAdded ? <Check size={11} /> : <Plus size={11} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* IN-CANVAS PROMINENT ACTION STRIP */}
                  <div className="studio-canvas-footer">
                    <div className="canvas-status-indicator">
                      {b.service ? (
                        <span className="status-selected">
                          <CheckCircle2 size={14} />
                          <b>{b.service.name}</b> (£{b.service.price}) {b.addons.length > 0 ? `+ ${b.addons.length} Add-on${b.addons.length > 1 ? "s" : ""}` : ""}
                        </span>
                      ) : (
                        <span className="status-prompt">
                          &bull; Please choose a service above to continue
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="studio-canvas-continue-btn"
                      disabled={!b.service}
                      onClick={handleNext}
                    >
                      <span>CONTINUE TO BARBER</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: BARBER SELECTION */}
              {step === 1 && (
                <div className="studio-step-pane">
                  <header className="studio-step-header">
                    <span className="studio-step-eyebrow">STEP 02 / CRAFT SPECIALIST</span>
                    <h2>WHO TAKES THE CHAIR?</h2>
                  </header>

                  <div className="studio-barber-selector">
                    {/* FASTEST OPENING ROW */}
                    <button
                      type="button"
                      className={`studio-first-available-card ${mode === "first" && b.barber ? "selected" : ""}`}
                      onClick={() => {
                        setMode("first");
                        b.setBarber(barbers[0]);
                      }}
                    >
                      <div className="fa-left">
                        <Sparkles size={14} />
                        <b>FIRST AVAILABLE MASTER BARBER</b>
                        <span className="fa-tag">EARLIEST OPENING</span>
                      </div>
                      <span className="fa-action">
                        {mode === "first" && b.barber ? "✓ SELECTED" : "CHOOSE FIRST OPENING"}
                      </span>
                    </button>

                    {/* 4 BARBERS ROW */}
                    <div className="studio-barber-grid">
                      {barbers.map((barber, i) => {
                        const isSelected = Boolean(
                          b.barber && (b.barber._id === barber._id || (barber.slug && b.barber.slug === barber.slug) || b.barber.name === barber.name) && mode !== "first"
                        );
                        return (
                          <button
                            key={barber._id || barber.slug || `barber-${i}`}
                            type="button"
                            className={`studio-barber-card ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              setMode("choose");
                              b.setBarber(barber);
                            }}
                          >
                            <div className="barber-thumb-wrap">
                              <Image
                                src={barber.portrait || media.portraits[i % 4]}
                                alt={barber.name}
                                fill
                                sizes="160px"
                              />
                              <span className="chair-tag">CHAIR 0{barber.chairNumber}</span>
                            </div>
                            <div className="barber-card-info">
                              <h3>{barber.name}</h3>
                              <p>{barber.specialties[0] || "MASTER BARBER"}</p>
                            </div>
                            <span className="barber-card-action">
                              {isSelected ? "✓ SELECTED" : "SELECT CHAIR"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* IN-CANVAS PROMINENT ACTION STRIP */}
                  <div className="studio-canvas-footer">
                    <div className="canvas-status-indicator">
                      {b.barber ? (
                        <span className="status-selected">
                          <CheckCircle2 size={14} />
                          <b>{mode === "first" ? "First Available Barber" : b.barber.name}</b> (Chair 0{b.barber.chairNumber})
                        </span>
                      ) : (
                        <span className="status-prompt">
                          &bull; Please select a barber to continue
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="studio-canvas-continue-btn"
                      disabled={!b.barber}
                      onClick={handleNext}
                    >
                      <span>CONTINUE TO DATE</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DATE SELECTION */}
              {step === 2 && (
                <div className="studio-step-pane">
                  <header className="studio-step-header">
                    <span className="studio-step-eyebrow">STEP 03 / SCHEDULE SELECTION</span>
                    <h2>CHOOSE YOUR DATE</h2>
                  </header>

                  <div className="studio-dates-grid">
                    {dates.map((d, i) => {
                      const dateObj = new Date(`${d}T12:00:00`);
                      const isSelected = b.date === d;
                      const weekday = i === 0 ? "TODAY" : i === 1 ? "TMRW" : dateObj.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
                      const month = dateObj.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
                      const dayNum = dateObj.getDate();

                      return (
                        <button
                          key={d}
                          type="button"
                          className={`studio-date-card ${isSelected ? "selected" : ""}`}
                          onClick={() => b.setDate(d)}
                        >
                          <span className="date-card-day-label">{weekday}</span>
                          <b className="date-card-num">{dayNum}</b>
                          <span className="date-card-month">{month}</span>
                          {isSelected && <span className="date-card-check">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="studio-custom-date-row">
                    <button
                      type="button"
                      className="custom-date-toggle"
                      onClick={() => setCalendarOpen(true)}
                    >
                      <CalendarIcon size={13} />
                      <span>{b.date ? `SELECTED: ${b.date} • CHANGE DATE` : "LOOKING FOR A FUTURE DATE? OPEN FULL CALENDAR"}</span>
                    </button>
                  </div>

                  {/* IN-CANVAS PROMINENT ACTION STRIP */}
                  <div className="studio-canvas-footer">
                    <div className="canvas-status-indicator">
                      {b.date ? (
                        <span className="status-selected">
                          <CheckCircle2 size={14} />
                          <b>Date: {b.date}</b>
                        </span>
                      ) : (
                        <span className="status-prompt">
                          &bull; Please choose an appointment date above
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="studio-canvas-continue-btn"
                      disabled={!b.date}
                      onClick={handleNext}
                    >
                      <span>CONTINUE TO TIME</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: TIME SLOTS */}
              {step === 3 && (
                <div className="studio-step-pane">
                  <header className="studio-step-header">
                    <div className="step-head-split">
                      <div>
                        <span className="studio-step-eyebrow">STEP 04 / TIME OF APPOINTMENT</span>
                        <h2>SELECT TIME SLOT</h2>
                      </div>
                      <div className="studio-time-filters">
                        {(["all", "morning", "afternoon", "evening"] as const).map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            className={`time-filter-btn ${timeFilter === filter ? "active" : ""}`}
                            onClick={() => setTimeFilter(filter)}
                          >
                            {filter.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </header>

                  {loading ? (
                    <div className="studio-slots-loading">
                      <Clock className="animate-spin" size={20} />
                      <span>CHECKING STUDIO TIMETABLE…</span>
                    </div>
                  ) : filteredSlots.length === 0 ? (
                    <div className="studio-no-slots">
                      <AlertCircle size={18} />
                      <p>No available openings in this window. Try selecting another date or period.</p>
                    </div>
                  ) : (
                    <div className="studio-slots-grid">
                      {filteredSlots.map((time) => {
                        const isSelected = b.time === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            className={`studio-slot-pill ${isSelected ? "selected" : ""}`}
                            onClick={() => b.setTime(time)}
                          >
                            <span className="slot-time-text">{time}</span>
                            {isSelected && <span className="slot-selected-mark">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* IN-CANVAS PROMINENT ACTION STRIP */}
                  <div className="studio-canvas-footer">
                    <div className="canvas-status-indicator">
                      {b.time ? (
                        <span className="status-selected">
                          <CheckCircle2 size={14} />
                          <b>Time: {b.time} HRS</b> on {b.date}
                        </span>
                      ) : (
                        <span className="status-prompt">
                          &bull; Please choose a time slot to continue
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="studio-canvas-continue-btn"
                      disabled={!b.time}
                      onClick={handleNext}
                    >
                      <span>CONTINUE TO DETAILS</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: DETAILS INTAKE */}
              {step === 4 && (
                <div className="studio-step-pane">
                  <header className="studio-step-header">
                    <span className="studio-step-eyebrow">STEP 05 / CLIENT FILE INTAKE</span>
                    <h2>CONFIRM YOUR RESERVATION</h2>
                    <p className="studio-step-subtext">
                      Please enter your name and at least one contact method (phone number or email address) to lock your appointment.
                    </p>
                  </header>

                  {user && (
                    <div className="client-attached-banner">
                      <ShieldCheck size={15} />
                      <span>CLIENT FILE ATTACHED &bull; {user.name} ({user.email})</span>
                    </div>
                  )}

                  <form id="booking-submit-form" onSubmit={handleSubmit(submit)} className="studio-intake-form">
                    <div className="intake-form-grid">
                      <div className="studio-field intake-full-width">
                        <label htmlFor="intake-name">FULL NAME *</label>
                        <input
                          id="intake-name"
                          type="text"
                          required
                          placeholder="e.g. Julian Sterling"
                          {...register("name", { required: true })}
                        />
                      </div>

                      <div className="studio-field">
                        <label htmlFor="intake-phone">
                          PHONE NUMBER <span className="field-req-tag">(OR EMAIL REQUIRED)</span>
                        </label>
                        <input
                          id="intake-phone"
                          type="tel"
                          placeholder="+44 7911 123456"
                          {...register("phone")}
                        />
                      </div>

                      <div className="studio-field">
                        <label htmlFor="intake-email">
                          EMAIL ADDRESS <span className="field-req-tag">(OR PHONE REQUIRED)</span>
                        </label>
                        <input
                          id="intake-email"
                          type="email"
                          placeholder="name@example.com"
                          {...register("email")}
                        />
                      </div>

                      <div className="studio-field intake-full-width">
                        <label htmlFor="intake-notes">BARBER NOTES / STYLE REQUESTS (OPTIONAL)</label>
                        <input
                          id="intake-notes"
                          type="text"
                          placeholder="Texture notes, growth patterns, skin sensitivity, or styling preferences…"
                          {...register("notes")}
                        />
                      </div>
                    </div>
                  </form>

                  {/* IN-CANVAS PROMINENT ACTION STRIP */}
                  <div className="studio-canvas-footer">
                    <div className="canvas-status-indicator">
                      <span className="status-selected">
                        <ShieldCheck size={15} />
                        <b>Ready to lock chair:</b> {b.service?.name} on {b.date} at {b.time} HRS
                      </span>
                    </div>

                    <button
                      type="submit"
                      form="booking-submit-form"
                      className="studio-canvas-continue-btn is-confirm"
                      disabled={loading}
                    >
                      <span>{loading ? "PROTECTING CHAIR…" : "CONFIRM RESERVATION"}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* RIGHT LIVE DOSSIER LEDGER (340px) */}
        <aside className="booking-studio-dossier">
          <div className="dossier-card">
            <header className="dossier-header">
              <div className="dossier-header-top">
                <span className="dossier-eyebrow">RESERVATION LEDGER</span>
                <span className="dossier-live-dot" />
              </div>
              <h3>APPOINTMENT SUMMARY</h3>
            </header>

            <div className="dossier-entries">
              {/* SERVICE ENTRY */}
              <div className={`dossier-item-card ${b.service ? "is-filled" : ""}`} onClick={() => go(0)}>
                <div className="dossier-item-head">
                  <span className="dossier-item-tag">
                    <Scissors size={11} /> 01 SERVICE
                  </span>
                  {b.service && <span className="dossier-change-btn">EDIT</span>}
                </div>
                {b.service ? (
                  <div className="dossier-item-body">
                    <b className="dossier-main-title">{b.service.name}</b>
                    <span className="dossier-sub-meta">{b.service.duration} MIN &bull; £{b.service.price}</span>
                  </div>
                ) : (
                  <div className="dossier-item-empty">NOT SELECTED</div>
                )}
              </div>

              {/* BARBER ENTRY */}
              <div className={`dossier-item-card ${b.barber ? "is-filled" : ""}`} onClick={() => go(1)}>
                <div className="dossier-item-head">
                  <span className="dossier-item-tag">
                    <UserCheck size={11} /> 02 BARBER
                  </span>
                  {b.barber && <span className="dossier-change-btn">EDIT</span>}
                </div>
                {b.barber ? (
                  <div className="dossier-item-body">
                    <b className="dossier-main-title">{b.barber.name}</b>
                    <span className="dossier-sub-meta">CHAIR 0{b.barber.chairNumber}</span>
                  </div>
                ) : (
                  <div className="dossier-item-empty">NOT SELECTED</div>
                )}
              </div>

              {/* SCHEDULE ENTRY (DATE + TIME) */}
              <div className={`dossier-item-card ${(b.date || b.time) ? "is-filled" : ""}`} onClick={() => go(b.date ? 3 : 2)}>
                <div className="dossier-item-head">
                  <span className="dossier-item-tag">
                    <CalendarIcon size={11} /> 03 &bull; 04 SCHEDULE
                  </span>
                  {(b.date || b.time) && <span className="dossier-change-btn">EDIT</span>}
                </div>
                {b.date || b.time ? (
                  <div className="dossier-item-body">
                    <b className="dossier-main-title">{b.date || "DATE PENDING"}</b>
                    <span className="dossier-sub-meta">{b.time ? `${b.time} HRS` : "TIME PENDING"}</span>
                  </div>
                ) : (
                  <div className="dossier-item-empty">NOT SELECTED</div>
                )}
              </div>

              {/* ADD-ONS LIST */}
              {b.addons.length > 0 && (
                <div className="dossier-addons-block">
                  <div className="dossier-addons-title">
                    <Sparkles size={11} />
                    <span>ADD-ON TREATMENTS ({b.addons.length})</span>
                  </div>
                  <div className="dossier-addons-list">
                    {b.addons.map((a) => (
                      <div key={a._id} className="dossier-addon-row">
                        <span className="addon-row-name">&bull; {a.name}</span>
                        <span className="addon-row-price">+£{a.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* TOTALS & ACTIONS */}
            <div className="dossier-footer">
              <div className="dossier-totals-box">
                <div className="dossier-total-col">
                  <span className="total-label">SESSION TIME</span>
                  <b className="total-val">{b.totalDuration} MIN</b>
                </div>
                <div className="dossier-total-col text-right">
                  <span className="total-label">TOTAL INVESTMENT</span>
                  <b className="total-val-price">£{b.totalPrice}</b>
                </div>
              </div>

              <div className="dossier-actions">
                {step < 4 ? (
                  <button
                    type="button"
                    className="dossier-primary-btn"
                    disabled={!canContinue[step]}
                    onClick={handleNext}
                  >
                    <span>CONTINUE TO {steps[step + 1][1]}</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="booking-submit-form"
                    className="dossier-primary-btn is-confirm"
                    disabled={loading}
                  >
                    <span>{loading ? "PROTECTING CHAIR…" : "CONFIRM RESERVATION"}</span>
                    <ArrowRight size={15} />
                  </button>
                )}

                {step > 0 && (
                  <button
                    type="button"
                    className="dossier-prev-btn"
                    onClick={() => go(step - 1)}
                  >
                    <ArrowLeft size={13} />
                    <span>BACK TO {steps[step - 1][1]}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* LUXURY THEME CALENDAR MODAL */}
      <AnimatePresence>
        {calendarOpen && (
          <motion.div
            className="theme-cal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCalendarOpen(false)}
          >
            <motion.div
              className="theme-cal-card"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cal-card-head">
                <div>
                  <span className="cal-eyebrow">HOUSE SCHEDULE</span>
                  <h3>
                    {viewMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" }).toUpperCase()}
                  </h3>
                </div>

                <div className="cal-head-actions">
                  <div className="cal-month-nav">
                    <button type="button" className="cal-nav-btn" onClick={prevMonth} aria-label="Previous Month">
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button" className="cal-nav-btn" onClick={nextMonth} aria-label="Next Month">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button type="button" className="cal-close-btn" onClick={() => setCalendarOpen(false)} aria-label="Close Calendar">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* WEEKDAY HEADERS */}
              <div className="cal-weekdays-row">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                  <span key={day} className="cal-weekday-label">{day}</span>
                ))}
              </div>

              {/* DAYS GRID */}
              <div className="cal-days-grid">
                {calendarMonthDays.map((item) => {
                  const isSelected = b.date === item.dateStr;
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      disabled={item.isPast}
                      className={`cal-day-cell ${isSelected ? "selected" : ""} ${item.isToday ? "today" : ""} ${!item.isCurrentMonth ? "other-month" : ""}`}
                      onClick={() => {
                        b.setDate(item.dateStr);
                        setCalendarOpen(false);
                        toast.success(`Date set to ${item.dateStr}`);
                      }}
                    >
                      <span className="cal-day-num">{item.dayNum}</span>
                      {isSelected && <span className="cal-selected-dot" />}
                      {item.isToday && !isSelected && <span className="cal-today-dot" />}
                    </button>
                  );
                })}
              </div>

              {/* CALENDAR FOOTER */}
              <div className="cal-card-footer">
                <button
                  type="button"
                  className="cal-today-btn"
                  onClick={() => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    b.setDate(todayStr);
                    setCalendarOpen(false);
                  }}
                >
                  TODAY&apos;S CHAIR
                </button>
                <span className="cal-legend">
                  <span className="legend-dot" /> AVAILABLE OPENINGS
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTH GATE MODAL */}
      <AnimatePresence>
        {authGateOpen && (
          <motion.div
            className="auth-gate-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="auth-gate-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                className="gate-close-btn"
                onClick={() => setAuthGateOpen(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              {authGateTab === "choose" && (
                <div className="gate-choose-pane">
                  <div className="gate-header">
                    <span className="gate-eyebrow">CLIENT DOSSIER INTAKE</span>
                    <h3>HOW WOULD YOU LIKE TO PROCEED?</h3>
                    <p>
                      Creating a client file saves your haircut notes, preferred chair, and allows 1-tap schedule change requests.
                    </p>
                  </div>

                  <div className="gate-options-grid">
                    <button
                      type="button"
                      className="gate-option-card is-primary"
                      onClick={() => setAuthGateTab("register")}
                    >
                      <div className="gate-card-icon">
                        <ShieldCheck size={22} />
                      </div>
                      <b>CREATE CLIENT FILE</b>
                      <p>Save profile for future 1-tap booking & online schedule change requests.</p>
                      <span className="gate-btn-badge">RECOMMENDED &rarr;</span>
                    </button>

                    <button
                      type="button"
                      className="gate-option-card"
                      onClick={() => setAuthGateTab("login")}
                    >
                      <div className="gate-card-icon">
                        <Lock size={22} />
                      </div>
                      <b>SIGN IN</b>
                      <p>Already have an account? Load your file and saved details instantly.</p>
                      <span className="gate-btn-badge">SIGN IN &rarr;</span>
                    </button>

                    <button
                      type="button"
                      className="gate-option-card is-guest"
                      onClick={() => {
                        setGuestConfirmed(true);
                        setAuthGateOpen(false);
                      }}
                    >
                      <div className="gate-card-icon">
                        <UserCheck size={22} />
                      </div>
                      <b>BOOK AS GUEST</b>
                      <p>Proceed with one-time intake without saving a permanent login password.</p>
                      <span className="gate-btn-badge">CONTINUE AS GUEST &rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {(authGateTab === "login" || authGateTab === "register") && (
                <div className="gate-form-pane">
                  <button
                    type="button"
                    className="gate-back-btn"
                    onClick={() => setAuthGateTab("choose")}
                  >
                    <ArrowLeft size={13} />
                    <span>BACK TO OPTIONS</span>
                  </button>

                  <div className="gate-header">
                    <span className="gate-eyebrow">
                      {authGateTab === "login" ? "CLIENT SIGN IN" : "OPEN NEW CLIENT FILE"}
                    </span>
                    <h3>
                      {authGateTab === "login" ? "WELCOME BACK." : "SAVE YOUR DOSSIER."}
                    </h3>
                  </div>

                  <form onSubmit={handleGateAuth} className="gate-form">
                    {authGateTab === "register" && (
                      <>
                        <div className="gate-field">
                          <label htmlFor="gate-name">FULL NAME</label>
                          <input id="gate-name" name="name" type="text" required placeholder="Julian Sterling" />
                        </div>
                        <div className="gate-field">
                          <label htmlFor="gate-phone">PHONE NUMBER</label>
                          <input id="gate-phone" name="phone" type="tel" required placeholder="+44 7911 123456" />
                        </div>
                      </>
                    )}

                    <div className="gate-field">
                      <label htmlFor="gate-email">EMAIL ADDRESS</label>
                      <input id="gate-email" name="email" type="email" required placeholder="name@example.com" />
                    </div>

                    <div className="gate-field">
                      <label htmlFor="gate-password">PASSWORD</label>
                      <input
                        id="gate-password"
                        name="password"
                        type="password"
                        required
                        minLength={authGateTab === "register" ? 8 : 1}
                        placeholder={authGateTab === "register" ? "8+ characters" : "Enter password"}
                      />
                    </div>

                    <button type="submit" className="gate-submit-btn" disabled={authLoading}>
                      <span>{authLoading ? "AUTHENTICATING…" : authGateTab === "login" ? "SIGN IN & CONTINUE" : "CREATE FILE & CONTINUE"}</span>
                      <ArrowRight size={15} />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
