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
import { localhostChain } from "@/components/ConnectWallet";
import WithdrawModal from "@/components/Wallet/Withdraw";
import WithdrawCTSIModal from "@/components/Wallet/WithdrawCTSI";

const Wallet = () => {
  const account = useActiveAccount();
  const [transactionStatus, setTransactionStatus] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawalCTSModalOpen, setIsWithdrawalCTSModalOpen] =
    useState(false);
  const { reports, decodedReports, inspectCall } = useInspectCall();

  const dappAddress = process.env.NEXT_PUBLIC_DAPP_ADDRESS as string;

  const rollups = useRollups(dappAddress);
  const [providerInstance, setProviderInstance] = useState<
    ethers.providers.JsonRpcProvider | undefined
  >();

  const provider = ethers5Adapter.provider.toEthers({
    client,
    chain: localhostChain!,
  });
  const [signerInstance, setSignerInstance] = useState<ethers.Signer>();

  const getData = React.useCallback(async () => {
    const getSigner = ethers5Adapter.signer.toEthers({
      client,
      chain: localhostChain!,
      account: account!,
    });

    setSignerInstance(await getSigner);

    console.log("await signer", await getSigner);

    const provider = (await getSigner).provider;

    const signer = provider.getSigner();
    const signerAddress = await signer?.getAddress();
    console.log("signerAddress", signerAddress);

    console.log("provider", provider);

    setProviderInstance(provider);
  }, [account]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div className="max-w-screen-2xl mx-auto ">
      <div className="mb-6 w-full flex flex-wrap  items-center gap-8 bg-gradient-to-b from-[#3D2250] to-[#1E1632] rounded-md  px-6 py-8 sm:px-4  sm:justify-between md:justify-between justify-between text-white">
        <div className="w-full flex justify-center">
          <div className="w-2/3 h-75">
            <div className="mb-3 py-4 px-6">
              <h3 className="text-3xl">Wallet</h3>

              <Balance
                account={account ? account : null}
                transactionStatus={transactionStatus}
                inspectCall={inspectCall}
                reports={reports}
                decodedReports={decodedReports}
              />
              <div>
                <div className="flex gap-4 flex-wrap mt-8">
                  <Button
                    onClick={() => setIsWithdrawalCTSModalOpen(true)}
                    className={`h-[45px] px-4 py-2 rounded-md text-white `}
                  >
                    Withdraw CTSI Reward
                  </Button>
                  <Button
                    onClick={() => setIsTransferModalOpen(true)}
                    className={`h-[45px] px-4 py-2 rounded-md text-blue-300    `}
                  >
                    Transfer
                  </Button>
                  <Button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className={`h-[45px] px-4 py-2 rounded-md text-green-300 `}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 mt-2 text-white">
        <Transfers dappAddress={dappAddress} />
      </div>

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
      />
    </div>
  );
};

export default Wallet;
