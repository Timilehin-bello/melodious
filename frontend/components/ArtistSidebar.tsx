"use client";
import {
  ChartNoAxesColumn,
  Home,
  LayoutGrid,
  ListCheck,
  LogOut,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useMusic } from "@/contexts/melodious/MusicPlayerContext";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/artist/dashboard",
    icon: Home,
  },
  // {
  //   title: "Song Analytics",
  //   url: "/artist/song-analytics",
  //   icon: ChartNoAxesColumn,
  // },
  // {
  //   title: "My Music",
  //   url: "/artist/my-music",
  //   icon: LayoutGrid,
  // },
  {
    title: "Release",
    url: "/artist/release",
    icon: ListCheck,
  },
  {
    title: "Wallet",
    url: "/artist/wallet",
    icon: Wallet,
  },
];

export function ArtistSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const router = useRouter();
  const { currentTrack } = useMusic();

  // Add this function to determine if a menu item is active
  const isActiveRoute = (itemUrl: string) => {
    return pathname === itemUrl;
  };

  return (
    <Sidebar
      collapsible="icon"
      className={twMerge(`sidebar`, currentTrack && "h-[calc(100%-90px)]")}
    >
      <SidebarContent className="bg-sidebar-gradient text-white bg-cover bg-center border-0">
        <SidebarGroup>
          <SidebarHeader>
            <SidebarGroupLabel className="m-0 p-0">
              <Image
                src="/images/melodious_logo.svg"
                height={64}
                width={64}
                alt="Melodious Logo"
                className="ml-[-20px] mt-4"
              />
              <Image
                src="/images/melodious_text.svg"
                height={64}
                width={104}
                alt="Melodious Logo text"
                className="mt-4"
              />
            </SidebarGroupLabel>
          </SidebarHeader>
          <Image
            src="/images/melodious_logo.svg"
            height={150}
            width={150}
            alt="Melodious Logo"
            className={
              state !== "collapsed" ? "hidden" : "text-xl ml-[-5px] mt-[-10px]"
            }
          />

          <SidebarGroupContent className="mt-12">
            <h2 className="mb-8 text-xl">Menu</h2>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={
                      isActiveRoute(item.url)
                        ? "hover:bg-[#950944] bg-[#950944] text-white py-6"
                        : "hover:bg-[#950944] hover:text-white py-6 text-white"
                    }
                  >
                    <Link
                      href={item.url}
                      prefetch={true}
                      className="hover:text-white"
                    >
                      <item.icon className="w-8 h-8 " />
                      <span className=" ">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
