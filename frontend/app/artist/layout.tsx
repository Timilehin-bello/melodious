import type { Metadata } from "next";
import { ArtistSidebar } from "@/components/ArtistSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import "./../globals.css";
import SearchInput from "@/components/SearchInput";
import { Input } from "@/components/ui/input";
import { Bell, ChevronDown, Search } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function ArtistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SidebarProvider>
        <ArtistSidebar />
        <SidebarInset className="bg-main-content-gradient bg-cover bg-center">
          <header className="sticky top-0 z-10 bg-[#2A174A] flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 drop-shadow-lg">
            <div className="flex justify-between items-center gap-2 px-4 w-full">
              <div className="w-2/3 flex  items-center">
                <SidebarTrigger className="-ml-1 text-white" />
                <div className="relative">
                  <Input
                    type="text"
                    className="pl-10 pr-4 py-2 border-[#D1E1E11C] rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-[#323D4E] text-gray-200 w-full h-[35px] sm:w-[300px] md:w-[350px] lg:w-[426px] xl:w-[400px] 2xl:w-[400px]"
                    placeholder="Search..."
                  />
                  <div className="absolute inset-y-0 left-0 bottom-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 w-1/3">
                <Bell size={24} fill="blue" className="text-white" />
                <div className="flex items-center gap-2 text-white">
                  <Image
                    src="/images/UK_Flag.png"
                    width={45}
                    height={27}
                    alt="country flag"
                  />
                  <p>English</p>
                  <ChevronDown size={16} className="text-white" />
                </div>

                <div className="flex items-center gap-2">
                  <Image
                    src="/images/artist_avatar.png"
                    width={50}
                    height={54}
                    alt="country flag"
                    className="rounded-full p-1 border-1 border-gray-400"
                  />

                  <div className="flex flex-col items-center text-xs text-white mr-2">
                    <p className="mb-1">Money Ray</p>
                    <p>Admin</p>
                  </div>
                  <ChevronDown size={16} className="text-white" />
                </div>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}