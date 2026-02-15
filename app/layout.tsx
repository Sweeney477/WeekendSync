import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Outfit, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppFooterNavWrapper } from "@/components/AppFooterNavWrapper";
import { Toaster } from "@/components/ui/sonner";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });

export const metadata: Metadata = {
  title: "WeekendSync",
  description: "Plan a weekend meetup with your group—availability, votes, events, and an ICS export.",
  applicationName: "WeekendSync",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E11D48" },
    { media: "(prefers-color-scheme: dark)", color: "#1E1C1A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("ws_theme");var p=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var d=t==="dark"||(t!=="light"&&t!=="dark"&&t!=="system"?p:t==="system"?p:false);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${outfit.variable} ${workSans.variable} flex min-h-dvh flex-col bg-background-light bg-noise font-sans text-black antialiased transition-colors duration-300 dark:bg-background-dark dark:text-ink-dark`}>
        <div className="flex flex-1 flex-col">{children}</div>
        <AppFooterNavWrapper />
        <Toaster />
        <WelcomeModal />
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
