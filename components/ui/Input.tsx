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
    <div className={clsx("flex w-full flex-col gap-2", className)}>
      {label ? (
        <label htmlFor={inputId} className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={clsx(
          "h-12 w-full border-2 border-black bg-white px-4 font-sans text-sm font-bold text-black",
          "placeholder:text-slate-400 dark:border-white dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500",
          "focus:border-primary focus:outline-none focus:ring-0 dark:focus:border-poster-yellow",
          error ? "border-rose-500 dark:border-rose-400" : "",
        )}
        {...props}
      />
      {error ? (
        <p className="border-2 border-black bg-rose-50 p-2 text-xs font-bold text-rose-600 dark:border-white dark:bg-rose-900/20 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

