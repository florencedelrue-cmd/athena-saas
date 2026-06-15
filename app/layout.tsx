import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ToastContainer } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gespreksfiche & Competentietracker - Athena Duaal Leren",
  description: "Athena TOCI 2.0 - Evaluatie aanloopfase duaal leren",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={`${inter.variable} font-sans flex flex-col min-h-screen text-slate-800 antialiased bg-athenaBg`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
