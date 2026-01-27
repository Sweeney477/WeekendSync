import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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
  themeColor: "#E52320", // Primary red
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} min-h-dvh bg-background-light bg-noise font-sans text-black antialiased transition-colors duration-300 dark:bg-background-dark dark:text-white`}>
        {children}
      </body>
    </html>
  );
}

