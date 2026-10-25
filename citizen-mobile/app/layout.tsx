import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Waypoint Secure | Citizen Safety App",
  description: "Two-Tap Life Protection & Dead-Man's Switch for South African Commuters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
