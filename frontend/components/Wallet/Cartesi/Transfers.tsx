"use client";

import React, { useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import { Vouchers } from "./Vouchers";
import Reports from "./Reports";
import { useRollups } from "@/cartesi/hooks/useRollups";
import { sendAddress } from "@/cartesi/Portals";
import { toast } from "react-hot-toast";
import { useActiveAccount } from "thirdweb/react";
import { cn } from "@/lib/utils";
import { Ticket, Bell, Loader2, ExternalLink, AlertCircle } from "lucide-react";

interface IProps {
  dappAddress: string;
}

const Transfers: React.FC<IProps> = ({ dappAddress }) => {
  const [dappRelayedAddress, setDappRelayedAddress] = useState(false);
  const [isRelaying, setIsRelaying] = useState(false);
  const [isCheckingRelayStatus, setIsCheckingRelayStatus] = useState(true);
  const account = useActiveAccount();
  const rollups = useRollups(dappAddress);

  // Check relay status on component mount
  useEffect(() => {
    const checkRelayStatus = async () => {
      try {
        // Check localStorage first
        const storedRelayStatus = localStorage.getItem(
          `dapp_relayed_${dappAddress}`
        );
        if (storedRelayStatus === "true") {
          setDappRelayedAddress(true);
          setIsCheckingRelayStatus(false);
          return;
        }

        // If not in localStorage, check if vouchers exist as an indicator
        // This is a simple way to determine if the address has been relayed
        const response = await fetch("/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query {
                vouchers(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            `,
          }),
        });

        const data = await response.json();
        const hasVouchers = data?.data?.vouchers?.edges?.length > 0;

        if (hasVouchers) {
          setDappRelayedAddress(true);
          localStorage.setItem(`dapp_relayed_${dappAddress}`, "true");
        }
      } catch (error) {
        console.log("Error checking relay status:", error);
      } finally {
        setIsCheckingRelayStatus(false);
      }
    };

    checkRelayStatus();
  }, [dappAddress]);

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

          {!dappRelayedAddress ? (
            <div className="bg-zinc-900/50 rounded-lg p-6 text-center">
              <p className="text-zinc-300 mb-4">
                Let the dApp know its address!
              </p>
              <button
                onClick={async () => {
                  setIsRelaying(true);
                  try {
                    const tx = await sendAddress(rollups, dappAddress);
                    setDappRelayedAddress(true);
                    // Store relay status in localStorage
                    localStorage.setItem(`dapp_relayed_${dappAddress}`, "true");
                    toast.success("Address relayed successfully");
                  } catch (err) {
                    toast.error(`Failed to relay address: ${String(err)}`);
                  } finally {
                    setIsRelaying(false);
                  }
                }}
                disabled={!rollups || isRelaying}
                className={cn(
                  "px-6 py-3 rounded-lg font-medium transition-all duration-200",
                  "bg-gradient-to-r from-[#950844] to-[#7e0837]",
                  "hover:from-[#7e0837] hover:to-[#950844]",
                  "text-white flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isRelaying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Relaying...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Relay Address
                  </>
                )}
              </button>
            </div>
          ) : (
            <Vouchers dappAddress={dappAddress} />
          )}
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
