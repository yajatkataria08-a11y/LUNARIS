"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "jungo" | "urja";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  clickRings: boolean;
  setClickRings: (enabled: boolean) => void;
  toggleClickRings: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "jungo",
  toggleTheme: () => {},
  setTheme: () => {},
  clickRings: true,
  setClickRings: () => {},
  toggleClickRings: () => {},
});

function applyThemeClasses(t: Theme) {
  const root = document.documentElement;
  const body = document.body;
  root.classList.remove("dark", "light", "jungo", "urja");
  body.classList.remove("dark", "light", "jungo", "urja");

  if (t === "jungo") {
    root.classList.add("dark", "jungo");
    body.classList.add("dark", "jungo");
  } else if (t === "urja") {
    root.classList.add("light", "urja");
    body.classList.add("light", "urja");
  } else if (t === "dark") {
    root.classList.add("dark");
    body.classList.add("dark");
  } else {
    root.classList.add("light");
    body.classList.add("light");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("jungo");
  const [clickRings, setClickRingsState] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("exo-theme") as Theme | null;
    const valid: Theme[] = ["light", "dark", "jungo", "urja"];
    const initialTheme: Theme =
      saved && valid.includes(saved)
        ? saved
        : window.matchMedia("(prefers-color-scheme: light)").matches
        ? "urja"
        : "jungo";

    setThemeState(initialTheme);
    applyThemeClasses(initialTheme);

    try {
      const savedRings = localStorage.getItem("exo-click-rings");
      if (savedRings !== null) {
        setClickRingsState(savedRings === "true");
      }
    } catch {
      // storage unavailable
    }

    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("exo-theme", newTheme);
    } catch {
      // storage unavailable
    }
    applyThemeClasses(newTheme);
  };

  const setClickRings = (enabled: boolean) => {
    setClickRingsState(enabled);
    try {
      localStorage.setItem("exo-click-rings", String(enabled));
    } catch {
      // storage unavailable
    }
  };

  const toggleClickRings = () => {
    setClickRings(!clickRings);
  };

  // Cycle: jungo → urja → dark → light → jungo
  const toggleTheme = () => {
    const cycle: Theme[] = ["jungo", "urja", "dark", "light"];
    const next = cycle[(cycle.indexOf(theme) + 1) % cycle.length];
    setTheme(next);
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        clickRings,
        setClickRings,
        toggleClickRings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
