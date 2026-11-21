"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, HealthResponse } from "./api-client";
import { MOCK_SITES } from "./mock-lunar-data";
import { rankSites } from "./scoring";
import type { RankedSite, SiteRecord } from "./types";

export type DataSource = "loading" | "api" | "mock";

/** Ensure every record from the API has the sub-objects scoring.ts requires. */
function sanitizeSiteRecord(s: SiteRecord): SiteRecord {
  return {
    ...s,
    uncertainty: s.uncertainty ?? 0.5,
    detection: s.detection ?? {
      probability: 0,
      opticalEvidence: 0,
      radarEvidence: 0,
      gravityEvidence: 0,
      estWidthM: null,
      estLengthKm: null,
    },
    roof: s.roof ?? {
      skylightDetected: false,
      skylightConfidence: 0,
      skylightDiameterM: null,
      skylightDepthM: null,
      roofThicknessM: null,
      stability: 0,
      crackDensity: "moderate" as const,
      riskFlags: ["Data unavailable — treat all estimates as unreliable"],
    },
  };
}

/**
 * Sites from the backend. If the API is unreachable we show the bundled demo data AND keep retrying
 * (4s -> 8s -> 15s) so starting the backend after the page is open connects without a manual refresh.
 * Ranking and scoring always run client-side so the weights stay visible and consistent.
 */
export function useSites(limit = 100) {
  const [sites, setSites] = useState<SiteRecord[]>(MOCK_SITES);
  const [source, setSource] = useState<DataSource>("loading");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ctrl = new AbortController();
    let delay = 4000;

    const attempt = async () => {
      try {
        const page = await api.sites({ limit }, ctrl.signal);
        if (cancelled) return;
        if (page.items.length > 0) {
          // Sanitise records: API may omit sub-objects if schema has evolved.
          const sanitised = page.items.map(sanitizeSiteRecord);
          setSites(sanitised);
          setSource("api");
          return;
        }
        setSource("mock");
      } catch {
        if (cancelled) return;
        setSource("mock");
      }
      timer = setTimeout(attempt, delay);
      delay = Math.min(delay * 2, 15000);
    };
    attempt();
    return () => {
      cancelled = true;
      ctrl.abort();
      if (timer) clearTimeout(timer);
    };
  }, [limit]);

  const ranked: RankedSite[] = useMemo(() => rankSites(sites), [sites]);
  return { sites, ranked, setSites, source };
}

export function useApiHealth(pollMs = 10000) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const alive = useRef(true);

  const check = useCallback(async () => {
    try {
      const h = await api.health();
      if (alive.current) {
        setHealth(h);
        setOnline(true);
      }
    } catch {
      if (alive.current) {
        setHealth(null);
        setOnline(false);
      }
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    check();
    const t = setInterval(check, pollMs);
    return () => {
      alive.current = false;
      clearInterval(t);
    };
  }, [check, pollMs]);

  return { health, online, recheck: check };
}
