import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav className={cn("flex items-center text-sm", className)} aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && (
                            <svg
                                className="mx-2 h-4 w-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="font-medium text-slate-500 hover:text-black hover:underline dark:text-slate-400 dark:hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-bold text-black dark:text-white" aria-current="page">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
