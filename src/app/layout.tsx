import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClinicalIQ — Clinical Intelligence Dashboard",
  description: "Fast, evidence-grounded clinical search interface for credentialed clinicians. Search any drug, disease, or ICD-10 code for structured, fully-sourced clinical intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased bg-white text-[#1C1C1E]`}>
        {children}
      </body>
    </html>
  );
}
