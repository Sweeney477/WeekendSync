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
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        variant === "primary" && "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-300",
        variant === "secondary" &&
          "bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
        variant === "ghost" && "bg-transparent text-slate-900 hover:bg-slate-100 disabled:text-slate-400",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-slate-300",
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

