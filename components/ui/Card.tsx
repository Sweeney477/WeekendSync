import clsx from "clsx";
import * as React from "react";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[8px_8px_0px_0px_#fff]", className)} {...props} />;
}

