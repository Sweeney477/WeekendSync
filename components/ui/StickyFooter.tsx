import clsx from "clsx";
import * as React from "react";

export function StickyFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "sticky bottom-0 left-0 right-0 -mx-4 mt-6 border-t border-slate-200 bg-white/80 px-4 py-3 backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

