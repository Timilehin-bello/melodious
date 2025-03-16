"use client";

import { X, Loader2, Wallet, Coins, Image as ImageIcon } from "lucide-react"; // Import icons
import { cn } from "@/lib/utils"; // Utility for combining classes

import { useState } from "react";
import {
  Dialog,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { toast } from "react-hot-toast";
import {
  sendAddress,
  depositErc20ToPortal,
  depositEtherToPortal,
  withdrawErc20,
  withdrawErc721,
  withdrawEther,
  transferNftToPortal,
  transferErc1155BatchToPortal,
} from "@/cartesi/Portals";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  rollups: any;
  provider: any;
  signerInstance: any;
  dappAddress: string;
  updateTransactionStatus: (status: boolean) => void;
}

export default function DepositModal({
  isOpen,
  onClose,
  rollups,
  provider,
  signerInstance,
  dappAddress,
  updateTransactionStatus,
}: DepositModalProps) {
  const [etherAmount, setEtherAmount] = useState("");
  const [erc20Token, setErc20Token] = useState("");
  const [erc20Amount, setErc20Amount] = useState("");
  const [erc721, setErc721] = useState("");
  const [erc721Id, setErc721Id] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDepositEther = async () => {
    if (!etherAmount) return toast.error("Amount field required!");
    setLoading(true);
    try {
      const res = await depositEtherToPortal(
        rollups,
        provider,
        Number(etherAmount),
        dappAddress
      );
      console.log("error handleDepositEther", res.transactionHash);
      if (!res.transactionHash) return toast.error("Error depositing ether");
      updateTransactionStatus(true);
      onClose();
      toast.success("Ether deposited successfully");
    } catch (error) {
      console.log("error", error);
      updateTransactionStatus(true);
      onClose();
      toast.error(`handleDepositEther ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositERC20 = async () => {
    // console.log("erc20Token", erc20Token);
    // console.log("erc20Token", erc20Amount);
    if (!erc20Token || !erc20Amount) return toast.error("Fields required!");
    setLoading(true);
    try {
      const res: any = await depositErc20ToPortal(
        rollups,
        signerInstance,
        erc20Token,
        Number(erc20Amount),
        dappAddress
      );
      console.log("res", res);
      if (!res.transactionHash) throw new Error(res);
      toast.success("ERC20 deposited successfully");
    } catch (error) {
      toast.error(`handleDepositERC20 ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferERC721 = async () => {
    if (!erc721 || !erc721Id) return toast.error("Fields required!");
    setLoading(true);
    try {
      const res: any = await transferNftToPortal(
        rollups,
        provider,
        erc721,
        Number(erc721Id),
        dappAddress
      );
      if (!res.transactionHash) throw new Error(res);
      toast.success(res.transactionHash);
    } catch (error) {
      toast.error(`handleTransferERC721 ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      name: "Ether",
      icon: <Wallet className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#950844] focus:border-transparent
                placeholder-zinc-400 text-white"
              value={etherAmount}
              onChange={(e) => setEtherAmount(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
              ETH
            </span>
          </div>
          <button
            className={cn(
              "w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 text-white",
              "bg-gradient-to-r from-[#950844] to-[#7e0837]",
              "hover:from-[#7e0837] hover:to-[#950844]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
            onClick={handleDepositEther}
            disabled={loading || !etherAmount}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
            {loading ? "Depositing..." : "Deposit Ether"}
          </button>
        </div>
      ),
    },
    {
      name: "ERC20",
      icon: <Coins className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Token Address"
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#950844] focus:border-transparent
              placeholder-zinc-400 text-white"
            value={erc20Token}
            onChange={(e) => setErc20Token(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#950844] focus:border-transparent
              placeholder-zinc-400 text-white"
            value={erc20Amount}
            onChange={(e) => setErc20Amount(e.target.value)}
          />
          <button
            className={cn(
              "w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 text-white",
              "bg-gradient-to-r from-[#950844] to-[#7e0837]",
              "hover:from-[#7e0837] hover:to-[#950844]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
            onClick={handleDepositERC20}
            disabled={loading || !erc20Token || !erc20Amount}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Coins className="w-4 h-4" />
            )}
            {loading ? "Depositing..." : "Deposit Token"}
          </button>
        </div>
      ),
    },
    {
      name: "ERC721",
      icon: <ImageIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="NFT Contract Address"
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#950844] focus:border-transparent
              placeholder-zinc-400 text-white"
            value={erc721}
            onChange={(e) => setErc721(e.target.value)}
          />
          <input
            type="number"
            placeholder="NFT ID"
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#950844] focus:border-transparent
              placeholder-zinc-400 text-white"
            value={erc721Id}
            onChange={(e) => setErc721Id(e.target.value)}
          />
          <button
            className={cn(
              "w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 text-white",
              "bg-gradient-to-r from-[#950844] to-[#7e0837]",
              "hover:from-[#7e0837] hover:to-[#950844]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
            onClick={handleTransferERC721}
            disabled={loading || !erc721 || !erc721Id}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            {loading ? "Transferring..." : "Transfer NFT"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#181425] p-6 shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">
              Deposit Assets
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Tab.Group>
            <Tab.List className="flex space-x-2 rounded-lg bg-zinc-800/50 p-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    cn(
                      "w-full rounded-md py-2.5 text-sm font-medium leading-5",
                      "flex items-center justify-center gap-2",
                      "focus:outline-none transition-all duration-200",
                      selected
                        ? "bg-[#950844] text-white shadow"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    )
                  }
                >
                  {tab.icon}
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-6">
              {tabs.map((tab, idx) => (
                <Tab.Panel
                  key={idx}
                  className={cn(
                    "rounded-xl bg-zinc-800/20 p-4",
                    "ring-white/5 ring-1 ring-opacity-5"
                  )}
                >
                  {tab.content}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
