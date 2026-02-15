"use client";

import clsx from "clsx";
import * as React from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "full";
    closeOnBackdropClick?: boolean;
    footer?: React.ReactNode;
};

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    closeOnBackdropClick = true,
    footer,
}: Props) {
    const modalRef = React.useRef<HTMLDivElement>(null);

    // Focus trap and escape key handling
    React.useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        // Focus first focusable element in modal
        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
        }

        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                ref={modalRef}
                className={clsx(
                    "flex max-h-[90vh] w-full flex-col border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000] dark:border-ink-dark/40 dark:bg-surface-dark dark:shadow-[8px_8px_0px_0px_rgba(232,228,223,0.15)]",
                    size === "sm" && "max-w-sm",
                    size === "md" && "max-w-md",
                    size === "lg" && "max-w-2xl",
                    size === "full" && "max-w-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-black bg-white p-4 dark:border-ink-dark/40 dark:bg-surface-dark">
                    {title && (
                        <h2
                            id="modal-title"
                            className="font-display text-xl font-bold uppercase tracking-wider text-black dark:text-ink-dark"
                        >
                            {title}
                        </h2>
                    )}
                    <button
                        onClick={onClose}
                        className="ml-auto flex h-8 w-8 items-center justify-center border-2 border-black bg-slate-100 transition-colors hover:bg-black hover:text-white dark:border-ink-dark/40 dark:bg-surface-dark-2 dark:hover:bg-ink-dark"
                        aria-label="Close modal"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="border-t-2 border-black bg-white p-4 dark:border-ink-dark/40 dark:bg-surface-dark">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
