"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "ws_theme"; // "light" | "dark"

function getEffectiveIsDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(getEffectiveIsDark());
  }, []);

  function toggle() {
    const nextIsDark = !getEffectiveIsDark();
    document.documentElement.classList.toggle("dark", nextIsDark);
    try {
      localStorage.setItem(STORAGE_KEY, nextIsDark ? "dark" : "light");
    } catch {
      // ignore (private mode / disabled storage)
    }
    setIsDark(nextIsDark);
  }

  return (
    <div className="flex items-center justify-between gap-4 border-2 border-black bg-slate-50 p-3 dark:border-ink-dark/40 dark:bg-surface-dark-2">
      <div className="flex flex-col gap-1">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-muted-dark">
          Theme
        </p>
        <p className="font-sans text-sm font-medium text-black dark:text-ink-dark">
          {isDark ? "Dark" : "Light"}
        </p>
      </div>
      <Button variant="secondary" size="md" type="button" onClick={toggle}>
        Toggle
      </Button>
    </div>
  );
}

