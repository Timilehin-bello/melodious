"use client";

import { useState } from "react";
import { Dialog, Tab } from "@headlessui/react";
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
}

export default function WithdrawModal({
  isOpen,
  onClose,
  rollups,
  provider,
  signerInstance,
  dappAddress,
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
      if (!res.hash) throw new Error(res);
      toast.success(res.hash);
    } catch (error) {
      toast.error(String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDepositERC20 = async () => {
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
      if (!res.hash) throw new Error(res);
      toast.success(res.hash);
    } catch (error) {
      toast.error(String(error));
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
      if (!res.hash) throw new Error(res);
      toast.success(res.hash);
    } catch (error) {
      toast.error(String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <Tab.Group>
          <Tab.List className="flex space-x-2 border-b pb-2">
            {["Ether", "ERC20", "ERC721"].map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  selected
                    ? "bg-blue-600 text-white p-2 rounded"
                    : "bg-gray-200 p-2 rounded"
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {/* Ether Tab */}
            <Tab.Panel className="p-4">
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full p-2 border rounded"
                value={etherAmount}
                onChange={(e) => setEtherAmount(e.target.value)}
              />
              <button
                className="w-full p-2 bg-blue-600 text-white rounded mt-2"
                onClick={handleDepositEther}
                disabled={loading}
              >
                {loading ? "Withdrawing..." : "Withdraw"}
              </button>
            </Tab.Panel>
            {/* ERC20 Tab */}
            <Tab.Panel className="p-4">
              <input
                type="text"
                placeholder="Token Address"
                className="w-full p-2 border rounded"
                value={erc20Token}
                onChange={(e) => setErc20Token(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount"
                className="w-full p-2 border rounded mt-2"
                value={erc20Amount}
                onChange={(e) => setErc20Amount(e.target.value)}
              />
              <button
                className="w-full p-2 bg-blue-600 text-white rounded mt-2"
                onClick={handleDepositERC20}
                disabled={loading}
              >
                {loading ? "Withdrawing..." : "Withdraw"}
              </button>
            </Tab.Panel>
            {/* ERC721 Tab */}
            <Tab.Panel className="p-4">
              <input
                type="text"
                placeholder="NFT Contract Address"
                className="w-full p-2 border rounded"
                value={erc721}
                onChange={(e) => setErc721(e.target.value)}
              />
              <input
                type="number"
                placeholder="NFT ID"
                className="w-full p-2 border rounded mt-2"
                value={erc721Id}
                onChange={(e) => setErc721Id(e.target.value)}
              />
              <button
                className="w-full p-2 bg-blue-600 text-white rounded mt-2"
                onClick={handleTransferERC721}
                disabled={loading}
              >
                {loading ? "Withdrawing..." : "Withdraw"}
              </button>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        <button
          className="mt-4 w-full p-2 bg-gray-500 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}
