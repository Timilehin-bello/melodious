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

export default function WithdrawModal({
  isOpen,
  onClose,
  rollups,
  provider,
  signerInstance,
  dappAddress,
  updateTransactionStatus,
}: DepositModalProps) {
  const [etherAmount, setEtherAmount] = useState("");
  const [erc20Amount, setErc20Amount] = useState<string>("");
  const [erc20Token, setErc20Token] = useState<string>("");
  const [erc721Id, setErc721Id] = useState<string>("");
  const [erc721, setErc721] = useState<string>("");
  const [loadWithdrawEther, setLoadWithdrawEther] = useState(false);
  const [loadWithdrawERC20, setLoadWithdrawERC20] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWithdrawEther = async () => {
    if (!etherAmount) return toast.error("Amount fields required!");
    setLoadWithdrawEther(true);
    console.log("withdrawEther", dappAddress);

    const res: any = await withdrawEther(
      rollups,
      provider,
      Number(etherAmount),
      dappAddress
    );

    console.log("result", res);

    if (res.transactionHash) {
      setLoadWithdrawEther(false);
      updateTransactionStatus(true);
      onClose();
      toast.success(res.transactionHash);
    } else {
      setLoadWithdrawEther(false);
      return toast.error(res);
    }

    // setEtherAmount("");
  };

  const handleWithdrawERC20 = async () => {
    if (!erc20Amount || !erc20Token) return toast.error("Fields required!");
    setLoadWithdrawERC20(true);
    const res: any = await withdrawErc20(
      rollups,
      provider,
      Number(erc20Amount),
      erc20Token,
      dappAddress
    );
    if (!res.hash) {
      setLoadWithdrawERC20(false);
      return toast.error(res);
    }
    updateTransactionStatus(true);
    setLoadWithdrawERC20(false);
    onClose();
    toast.success(res.hash);
    setErc20Amount("");
  };

  const handleWithdrawERC721 = async () => {};

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold mb-4 text-2xl">Withdraw</h2>

          <button
            onClick={onClose}
            className="text-gray-700 font-bold text-medium"
          >
            X
          </button>
        </div>
        <TabGroup>
          <TabList className="flex space-x-2 border-b pb-2">
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
                className="w-full p-2 bg-blue-600 text-white rounded mt-2"
                onClick={handleWithdrawEther}
                disabled={loading}
              >
                {loadWithdrawEther ? "Withdrawing please wait..🤑" : "Withdraw"}
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
                className="w-full p-2 bg-blue-600 text-white rounded mt-2"
                onClick={handleWithdrawERC20}
                disabled={loading}
              >
                {loading ? "Withdrawing Erc20..." : "Withdraw"}
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
                className="w-full p-2 bg-blue-600 text-white rounded mt-2"
                onClick={handleWithdrawERC721}
                disabled={loading}
              >
                {loadWithdrawERC20 ? "Withdrawing please wait..🤑" : "Withdraw"}
              </button>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </Dialog>
  );
}
