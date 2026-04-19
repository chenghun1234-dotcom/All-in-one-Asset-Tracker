import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MarketProvider } from "./MarketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Voyager | All-in-one Tracker",
  description: "Zero-cost real-time asset dashboard for stocks and crypto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MarketProvider>
          {children}
        </MarketProvider>
      </body>
    </html>
  );
}
