"use client";

import clsx from "clsx";
import Link from "next/link";
import * as React from "react";

type Action = {
    label: string;
    href?: string;
    onClick?: () => void;
};

type Props = {
    icon?: React.ReactNode;
    title: string;
    description: string;
    primaryAction?: Action;
    secondaryAction?: Action;
    className?: string;
};

export function EmptyState({
    icon,
    title,
    description,
    primaryAction,
    secondaryAction,
    className,
}: Props) {
    return (
        <div
            className={clsx(
                "flex flex-col items-center justify-center gap-6 border-4 border-black bg-white p-8 text-center dark:border-ink-dark/40 dark:bg-surface-dark",
                className
            )}
        >
            {icon && (
                <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-slate-100 text-slate-400 dark:border-ink-dark/40 dark:bg-surface-dark-2 dark:text-muted-dark">
                    {icon}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <h3 className="font-display text-xl font-bold uppercase tracking-wider text-black dark:text-ink-dark">
                    {title}
                </h3>
                <p className="max-w-md font-sans text-sm font-medium leading-relaxed text-slate-600 dark:text-muted-dark">
                    {description}
                </p>
            </div>

            {(primaryAction || secondaryAction) && (
                <div className="flex w-full max-w-sm flex-col gap-3">
                    {primaryAction && (
                        <ActionButton action={primaryAction} variant="primary" />
                    )}
                    {secondaryAction && (
                        <ActionButton action={secondaryAction} variant="secondary" />
                    )}
                </div>
            )}
        </div>
    );
}

function ActionButton({
    action,
    variant,
}: {
    action: Action;
    variant: "primary" | "secondary";
}) {
    const className = clsx(
        "flex h-12 w-full items-center justify-center gap-2 border-2 font-display text-sm font-bold uppercase tracking-widest transition-colors",
        variant === "primary" &&
        "border-black bg-primary text-white hover:bg-black dark:border-ink-dark/40 dark:hover:bg-surface-dark-2",
        variant === "secondary" &&
        "border-black bg-white text-black hover:bg-poster-yellow dark:border-ink-dark/40 dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-poster-yellow dark:hover:text-black"
    );

    if (action.href) {
        return (
            <Link href={action.href} className={className}>
                {action.label}
            </Link>
        );
    }

    return (
        <button onClick={action.onClick} className={className}>
            {action.label}
        </button>
    );
}
