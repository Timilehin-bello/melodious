"use client";
import {
  Calendar,
  ChartNoAxesColumn,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  ListCheck,
  LogOut,
  Search,
  Settings,
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

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/artist/home",
    icon: Home,
  },
  {
    title: "Song Analytics",
    url: "/artist/song-analytics",
    icon: ChartNoAxesColumn,
  },
  {
    title: "My Music",
    url: "/artist/my-music",
    icon: LayoutGrid,
  },
  {
    title: "Release",
    url: "/artist/release",
    icon: ListCheck,
  },
];

export function ArtistSidebar() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const { state } = useSidebar();
  const router = useRouter();
  const logOut = () => {
    router.push("/");
  };
  return (
    <Sidebar collapsible="icon" className="sidebar">
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
      <SidebarFooter className="bg-[#950944] text-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex align-middle items-center w-full">
              <button
                onClick={logOut}
                className={
                  state === "collapsed"
                    ? "hidden"
                    : "bg-[#950944] px-10 rounded-md py-2 text-md border-0 ml-10 mx-auto  hover:text-gray-400 "
                }
              >
                Log out
              </button>
            </div>
            <div
              className={
                state !== "collapsed"
                  ? "hidden"
                  : "bg-[#950944] px-1 rounded-full py-2 text-md border-0 mx-auto hover:text-gray-400 cursor-pointer"
              }
            >
              <LogOut size={20} />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
