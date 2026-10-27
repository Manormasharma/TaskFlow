"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe, logout as logoutRequest } from "@/lib/auth";
import type { User } from "@/types";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: Status;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Runs once on load; any failure (401, network) means we have no session.
  useEffect(() => {
    getMe()
      .then((me) => {
        setUserState(me);
        setStatus("authenticated");
      })
      .catch(() => setStatus("unauthenticated"));
  }, []);

  const setUser = useCallback((me: User) => {
    setUserState(me);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Even if the request fails, clear local state so the UI signs out.
    }
    setUserState(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, setUser, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
