"use client";
import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useActiveAccount } from "thirdweb/react";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { useActiveWallet } from "thirdweb/react";
import ConnectWallet from "@/components/ConnectWallet";
import ConnectButtonAuth from "./ConnectButtonAuth";

const Header = () => {
  const activeAccount = useActiveAccount();
  const status = useActiveWalletConnectionStatus();
  const activeWallet = useActiveWallet();

  return (
    <header className="sticky top-0 z-10  flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex justify-between align-middle w-full">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 text-white" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="pr-14 mt-2">
          {/* Connect Wallet */}
          {/* <ConnectWallet /> */}
          <ConnectButtonAuth />
        </div>
      </div>
    </header>
  );
};

export default Header;
