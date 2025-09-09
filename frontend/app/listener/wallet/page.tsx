"use client";

import { useInspectCall } from "@/cartesi/hooks/useInspectCall";
import { Button } from "@/components/ui/button";
import Balance from "@/components/Wallet/Cartesi/Balance";
import Transfers from "@/components/Wallet/Cartesi/Transfers";
import DepositModal from "@/components/Wallet/Deposit";
import React, { useEffect, useState } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { useRollups } from "@/cartesi/hooks/useRollups";
import { ethers } from "ethers";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { client } from "@/lib/client";
import { networkChain } from "@/components/ConnectWallet";
import WithdrawModal from "@/components/Wallet/Withdraw";
import WithdrawCTSIModal from "@/components/Wallet/WithdrawCTSI";
import {
  ArrowUpRight,
  Wallet as WalletIcon,
  ArrowDownLeft,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import fetchMethod from "@/lib/readState";
import { IUser } from "@/app/artist/dashboard/page";

const Wallet = () => {
  const account = useActiveAccount();
  const [transactionStatus, setTransactionStatus] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawalCTSModalOpen, setIsWithdrawalCTSModalOpen] =
    useState(false);
  const { reports, decodedReports, inspectCall } = useInspectCall();
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  const dappAddress = process.env.NEXT_PUBLIC_DAPP_ADDRESS as string;

  const rollups = useRollups(dappAddress);
  const [providerInstance, setProviderInstance] = useState<
    ethers.providers.JsonRpcProvider | undefined
  >();

  const provider = ethers5Adapter.provider.toEthers({
    client,
    chain: networkChain!,
  });
  // const provider = new ethers.providers.Web3Provider(window.ethereum);
  const [signerInstance, setSignerInstance] = useState<ethers.Signer>();

  const getData = React.useCallback(async () => {
    const getSigner = ethers5Adapter.signer.toEthers({
      client,
      chain: networkChain!,
      account: account!,
    });

    setSignerInstance(await getSigner);

    console.log("await signer", await getSigner);

    // const provider = (await getSigner).provider;

    // const signer = provider.getSigner();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    console.log("wallet test signer", signer);
    const signerAddress = await signer?.getAddress();
    console.log("signerAddress", signerAddress);

    console.log("provider", provider);

    setProviderInstance(provider);
  }, [account]);

  const fetchData = async (user: IUser) => {
    setIsLoading(true);
    try {
      const getUserDetails = await fetchMethod(
        "get_user_info/" + user.walletAddress
      );
      if (getUserDetails) {
        setUserDetails(getUserDetails);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let user = localStorage.getItem("xx-mu") as any;
    user = JSON.parse(user) ?? null;
    user = user?.user;
    if (user) {
      fetchData(user);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const actionButtons = [
    {
      label: "Withdraw CTSI Reward",
      icon: <Coins className="w-4 h-4" />,
      onClick: () => setIsWithdrawalCTSModalOpen(true),
      className: "bg-zinc-800 hover:bg-zinc-700 text-[#1f9d55]",
    },
    {
      label: "Transfer",
      icon: <ArrowUpRight className="w-4 h-4" />,
      onClick: () => setIsTransferModalOpen(true),
      className: "bg-zinc-800 hover:bg-zinc-700 text-blue-300",
    },
    {
      label: "Withdraw",
      icon: <ArrowDownLeft className="w-4 h-4" />,
      onClick: () => setIsWithdrawModalOpen(true),
      className: "bg-zinc-800 hover:bg-zinc-700 text-green-300",
    },
  ];

  return (
    <div className="min-h-screen ">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Wallet Header */}
        <div className="mb-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
              {/* Title */}
              <div className="flex items-center gap-3 mb-6">
                <WalletIcon className="w-8 h-8 text-[#950844]" />
                <h1 className="text-3xl font-semibold text-white">Wallet</h1>
              </div>

              {/* Balance Section */}
              <div className="mb-8">
                <Balance
                  account={account ? account : null}
                  transactionStatus={transactionStatus}
                  inspectCall={inspectCall}
                  reports={reports}
                  decodedReports={decodedReports}
                  userDetails={userDetails}
                  fetchData={fetchData}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {actionButtons.map((button, index) => (
                  <Button
                    key={index}
                    onClick={button.onClick}
                    className={cn(
                      "h-12 px-6 rounded-lg",
                      "transition-all duration-200",
                      "flex items-center gap-2",
                      "font-medium",
                      button.className
                    )}
                  >
                    {button.icon}
                    {button.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transfers Section */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-6">
              Recent Transactions
            </h2>
            <Transfers dappAddress={dappAddress} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        rollups={rollups}
        provider={provider}
        signerInstance={signerInstance}
        dappAddress={dappAddress}
        updateTransactionStatus={setTransactionStatus}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        rollups={rollups}
        provider={provider}
        signerInstance={signerInstance}
        dappAddress={dappAddress}
        updateTransactionStatus={setTransactionStatus}
      />
      <WithdrawCTSIModal
        isOpen={isWithdrawalCTSModalOpen}
        onClose={() => setIsWithdrawalCTSModalOpen(false)}
        updateTransactionStatus={setTransactionStatus}
        userDetails={userDetails}
      />
    </div>
  );
};

export default Wallet;
