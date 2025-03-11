import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MelodiousProvider } from "@/contexts/melodious";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/toaster";
import LayoutWrapper from "@/components/LayoutWrapper/LayoutWrapper";
import WalletConnectionHandler from "@/components/WalletConnectionHandler";
import { MusicPlayerProvider } from "@/contexts/melodious/MusicProvider";
import { MelodiousMusicPlayer } from "@/components/Player/MelodiousPlayer";
import { Toaster as Toast } from "react-hot-toast";

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
      <ThirdwebProvider>
        <WalletConnectionHandler />
        <LayoutWrapper>
          <MelodiousProvider>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-[#210946] to-purple-950 min-h-screen`}
            >
              <MusicPlayerProvider>
                <main>{children}</main>
                {/* <Toaster /> */}
                <Toast
                  toastOptions={{
                    style: {
                      textWrap: "wrap",
                    },
                  }}
                />

                <MelodiousMusicPlayer />
              </MusicPlayerProvider>
            </body>
          </MelodiousProvider>
        </LayoutWrapper>
      </ThirdwebProvider>
    </html>
  );
}
