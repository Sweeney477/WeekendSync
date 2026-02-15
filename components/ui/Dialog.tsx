"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

interface DialogContextProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextProps | undefined>(undefined);

export function Dialog({
    children,
    open,
    onOpenChange,
}: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
}

export function DialogTrigger({
    children,
    asChild,
}: {
    children: React.ReactNode;
    asChild?: boolean;
}) {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error("DialogTrigger must be used within a Dialog");

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
            onClick: (e: React.MouseEvent) => {
                const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler }>;
                child.props.onClick?.(e);
                context.onOpenChange(true);
            },
        });
    }

    return <button onClick={() => context.onOpenChange(true)}>{children}</button>;
}

export function DialogContent({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error("DialogContent must be used within a Dialog");

    if (!context.open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div
                className={cn(
                    "relative w-full max-w-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]",
                    className
                )}
            >
                <button
                    onClick={() => context.onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <XIcon className="h-4 w-4 text-black dark:text-white" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    );
}

export function DialogHeader({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
            {children}
        </div>
    );
}

export function DialogFooter({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
            {children}
        </div>
    );
}

export function DialogTitle({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <h2
            className={cn(
                "text-lg font-semibold leading-none tracking-tight text-black dark:text-white",
                className
            )}
        >
            {children}
        </h2>
    );
}

export function DialogDescription({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <p className={cn("text-sm text-slate-500 dark:text-slate-400", className)}>
            {children}
        </p>
    );
}
