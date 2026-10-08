import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import GuideAssistant from "@/components/GuideAssistant";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Setu — AI-Verified Student Skills & Placement Portal",
  description:
    "Upload certificates, get an AI-verified profile, and connect with companies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <GuideAssistant />
      </body>
    </html>
  );
}
