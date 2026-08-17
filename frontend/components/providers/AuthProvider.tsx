"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ClientProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  preferredBarber?: any;
  preferences?: string[];
  notes?: string;
}

interface AuthContextType {
  user: UserSession | null;
  client: ClientProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<any>;
  logout: () => void;
  refresh: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: "login" | "register";
  setAuthModalMode: (mode: "login" | "register") => void;
  openAuthModal: (mode?: "login" | "register") => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "thechair_client_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const refresh = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setUser(null);
      setClient(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api<{ user: UserSession; client: ClientProfile }>("/auth/me");
      if (data.user && data.user.role === "client") {
        setUser(data.user);
        setClient(data.client || null);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setClient(null);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await api<{ token: string; user: UserSession; client: ClientProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (res.user.role !== "client") {
      throw new Error("Staff & Barbers are managed from the Admin Room");
    }

    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    setClient(res.client || null);
    setAuthModalOpen(false);
    toast.success(`Welcome back, ${res.user.name.split(" ")[0]}`);
    return res;
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api<{ token: string; user: UserSession; client: ClientProfile }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone })
    });

    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    setClient(res.client || null);
    setAuthModalOpen(false);
    toast.success(`Client profile created for ${name.split(" ")[0]}`);
    return res;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setClient(null);
    toast.success("Signed out of your client file");
  };

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        client,
        loading,
        login,
        register,
        logout,
        refresh,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
