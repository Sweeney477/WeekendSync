"use client";

import clsx from "clsx";
import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg";
  isLoading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  children,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 border-2 px-6 py-3 font-display font-bold uppercase tracking-widest transition-all active:translate-y-0.5 disabled:opacity-50 disabled:active:translate-y-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:focus-visible:ring-ink-dark",
        size === "md" && "h-12 text-sm",
        size === "lg" && "h-14 text-base",
        variant === "primary" && "border-black bg-primary text-white hover:bg-black dark:border-ink-dark/40 dark:text-ink-dark dark:hover:bg-surface-dark-2",
        variant === "secondary" &&
        "border-black bg-white text-black hover:bg-poster-yellow dark:border-ink-dark/40 dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-poster-yellow dark:hover:text-black",
        variant === "ghost" && "border-transparent bg-transparent text-black hover:bg-poster-yellow/20 dark:text-ink-dark dark:hover:bg-ink-dark/10",
        variant === "danger" && "border-black bg-rose-600 text-white hover:bg-black dark:border-ink-dark/40",
        "disabled:cursor-not-allowed",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" /> : null}
      {children}
    </button>
  );
}

