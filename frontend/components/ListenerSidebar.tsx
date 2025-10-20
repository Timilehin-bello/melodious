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
  Users,
  ShoppingCart,
  Coins,
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
import { useRouter, usePathname } from "next/navigation";
// import usePlayer from "@/hooks/usePlayer";
import { twMerge } from "tailwind-merge";
// import { usePlayer } from "@/contexts/melodious/PlayerContext";
import { useMusic } from "@/contexts/melodious/MusicPlayerContext";
import { title } from "process";
import { SidebarAd } from "@/components/ads";
import { useCartesiSubscriptionStatus } from "@/hooks/useCartesiSubscription";
import { useActiveAccount } from "thirdweb/react";
// Menu items.
const items = [
  {
    title: "Home",
    url: "/listener/dashboard",
    icon: Home,
  },
  {
    title: "Marketplace",
    url: "/listener/marketplace",
    icon: ShoppingCart,
  },
  {
    title: "My NFTs",
    url: "/listener/nft-collection",
    icon: Coins,
  },
  {
    title: "Playlist",
    url: "/listener/playlist",
    icon: Inbox,
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
  {
    title: "Referrals",
    url: "/listener/referrals",
    icon: Users,
  },
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
  const pathname = usePathname();
  const { state } = useSidebar();
  const { currentTrack } = useMusic();
  const activeAccount = useActiveAccount();
  const { data: subscriptionStatus } = useCartesiSubscriptionStatus(activeAccount?.address);
  const isPremiumUser = subscriptionStatus?.hasActiveSubscription || false;

  // Add this function to determine if a menu item is active
  const isActiveRoute = (itemUrl: string) => {
    // Return false if pathname is null
    if (!pathname) {
      return false;
    }

    // Handle exact matches
    if (pathname === itemUrl) {
      return true;
    }

    // Handle dynamic routes - if current path starts with the menu item URL
    if (pathname.startsWith(itemUrl + "/")) {
      return true;
    }

    return false;
  };

  // Filter menu items based on premium status
  const filteredItems = items.filter((item) => {
    // Show Playlist only for premium users
    if (item.title === "Playlist") {
      return isPremiumUser;
    }
    return true;
  });

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
              {filteredItems.map((item) => (
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
      <SidebarFooter className="text-white p-2">
        <SidebarAd className="w-full" />
      </SidebarFooter>
    </Sidebar>
  );
}
