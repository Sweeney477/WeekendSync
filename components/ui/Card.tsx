import clsx from "clsx";
import * as React from "react";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000] dark:border-ink-dark/40 dark:bg-surface-dark dark:shadow-[8px_8px_0px_0px_rgba(232,228,223,0.15)]", className)} {...props} />;
}

