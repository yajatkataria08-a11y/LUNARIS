import type { SiteRecord } from "./types";

/**
 * Where the backend lives.
 * In browser: same-origin (proxied by Next.js rewrites) or matched hostname on port 8000.
 */
export function apiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env && !env.includes("localhost") && !env.includes("127.0.0.1")) {
    return env.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    // Relative URL uses Next.js rewrites for zero-CORS same-origin reliability
    return "";
  }
  return env?.replace(/\/$/, "") || "http://127.0.0.1:8000";
}
const v1 = () => `${apiBase()}/api/v1`;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Bearer token is injected by the AuthProvider (kept out of this module's imports to avoid cycles).
let authToken: string | null = null;
export function setAuthToken(t: string | null) {
  authToken = t;
}

interface ReqOpts {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  retries?: number; // GET only
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request<T>(path: string, opts: ReqOpts = {}): Promise<T> {
  const { method = "GET", body, signal, timeoutMs = 8000 } = opts;
  const retries = method === "GET" ? opts.retries ?? 2 : 0; // never retry non-idempotent calls
  let lastErr: unknown;

  // Primary URL base (Next.js proxy) and fallback direct port 8000 on current hostname
  const candidateBases = [v1()];
  if (typeof window !== "undefined") {
    const directHost = `${window.location.protocol}//${window.location.hostname || "127.0.0.1"}:8000/api/v1`;
    if (!candidateBases.includes(directHost)) {
      candidateBases.push(directHost);
    }
  }

  for (const base of candidateBases) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const ctrl = new AbortController();
      const onAbort = () => ctrl.abort();
      signal?.addEventListener("abort", onAbort);
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const headers: Record<string, string> = {};
        if (body) headers["Content-Type"] = "application/json";
        if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
        const res = await fetch(`${base}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: ctrl.signal,
        });
        if (!res.ok) {
          let detail = res.statusText;
          try {
            const j = await res.json();
            if (typeof j.detail === "string") {
              detail = j.detail;
            } else if (Array.isArray(j.detail)) {
              detail = j.detail
                .map((d: { msg?: string; loc?: (string | number)[] }) => {
                  const field = d.loc && d.loc.length > 1 ? `${d.loc[d.loc.length - 1]}` : "";
                  return field ? `${field}: ${d.msg}` : d.msg || "Invalid input";
                })
                .join("; ");
            } else {
              detail = JSON.stringify(j.detail ?? j);
            }
          } catch {
            /* non-JSON error body */
          }
          throw new ApiError(res.status, detail);
        }
        return (await res.json()) as T;
      } catch (err) {
        lastErr = err;
        if (signal?.aborted) throw err; // caller cancelled: no retry
        if (err instanceof ApiError && err.status < 500) throw err; // 4xx will not improve
        if (attempt < retries) await sleep(300 * 2 ** attempt + Math.random() * 150); // backoff + jitter
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
      }
    }
  }
  if (lastErr instanceof ApiError) throw lastErr;
  throw new ApiError(0, `Cannot reach the backend. Please ensure the analysis backend is running (python run.py).`);
}

export interface SitesPage {
  items: SiteRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface SiteQuery {
  q?: string;
  terrain?: string;
  limit?: number;
  offset?: number;
}

export type OAuthProvider = "google" | "microsoft" | "github";

/** Full-page redirect target that starts the provider flow on the backend (secrets stay server-side). */
export function oauthStartUrl(p: OAuthProvider, next: string): string {
  const host = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname || "127.0.0.1"}:8000`
    : "http://127.0.0.1:8000";
  return `${host}/api/v1/auth/oauth/${p}/start?next=${encodeURIComponent(next)}`;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  catalog: { ready: boolean; counts: Record<string, number>; error?: string | null };
  model: { ready: boolean; metrics: Record<string, unknown> };
  store?: string;
}

export const api = {
  health: (signal?: AbortSignal) => request<HealthResponse>("/health", { signal, retries: 0, timeoutMs: 3000 }),
  sites: (query: SiteQuery = {}, signal?: AbortSignal) => {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => v !== undefined && v !== "" && p.set(k, String(v)));
    return request<SitesPage>(`/sites?${p.toString()}`, { signal });
  },
  site: (id: string, signal?: AbortSignal) => request<SiteRecord>(`/sites/${encodeURIComponent(id)}`, { signal }),
  postVerdict: (id: string, verdict: "PROMISING" | "REJECT" | "UNRESOLVED", notes: string, reviewer = "guest") =>
    request<{ id: number; createdAt: string }>(`/sites/${encodeURIComponent(id)}/verdict`, {
      method: "POST",
      body: { verdict, notes, reviewer },
    }),
  signup: (name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/signup", { method: "POST", body: { name, email, password } }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: { email, password } }),
  providers: (signal?: AbortSignal) =>
    request<{ providers: Record<OAuthProvider, boolean> }>("/auth/providers", { signal, retries: 1, timeoutMs: 3000 }),
  me: (signal?: AbortSignal) => request<{ user: AuthUser }>("/auth/me", { signal, retries: 0, timeoutMs: 4000 }),
  siteShap: (id: string, signal?: AbortSignal) => request<any>(`/ensemble/shap/${encodeURIComponent(id)}`, { signal }),
  globalImportance: (signal?: AbortSignal) => request<any>("/ensemble/global-importance", { signal }),
  predictEnsemble: (features: Record<string, number>, signal?: AbortSignal) =>
    request<any>("/ensemble/predict", { method: "POST", body: { features }, signal }),
  slmQuery: (query: string, signal?: AbortSignal) =>
    request<any>("/slm/query", { method: "POST", body: { query }, signal }),
  slmExplainSite: (id: string, signal?: AbortSignal) =>
    request<any>(`/slm/explain-site/${encodeURIComponent(id)}`, { method: "POST", signal }),
  ablation: (id: string, signal?: AbortSignal) =>
    request<any>(`/ranking/ablation/${encodeURIComponent(id)}`, { signal }),
  isroLhi: (id: string, signal?: AbortSignal) =>
    request<any>(`/ranking/isro-lhi/${encodeURIComponent(id)}`, { signal }),
  isroLhiAll: (signal?: AbortSignal) =>
    request<any>("/ranking/isro-lhi", { signal }),
  dossier: (id: string, signal?: AbortSignal) =>
    request<any>(`/candidates/${encodeURIComponent(id)}/dossier`, { signal }),
  transferStatus: (signal?: AbortSignal) => request<any>("/transfer/status", { signal }),
  transferAnalogs: (signal?: AbortSignal) => request<any>("/transfer/analogs", { signal }),
  transferEvaluate: (signal?: AbortSignal) => request<any>("/transfer/evaluate", { signal }),
};
