"use client";

/**
 * Simple skeleton placeholder. Uses animate-pulse; respects prefers-reduced-motion
 * via globals.css so motion is minimal when the user prefers reduced motion.
 */
export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-md bg-slate-200 dark:bg-surface-dark-2 animate-pulse ${className}`}
      {...props}
    />
  );
}
