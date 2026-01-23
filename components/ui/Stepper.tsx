import clsx from "clsx";

export type Step = { key: string; label: string; href: string };

export function Stepper({ steps, activeKey }: { steps: Step[]; activeKey: string }) {
  return (
    <nav className="w-full">
      <ol className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((s) => {
          const isActive = s.key === activeKey;
          return (
            <li key={s.key}>
              <a
                href={s.href}
                className={clsx(
                  "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium",
                  isActive ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600",
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

