"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-black group-[.toaster]:border-2 group-[.toaster]:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:group-[.toaster]:bg-zinc-900 dark:group-[.toaster]:text-white dark:group-[.toaster]:border-white dark:group-[.toaster]:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] font-sans font-bold",
                    description: "group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400 font-medium",
                    actionButton:
                        "group-[.toast]:bg-black group-[.toast]:text-white dark:group-[.toast]:bg-white dark:group-[.toast]:text-black font-display font-bold uppercase tracking-wider",
                    cancelButton:
                        "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 dark:group-[.toast]:bg-zinc-800 dark:group-[.toast]:text-slate-400 font-display font-bold uppercase tracking-wider",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
