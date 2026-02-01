"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "ws_theme"; // "light" | "dark" | "system"

type Theme = "light" | "dark" | "system";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore (private mode / disabled storage)
  }
  return "system";
}

function getEffectiveIsDark(theme: Theme): boolean {
  if (typeof window === "undefined") return false;
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return theme === "dark";
}

function applyTheme(theme: Theme) {
  const isDark = getEffectiveIsDark(theme);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);

    // Listen for system theme changes when in system mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function cycleTheme() {
    const nextTheme: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // ignore (private mode / disabled storage)
    }
  }

  const getThemeLabel = () => {
    if (theme === "system") {
      const isDark = getEffectiveIsDark("system");
      return `System (${isDark ? "Dark" : "Light"})`;
    }
    return theme === "dark" ? "Dark" : "Light";
  };

  return (
    <div className="flex items-center justify-between gap-4 border-2 border-black bg-slate-50 p-3 dark:border-ink-dark/40 dark:bg-surface-dark-2">
      <div className="flex flex-col gap-1">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-muted-dark">
          Theme
        </p>
        <p className="font-sans text-sm font-medium text-black dark:text-ink-dark">
          {getThemeLabel()}
        </p>
      </div>
      <Button variant="secondary" size="md" type="button" onClick={cycleTheme}>
        Change
      </Button>
    </div>
  );
}

