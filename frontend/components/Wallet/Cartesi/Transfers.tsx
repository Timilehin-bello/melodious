"use client";

import React from "react";
import { Tab } from "@headlessui/react";
import { Vouchers } from "./Vouchers";
import Reports from "./Reports";
import { cn } from "@/lib/utils";
import { Ticket, Bell, AlertCircle } from "lucide-react";

interface IProps {
  dappAddress: string;
}

const Transfers: React.FC<IProps> = ({ dappAddress }) => {

  const tabs = [
    {
      name: "Vouchers",
      icon: <Ticket className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="bg-[#950944]/10 border border-[#950944]/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#950944] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300 leading-relaxed">
                After the withdrawal request, the user must execute a voucher to
                transfer assets from the Cartesi dApp to their account.
              </p>
            </div>
          </div>

          <Vouchers dappAddress={dappAddress} />
        </div>
      ),
    },
    {
      name: "Activity",
      icon: <Bell className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <Reports />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-zinc-900/30 rounded-xl backdrop-blur-sm border border-zinc-800/50">
      <Tab.Group>
        <div className="border-b border-zinc-800/50">
          <Tab.List className="flex">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  cn(
                    "px-6 py-4 text-sm font-medium outline-none",
                    "flex items-center gap-2 transition-all duration-200",
                    selected
                      ? "text-[#950944] border-b-2 border-[#950944]"
                      : "text-zinc-400 hover:text-zinc-300"
                  )
                }
              >
                {tab.icon}
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
        </div>

        <Tab.Panels className="p-6">
          {tabs.map((tab, idx) => (
            <Tab.Panel key={idx} className={cn("focus:outline-none")}>
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Transfers;
