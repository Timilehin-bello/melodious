import type { Metadata } from "next";
import "./../globals.css";

import { ListenerSidebar } from "@/components/ListenerSidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { ThirdwebProvider } from "thirdweb/react";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
// import Player from "@/components/MusicPlayer/Player";
import MusicPlayer from "@/components/MusicPlayer";

export const metadata: Metadata = {
  title: "Listener",
  description: "Melodious Listeners",
};

export default function ListenerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ThirdwebProvider>
        <MusicPlayerProvider>
          <SidebarProvider>
            <ListenerSidebar />
            <SidebarInset className="bg-main-content-gradient bg-cover bg-center">
              <Header />
              <main>{children}</main>
            </SidebarInset>
          </SidebarProvider>
          {/* <Player /> */}
          <MusicPlayer />
        </MusicPlayerProvider>
      </ThirdwebProvider>
    </div>
  );
}
