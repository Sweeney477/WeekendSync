"use client";

import clsx from "clsx";
import * as React from "react";

type Props = {
    content: string | React.ReactNode;
    children: React.ReactNode;
    position?: "top" | "right" | "bottom" | "left";
    trigger?: "hover" | "click";
};

export function Tooltip({
    content,
    children,
    position = "top",
    trigger = "hover",
}: Props) {
    const [isVisible, setIsVisible] = React.useState(false);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const tooltipId = React.useId();

    const show = () => setIsVisible(true);
    const hide = () => setIsVisible(false);
    const toggle = () => setIsVisible((prev) => !prev);

    // Close on Escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                hide();
            }
        };

        if (isVisible) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isVisible]);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                trigger === "click" &&
                tooltipRef.current &&
                !tooltipRef.current.contains(e.target as Node)
            ) {
                hide();
            }
        };

        if (isVisible) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isVisible, trigger]);

    const tooltipClasses = clsx(
        "absolute z-50 w-64 border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_#000] dark:border-ink-dark/40 dark:bg-surface-dark dark:shadow-[4px_4px_0px_0px_rgba(232,228,223,0.15)]",
        "font-sans text-xs leading-relaxed text-slate-700 dark:text-muted-dark",
        "transition-opacity duration-200",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
        position === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
        position === "bottom" && "left-1/2 top-full mt-2 -translate-x-1/2",
        position === "left" && "right-full top-1/2 mr-2 -translate-y-1/2",
        position === "right" && "left-full top-1/2 ml-2 -translate-y-1/2"
    );

    const triggerProps =
        trigger === "hover"
            ? {
                onMouseEnter: show,
                onMouseLeave: hide,
                onFocus: show,
                onBlur: hide,
            }
            : {
                onClick: toggle,
            };

    return (
        <div ref={tooltipRef} className="relative inline-block">
            <div
                {...triggerProps}
                className="inline-flex"
                aria-describedby={isVisible ? tooltipId : undefined}
            >
                {children}
            </div>
            <div
                id={tooltipId}
                className={tooltipClasses}
                role="tooltip"
                aria-hidden={!isVisible}
            >
                {content}
            </div>
        </div>
    );
}
