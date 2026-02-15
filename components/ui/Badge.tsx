import { cn } from "@/lib/utils";

interface BadgeProps {
    count?: number;
    label?: string;
    variant?: "default" | "outline" | "destructive";
    className?: string;
}

export function Badge({ count, label, variant = "default", className }: BadgeProps) {
    if (count === 0 && !label) return null;

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset",
                {
                    "bg-poster-yellow text-black ring-black": variant === "default",
                    "bg-white text-black ring-black": variant === "outline",
                    "bg-rose-500 text-white ring-rose-600": variant === "destructive",
                },
                className
            )}
        >
            {label || count}
        </span>
    );
}
