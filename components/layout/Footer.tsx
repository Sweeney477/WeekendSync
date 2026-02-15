import Link from "next/link";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export function Footer() {
    return (
        <footer className="w-full border-t-2 border-black bg-white px-6 py-12 dark:border-ink-dark/40 dark:bg-zinc-950">
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
                <div className="flex flex-col gap-2">
                    <Link href="/" className="font-display text-xl font-bold uppercase tracking-tighter">
                        Weekend<span className="text-poster-blue">Sync</span>
                    </Link>
                    <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
                        Plan better together.
                    </p>
                </div>

                <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    <Link href="/help" className="font-display text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white">
                        Help & FAQ
                    </Link>
                    <Link href="#" className="font-display text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-black dark:text-zinc-500 dark:hover:text-white">
                        Privacy
                    </Link>
                    <Link href="#" className="font-display text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-black dark:text-zinc-500 dark:hover:text-white">
                        Terms
                    </Link>
                    <FeedbackForm triggerStyles="font-display text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white" />
                </nav>

                <p className="font-mono text-[10px] text-slate-600 dark:text-zinc-500">
                    © {new Date().getFullYear()} WeekendSync
                </p>
            </div>
        </footer>
    );
}
