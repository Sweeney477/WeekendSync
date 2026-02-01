import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppFooterNavWrapper } from "@/components/AppFooterNavWrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "WeekendSync",
  description: "Plan a weekend meetup with your group—availability, votes, events, and an ICS export.",
  applicationName: "WeekendSync",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E52320" },
    { media: "(prefers-color-scheme: dark)", color: "#1E1C1A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("ws_theme");var d=t==="dark";var l=t==="light";var p=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var s=l?false:(d?true:p);document.documentElement.classList.toggle("dark",s);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} flex min-h-dvh flex-col bg-background-light bg-noise font-sans text-black antialiased transition-colors duration-300 dark:bg-background-dark dark:text-ink-dark`}>
        <div className="flex flex-1 flex-col">{children}</div>
        <AppFooterNavWrapper />
        <Analytics />
      </body>
    </html>
  );
}
