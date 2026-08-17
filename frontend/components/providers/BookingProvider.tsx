"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Service, Barber } from "@/lib/types";

type State = {
  service: Service | null;
  addons: Service[];
  barber: Barber | null;
  date: string;
  time: string;
  notes: string;
};

type Ctx = State & {
  setService: (v: Service | null) => void;
  toggleAddon: (v: Service) => void;
  setBarber: (v: Barber | null) => void;
  setDate: (v: string) => void;
  setTime: (v: string) => void;
  setNotes: (v: string) => void;
  clear: () => void;
  totalPrice: number;
  totalDuration: number;
};

const Context = createContext<Ctx | null>(null);
const initial: State = {
  service: null,
  addons: [],
  barber: null,
  date: "",
  time: "",
  notes: ""
};

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    try {
      const v = localStorage.getItem("thechair_booking_v2");
      if (v) {
        const parsed = JSON.parse(v);
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("thechair_booking_v2", JSON.stringify(state));
    } catch {}
  }, [state]);

  const value = useMemo(() => {
    const basePrice = state.service?.price || 0;
    const addonsPrice = state.addons.reduce((acc, a) => acc + (a.price || 0), 0);
    const totalPrice = basePrice + addonsPrice;

    const baseDuration = state.service?.duration || 0;
    const addonsDuration = state.addons.reduce((acc, a) => acc + (a.duration || 0), 0);
    const totalDuration = baseDuration + addonsDuration;

    return {
      ...state,
      totalPrice,
      totalDuration,
      setService: (service: Service | null) =>
        setState((s) => ({ ...s, service, time: "" })),
      toggleAddon: (addon: Service) =>
        setState((s) => {
          const exists = s.addons.some((x) => x._id === addon._id);
          return {
            ...s,
            addons: exists
              ? s.addons.filter((x) => x._id !== addon._id)
              : [...s.addons, addon]
          };
        }),
      setBarber: (barber: Barber | null) =>
        setState((s) => ({ ...s, barber, time: "" })),
      setDate: (date: string) =>
        setState((s) => ({ ...s, date, time: "" })),
      setTime: (time: string) =>
        setState((s) => ({ ...s, time })),
      setNotes: (notes: string) =>
        setState((s) => ({ ...s, notes })),
      clear: () => {
        try {
          localStorage.removeItem("thechair_booking_v2");
        } catch {}
        setState(initial);
      }
    };
  }, [state]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useBooking() {
  const c = useContext(Context);
  if (!c) throw new Error("useBooking outside provider");
  return c;
}

