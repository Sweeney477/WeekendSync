"use client";

import clsx from "clsx";
import * as React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ className, label, hint, error, id, ...props }: Props) {
  const autoId = React.useId();
  const inputId = id ?? autoId;

  return (
    <div className={clsx("flex w-full flex-col gap-1", className)}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-900">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={clsx(
          "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm",
          "placeholder:text-slate-400",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          error ? "border-rose-300" : "border-slate-200",
        )}
        {...props}
      />
      {error ? <p className="text-xs text-rose-700">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

