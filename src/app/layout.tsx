import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nebula | Cardano Token Distribution Explorer",
  description: "Explore token distribution on Cardano as a 3D galaxy. Visualize whale clusters, stake key aggregation, and holder analytics.",
  keywords: ["Cardano", "Token Explorer", "Blockchain", "3D Visualization", "Crypto Analytics"],
  openGraph: {
    title: "Nebula | Cardano Token Distribution Explorer",
    description: "Explore token distribution on Cardano as a 3D galaxy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
