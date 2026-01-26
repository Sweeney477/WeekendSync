import clsx from "clsx";

export type Step = { key: string; label: string; href: string };

export function Stepper({ steps, activeKey }: { steps: Step[]; activeKey: string }) {
  return (
    <nav className="w-full">
      <ol className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {steps.map((s) => {
          const isActive = s.key === activeKey;
          return (
            <li key={s.key} className="shrink-0">
              <a
                href={s.href}
                className={clsx(
                  "inline-flex items-center whitespace-nowrap border-2 px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all",
                  isActive
                    ? "border-black bg-poster-yellow text-black dark:border-white dark:text-black"
                    : "border-black/10 bg-white text-slate-400 hover:border-black hover:text-black dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:border-white dark:hover:text-white",
                )}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

