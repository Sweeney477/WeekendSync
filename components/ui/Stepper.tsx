import clsx from "clsx";

export type Step = {
  key: string;
  label: string;
  href?: string;
  description?: string;
  isComplete?: boolean;
  isClickable?: boolean;
};

export function Stepper({
  steps,
  activeKey,
}: {
  steps: Step[];
  activeKey: string;
}) {
  const activeIndex = steps.findIndex((s) => s.key === activeKey);

  return (
    <nav className="w-full" aria-label="Progress">
      <ol className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {steps.map((step, index) => {
          const isActive = step.key === activeKey;
          const isComplete = step.isComplete ?? index < activeIndex;
          const isPast = index < activeIndex;
          const isClickable = step.isClickable ?? (step.href && isPast);

          const content = (
            <div
              className={clsx(
                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-2 px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all",
                isActive &&
                "border-black bg-poster-yellow text-black dark:border-ink-dark/40 dark:text-black",
                isComplete &&
                !isActive &&
                "border-black bg-poster-green text-white dark:border-ink-dark/40",
                !isActive &&
                !isComplete &&
                "border-black/10 bg-white text-slate-400 dark:border-ink-dark/20 dark:bg-surface-dark dark:text-muted-dark",
                isClickable &&
                !isActive &&
                "hover:border-black hover:text-black dark:hover:border-ink-dark/40 dark:hover:text-ink-dark"
              )}
            >
              {/* Step number or checkmark */}
              <span
                className={clsx(
                  "flex h-5 w-5 items-center justify-center border border-current text-[10px]",
                  isComplete && "bg-current text-poster-green"
                )}
              >
                {isComplete ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>

              {/* Label */}
              <div className="flex flex-col items-start gap-0.5">
                <span>{step.label}</span>
                {step.description && (
                  <span className="text-[9px] font-medium normal-case tracking-normal opacity-70">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );

          return (
            <li key={step.key}>
              {isClickable && step.href ? (
                <a href={step.href}>{content}</a>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
