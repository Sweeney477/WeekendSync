import { cn } from "@/lib/utils";

interface HelpArticleProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    id?: string;
}

export function HelpArticle({ title, children, className, id }: HelpArticleProps) {
    return (
        <article id={id} className={cn("scroll-mt-24 rounded-none border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]", className)}>
            <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-black dark:text-white">
                {title}
            </h2>
            <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wider prose-p:font-sans prose-p:text-slate-600 dark:prose-p:text-slate-300">
                {children}
            </div>
        </article>
    );
}
