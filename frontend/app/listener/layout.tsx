import type { Metadata } from "next";
import "./../globals.css";
import { ListenerSidebar } from "@/components/ListenerSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";

import { Toaster } from "react-hot-toast";

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
      <SidebarProvider>
        <ListenerSidebar />
        <SidebarInset className="bg-main-content-gradient bg-cover bg-center">
          <Header />
          <main>{children}</main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </div>
  );
}
