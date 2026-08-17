"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, RefreshCw, Trash2, X, Check, AlertTriangle, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Barber, Service } from "@/lib/types";

export function AppointmentManager() {
  const [items, setItems] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState("");
  const [barber, setBarber] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [slotLoading, setSlotLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        api<any>("/admin/appointments"),
        api<any>("/public/bootstrap")
      ]);
      setItems(a.items || []);
      setServices(b.services || []);
      setBarbers(b.barbers || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!service || !barber || !date) {
      setSlots([]);
      return;
    }
    setSlotLoading(true);
    setSlot("");
    api<any>(`/availability?barberId=${barber}&serviceId=${service}&date=${date}`)
      .then((d) => setSlots(d.slots || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setSlotLoading(false));
  }, [service, barber, date]);

  const pendingChanges = useMemo(() => {
    return items.filter(
      (x) => x.status === "change_requested" || x.changeRequest?.status === "pending"
    );
  }, [items]);

  const grouped = useMemo(() => {
    const out: Record<string, any[]> = {};
    items.forEach((x) => {
      const k = new Date(x.startAt).toISOString().slice(0, 10);
      (out[k] ??= []).push(x);
    });
    return out;
  }, [items]);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!slot) return toast.error("Choose an available time");
    try {
      await api("/admin/appointments", {
        method: "POST",
        body: JSON.stringify({
          serviceId: service,
          barberId: barber,
          date,
          time: slot,
          clientName: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          notes: fd.get("notes")
        })
      });
      toast.success("Chair locked without overlap");
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this appointment and release its locked slots?")) return;
    try {
      await api(`/admin/appointments/${id}`, { method: "DELETE" });
      toast.success("Appointment cancelled; slots released");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function approveChange(id: string) {
    try {
      await api(`/admin/appointments/${id}/approve-change`, { method: "POST" });
      toast.success("Change request approved and appointment rescheduled!");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve change");
    }
  }

  async function rejectChange(id: string) {
    if (!confirm("Decline this change request and keep original appointment time?")) return;
    try {
      await api(`/admin/appointments/${id}/reject-change`, { method: "POST" });
      toast.success("Change request declined. Original slot retained.");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to decline change");
    }
  }

  return (
    <div className="resource appointment-control">
      <header>
        <div>
          <span>CONTROL ROOM / CONFLICT-SAFE LEDGER</span>
          <h1>Appointments</h1>
          <p>
            Customer appointments, incoming change requests, and manual slot reservations.
          </p>
        </div>
        <div>
          <button onClick={load} aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="admin-primary" onClick={() => setOpen(true)}>
            <Plus size={16} />NEW CHAIR
          </button>
        </div>
      </header>

      {/* PENDING CLIENT CHANGE REQUESTS ALERT */}
      {pendingChanges.length > 0 && (
        <div className="pending-changes-alert-box">
          <div className="alert-head">
            <AlertTriangle size={18} />
            <b>{pendingChanges.length} CLIENT SCHEDULE CHANGE REQUEST{pendingChanges.length === 1 ? "" : "S"} PENDING</b>
          </div>
          <div className="pending-changes-list">
            {pendingChanges.map((x) => (
              <div key={x._id} className="pending-change-row">
                <div className="change-client-info">
                  <strong>{x.client?.name || "CLIENT"}</strong>
                  <small>{x.client?.phone || x.client?.email}</small>
                  <span>{x.service?.name} with {x.barber?.name}</span>
                </div>
                <div className="change-comparison">
                  <div className="current-slot">
                    <small>CURRENT:</small>
                    <b>{new Date(x.startAt).toLocaleDateString("en-GB")} at {new Date(x.startAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</b>
                  </div>
                  <div className="arrow-sep">&rarr;</div>
                  <div className="requested-slot">
                    <small>REQUESTED NEW SLOT:</small>
                    <b>{x.changeRequest?.newDate} at {x.changeRequest?.newTime}</b>
                  </div>
                </div>
                {x.changeRequest?.notes && (
                  <div className="change-reason">
                    <small>CLIENT NOTE: &ldquo;{x.changeRequest.notes}&rdquo;</small>
                  </div>
                )}
                <div className="change-actions">
                  <button
                    type="button"
                    className="approve-btn"
                    onClick={() => approveChange(x._id)}
                  >
                    <Check size={14} /> APPROVE CHANGE
                  </button>
                  <button
                    type="button"
                    className="decline-btn"
                    onClick={() => rejectChange(x._id)}
                  >
                    <X size={14} /> DECLINE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-skeleton">
          <i /><i /><i /><i />
        </div>
      ) : (
        <div className="appointment-days">
          {Object.entries(grouped).length ? (
            Object.entries(grouped as Record<string, any[]>).map(([day, rows]) => (
              <section key={day}>
                <div className="day-label">
                  <CalendarDays size={15} />
                  <b>
                    {new Date(day + "T12:00:00")
                      .toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long"
                      })
                      .toUpperCase()}
                  </b>
                  <span>{rows.length} CHAIRS</span>
                </div>
                {rows.map((x) => (
                  <article key={x._id} className={x.status === "change_requested" ? "has-change-req" : ""}>
                    <strong>
                      {new Date(x.startAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </strong>
                    <div>
                      <b>{x.client?.name || "CLIENT"}</b>
                      <small>{x.client?.phone || x.client?.email}</small>
                    </div>
                    <div>
                      <b>{x.service?.name}</b>
                      <small>{x.service?.duration} MIN / £{x.total}</small>
                    </div>
                    <div>
                      <b>{x.barber?.name}</b>
                      <small>CHAIR {x.barber?.chairNumber}</small>
                    </div>
                    <em className={`status-${x.status}`}>
                      {x.status === "change_requested" ? "CHANGE REQUESTED" : x.status}
                    </em>
                    <button onClick={() => cancel(x._id)} title="Cancel appointment">
                      <Trash2 size={15} />
                    </button>
                  </article>
                ))}
              </section>
            ))
          ) : (
            <div className="admin-empty">NO APPOINTMENTS YET.</div>
          )}
        </div>
      )}

      {open && (
        <div className="admin-modal appointment-modal">
          <form onSubmit={create}>
            <div className="modal-head">
              <div>
                <span>NEW APPOINTMENT</span>
                <h2>LOCK A CHAIR</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <label>
              CLIENT NAME
              <input name="name" required />
            </label>
            <label>
              CLIENT PHONE
              <input name="phone" required />
            </label>
            <label>
              CLIENT EMAIL
              <input name="email" type="email" required />
            </label>
            <label>
              SERVICE
              <select value={service} onChange={(e) => setService(e.target.value)} required>
                <option value="">CHOOSE SERVICE</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} / {s.duration} MIN / £{s.price}
                  </option>
                ))}
              </select>
            </label>
            <label>
              BARBER
              <select value={barber} onChange={(e) => setBarber(e.target.value)} required>
                <option value="">CHOOSE BARBER</option>
                {barbers.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} / CHAIR {b.chairNumber}
                  </option>
                ))}
              </select>
            </label>
            <label>
              DATE
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <div className="admin-slot-picker">
              <span>AVAILABLE TIMES</span>
              {slotLoading ? (
                <p>CHECKING LOCKS…</p>
              ) : slots.length ? (
                <div>
                  {slots.map((t) => (
                    <button
                      type="button"
                      className={slot === t ? "active" : ""}
                      onClick={() => setSlot(t)}
                      key={t}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : (
                <p>CHOOSE SERVICE, BARBER + DATE.</p>
              )}
            </div>
            <label>
              INTERNAL NOTE
              <textarea name="notes" />
            </label>
            <button className="admin-primary" type="submit" disabled={!slot}>
              LOCK APPOINTMENT /
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
