import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MelodiousProvider } from "@/context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Melodious Music Platform",
  description: "Revolutionizing music in the web3 industry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <MelodiousProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-[#210946] to-purple-950 min-h-screen`}
        >
          <main>{children}</main>
        </body>
      </MelodiousProvider>
    </html>
  );
}
