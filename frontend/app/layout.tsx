import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MelodiousProvider } from "@/contexts/melodious";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/toaster";
import LayoutWrapper from "@/components/LayoutWrapper/LayoutWrapper";
import { PlayerProvider } from "@/contexts/melodious/PlayerContext";
import MyPlayer from "@/components/MusicPlayer/MyPlayer";

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
        {/* <AuthProvider> */}
        {/* <RedirectAfterLogin /> */}
        <LayoutWrapper>
          <MelodiousProvider>
            {/* <MusicPlayerProvider> */}
            <PlayerProvider>
              <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-[#210946] to-purple-950 min-h-screen`}
              >
                <main>{children}</main>
                <Toaster />
              </body>
              <MyPlayer />
            </PlayerProvider>
          </MelodiousProvider>
        </LayoutWrapper>
        {/* </AuthProvider> */}
      </ThirdwebProvider>
    </html>
  );
}
