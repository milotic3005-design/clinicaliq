import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
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
      <body className={`${inter.variable} font-sans antialiased bg-white text-[#181d26]`}>
        {children}
      </body>
    </html>
  );
}
