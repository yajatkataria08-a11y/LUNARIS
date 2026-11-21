"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError, AuthUser, setAuthToken } from "./api-client";

interface Stored {
  token: string | null;
  user: AuthUser | null;
  guest: boolean;
}

interface AuthCtx {
  user: AuthUser | null;
  guest: boolean;
  ready: boolean; // finished reading storage / validating the token
  isAllowed: boolean; // signed in OR guest
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  completeOAuth: (token: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
}

const KEY = "astraea-auth";
const Ctx = createContext<AuthCtx | null>(null);

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { token: p.token ?? null, user: p.user ?? null, guest: !!p.guest };
    }
  } catch {
    /* storage blocked or corrupt: behave as signed out */
  }
  return { token: null, user: null, guest: false };
}

function write(s: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>({ token: null, user: null, guest: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = read();
    setAuthToken(s.token);
    setState(s);
    setReady(true);
    // Validate a stored token in the background; drop it only if the server says it is invalid/expired.
    if (s.token) {
      api
        .me()
        .then((r) => {
          const next = { token: s.token, user: r.user, guest: false };
          setState(next);
          write(next);
        })
        .catch((e) => {
          if (e instanceof ApiError && e.status === 401) {
            setAuthToken(null);
            const next = { token: null, user: null, guest: false };
            setState(next);
            write(next);
          } // network error: keep the session, the backend may just be starting
        });
    }
  }, []);

  const commit = useCallback((s: Stored) => {
    setAuthToken(s.token);
    setState(s);
    write(s);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.login(email, password);
    commit({ token: r.token, user: r.user, guest: false });
  }, [commit]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const r = await api.signup(name, email, password);
    commit({ token: r.token, user: r.user, guest: false });
  }, [commit]);

  // Called by /login/callback with the token the backend issued after a successful provider sign-in.
  const completeOAuth = useCallback(async (token: string) => {
    setAuthToken(token);
    try {
      const r = await api.me();
      commit({ token, user: r.user, guest: false });
    } catch (e) {
      setAuthToken(null);
      throw e;
    }
  }, [commit]);

  const continueAsGuest = useCallback(() => commit({ token: null, user: null, guest: true }), [commit]);
  const logout = useCallback(() => commit({ token: null, user: null, guest: false }), [commit]);

  const value = useMemo<AuthCtx>(
    () => ({ user: state.user, guest: state.guest, ready, isAllowed: !!state.user || state.guest, login, signup, completeOAuth, continueAsGuest, logout }),
    [state, ready, login, signup, completeOAuth, continueAsGuest, logout]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside <AuthProvider>");
  return c;
}
