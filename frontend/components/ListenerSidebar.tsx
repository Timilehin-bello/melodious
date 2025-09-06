"use client";
import {
  Calendar,
  Home,
  Inbox,
  LogOut,
  Search,
  Settings,
  CreditCard,
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
import { useRouter } from "next/navigation";
// import usePlayer from "@/hooks/usePlayer";
import { twMerge } from "tailwind-merge";
// import { usePlayer } from "@/contexts/melodious/PlayerContext";
import { useMusic } from "@/contexts/melodious/MusicPlayerContext";
import { title } from "process";
import { SidebarAd } from "@/components/ads";
// Menu items.
const items = [
  {
    title: "Home",
    url: "/listener/dashboard",
    icon: Home,
  },
  {
    title: "Wallet",
    url: "/listener/wallet",
    icon: Wallet,
  },
  {
    title: "Subscription",
    url: "/listener/subscription",
    icon: CreditCard,
  },

  // {
  //   title: "Playlist",
  //   url: "/listener/playlist",
  //   icon: Inbox,
  // },
  // {
  //   title: "Explore",
  //   url: "/listener/explore",
  //   icon: Search,
  // },
  // {
  //   title: "Liked Songs",
  //   url: "/listener/liked-songs",
  //   icon: Calendar,
  // },
  // {
  //   title: "Settings",
  //   url: "/listener/settings",
  //   icon: Settings,
  // },
];

export function ListenerSidebar() {
  const [activeMenu, setActiveMenu] = useState("Home");
  const { state } = useSidebar();
  const { currentTrack } = useMusic();

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
                      activeMenu === item.title
                        ? "hover:bg-[#950944] bg-[#950944] text-white py-6"
                        : "hover:bg-[#950944] hover:text-white py-6 text-white"
                    }
                    onClick={() => setActiveMenu(item.title)}
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
      <SidebarFooter className="text-white p-2">
        <SidebarAd className="w-full" />
      </SidebarFooter>
    </Sidebar>
  );
}
