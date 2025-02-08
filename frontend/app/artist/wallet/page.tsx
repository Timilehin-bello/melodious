"use client";
import { useInspectCall } from "@/cartesi/hooks/useInspectCall";
import { Button } from "@/components/ui/button";
import Balance from "@/components/Wallet/Cartesi/Balance";
import Transfers from "@/components/Wallet/Cartesi/Transfers";
import DepositModal from "@/components/Wallet/Deposit";
import React, { useState } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { useRollups } from "@/cartesi/hooks/useRollups";
import { ethers } from "ethers";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { client } from "@/lib/client";
import { localhostChain } from "@/components/ConnectWallet";
import WithdrawModal from "@/components/Wallet/Withdraw";

const Wallet = () => {
  const account = useActiveAccount();
  const [transactionStatus, setTransactionStatus] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const { reports, decodedReports, inspectCall } = useInspectCall();

  const dappAddress = process.env.PUBLIC_DAPP_ADDRESS as string;

  const rollups = useRollups(dappAddress);
  const [providerInstance, setProviderInstance] = useState<
    ethers.providers.JsonRpcProvider | undefined
  >();

  const provider = ethers5Adapter.provider.toEthers({
    client,
    chain: localhostChain!,
  });
  const wallet = useActiveWallet();

  const [signerInstance, setSignerInstance] = useState<ethers.Signer>();

  return (
    <div>
      <div className="w-full flex flex-wrap  items-center gap-8 bg-gradient-to-b from-[#3D2250] to-[#1E1632] rounded-md  px-6 py-8 sm:px-4  sm:justify-between md:justify-between justify-between text-white">
        <div className="w-2/3 h-75">
          <div className="mb-3 py-4 px-6">
            <h3 className="text-2xl">Total Revenue</h3>
            {/* <h2 className="text-6xl mt-4">CTSI (62,340.48)</h2> */}
            <Balance
              account={account ? account : null}
              transactionStatus={transactionStatus}
              inspectCall={inspectCall}
              reports={reports}
              decodedReports={decodedReports}
            />
            <div className="flex gap-4 flex-wrap mt-8">
              <Button
                onClick={() => setIsTransferModalOpen(true)}
                className={`h-[45px] px-4 py-2 rounded-md text-blue-300 hover:bg-blue-500`}
              >
                Transfer
              </Button>
              <Button
                onClick={() => setIsWithdrawModalOpen(true)}
                className={`h-[45px] px-4 py-2 rounded-md text-green-300 hover:bg-green-500`}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 mt-2 text-white bg-blue-950">
        {/* <h2 className="text-2xl font-bold">Transaction History</h2> */}

        <Transfers dappAddress={dappAddress} />
      </div>

      <DepositModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        rollups={rollups}
        provider={provider}
        signerInstance={signerInstance}
        dappAddress={dappAddress}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        rollups={rollups}
        provider={provider}
        signerInstance={signerInstance}
        dappAddress={dappAddress}
      />
    </div>
  );
};

export default Wallet;
