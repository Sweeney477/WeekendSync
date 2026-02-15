import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-2">
                {label && (
                    <label className="font-display text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>
                )}
                <textarea
                    className={cn(
                        "flex min-h-[80px] w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm text-black placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:bg-zinc-900 dark:text-white dark:focus-visible:ring-white",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
