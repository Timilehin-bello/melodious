"use client";

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
      toast.success(res.transactionHash);
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
      toast.success(res.transactionHash);
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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold mb-4 text-2xl">Deposit</h2>

            <button onClick={onClose} className="text-black font-bold">
              &times;
            </button>
          </div>

          <TabGroup>
            <TabList className="flex space-x-2 w-full border-b pb-2">
              {["Ether", "ERC20", "ERC721"].map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    selected
                      ? "bg-[#950844] hover:bg-[#7e0837] text-white p-2 rounded"
                      : "bg-gray-200 p-2 rounded"
                  }
                >
                  {tab}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {/* Ether Tab */}
              <TabPanel className="p-4">
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-2 border rounded"
                  value={etherAmount}
                  onChange={(e) => setEtherAmount(e.target.value)}
                />
                <button
                  className="w-full p-2 bg-[#950844] hover:bg-[#7e0837] text-white rounded mt-2"
                  onClick={handleDepositEther}
                  disabled={loading}
                >
                  {loading ? "Depositing..." : "Deposit"}
                </button>
              </TabPanel>
              {/* ERC20 Tab */}
              <TabPanel className="p-4">
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
                  className="w-full p-2 bg-[#950844] hover:bg-[#7e0837] text-white rounded mt-2"
                  onClick={handleDepositERC20}
                  disabled={loading}
                >
                  {loading ? "Depositing..." : "Deposit"}
                </button>
              </TabPanel>
              {/* ERC721 Tab */}
              <TabPanel className="p-4">
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
                  className="w-full p-2 bg-[#950844] hover:bg-[#7e0837] text-white rounded mt-2"
                  onClick={handleTransferERC721}
                  disabled={loading}
                >
                  {loading ? "Transferring..." : "Transfer"}
                </button>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
