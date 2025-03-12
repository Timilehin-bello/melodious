"use client";
import React, { useEffect, useState } from "react";
import { useRollups } from "../../../cartesi/hooks/useRollups";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Vouchers } from "./Vouchers";

import { ethers5Adapter } from "thirdweb/adapters/ethers5";

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
import { client } from "@/lib/client";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import toast from "react-hot-toast";
import { localhostChain } from "@/components/ConnectWallet";
import { useActiveWallet } from "thirdweb/react";
import { ethers } from "ethers";
import Notices from "./Notices";
import Reports from "./Reports";

interface IProps {
  dappAddress: string;
}

const Transfers: React.FC<IProps> = ({ dappAddress }: IProps) => {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
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

  const getData = React.useCallback(async () => {
    const getSigner = ethers5Adapter.signer.toEthers({
      client,
      chain: localhostChain!,
      account: account!,
    });

    setSignerInstance(await getSigner);

    console.log("await signer", await getSigner);
    // const getAddress = (await getSigner).getAddress();
    // console.log("getAddress", getAddress);
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

  // const provider = getProvider;
  const [dappRelayedAddress, setDappRelayedAddress] = useState<boolean>(false);
  const [erc20Amount, setErc20Amount] = useState<string>("");
  const [erc20Token, setErc20Token] = useState<string>("");
  const [erc721Id, setErc721Id] = useState<string>("");
  const [erc721, setErc721] = useState<string>("");
  const [etherAmount, setEtherAmount] = useState<string>("");

  const [erc1155, setErc1155] = useState<string>("");
  const [erc1155Id, setErc1155Id] = useState<string>("");
  const [erc1155Amount, setErc1155Amount] = useState<string>("");
  const [erc1155Ids, setErc1155Ids] = useState<number[]>([]);
  const [erc1155Amounts, setErc1155Amounts] = useState<number[]>([]);
  const [erc1155IdsStr, setErc1155IdsStr] = useState<string>("[]");
  const [erc1155AmountsStr, setErc1155AmountsStr] = useState<string>("[]");
  const [loadEther, setLoadEther] = useState(false);
  const [loadERC20, setLoadERC20] = useState(false);
  const [loadWithdrawEther, setLoadWithdrawEther] = useState(false);
  const [loadWithdrawERC20, setLoadWithdrawERC20] = useState(false);
  const [loadTransferNFT, setLoadTransferNFT] = useState(false);
  const [loadWithdrawERC721, setLoadWithdrawERC721] = useState(false);
  const [loadERC1155, setLoadERC1155] = useState(false);
  const [loadERC1155Batch, setLoadERC1155Batch] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };
  const addTo1155Batch = () => {
    const newIds = erc1155Ids;
    newIds.push(Number(erc1155Id!));
    setErc1155Ids(newIds);
    const newAmounts = erc1155Amounts;
    newAmounts.push(Number(erc1155Amount!));
    setErc1155Amounts(newAmounts);
    setErc1155IdsStr("[" + erc1155Ids.join(",") + "]");
    setErc1155AmountsStr("[" + erc1155Amounts.join(",") + "]");
  };

  const clear1155Batch = () => {
    setErc1155IdsStr("[]");
    setErc1155AmountsStr("[]");
    setErc1155Ids([]);
    setErc1155Amounts([]);
  };

  return (
    <div className="border border-gray-300 p-4 rounded-lg overflow-hidden w-full mx-auto  shadow-md">
      <TabGroup>
        <TabList className="flex space-x-2 border-b border-gray-300 ">
          {["🎟️ Vouchers", "🔔 Activity"].map((tab, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                  selected
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="p-4">
          <TabPanel>
            <p className="text-sm text-gray-200 font-bold">
              After the withdrawal request, the user must execute a voucher to
              transfer assets from the Cartesi dApp to their account.
            </p>
            <div className="mt-4  p-4 rounded">
              <br />
              {!dappRelayedAddress && (
                <div className="">
                  Let the dApp know its address! <br />
                  <button
                    className="mt-4 text-sm text-white rounded p-2 bg-[#950944]  hover:bg-[#7e0837]"
                    onClick={async () => {
                      try {
                        const tx = await sendAddress(rollups, dappAddress);
                        setDappRelayedAddress(true);
                        toast.success(String(tx));
                      } catch (err) {
                        toast.error(`sendAddress ${String(err)}`);
                      }
                    }}
                    disabled={!rollups}
                  >
                    Relay Address
                  </button>
                  <br />
                  <br />
                </div>
              )}
              {dappRelayedAddress && <Vouchers dappAddress={dappAddress} />}
            </div>
          </TabPanel>

          <TabPanel className="">
            <div className="mt-4  p-4 rounded">
              {/* <Notices /> */}
              <br />
              <Reports />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default Transfers;
