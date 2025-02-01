"use client";
import { FC, useState } from "react";
// import { Balance } from "../component/examples/Balance";
// import Transfers from "../component/examples/Transfers";
// import { DAPP_ADDRESS } from "../utils/constants";

const Payment: FC = () => {
  const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DAPP_ADDRESS as string;
  const [dappAddress, setDappAddress] = useState<string>(DAPP_ADDRESS);

  return (
    <div className="grid grid-cols-1 mt-12 mx-auto w-1/2">
      <div className="space-y-4">
        <div className="flex items-baseline ml-2 mt-0">
          <div className="flex items-center border border-gray-300 rounded-l-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
            Dapp Address
          </div>
          <input
            className="flex-1 p-2 border border-gray-300 rounded-r-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={dappAddress}
            onChange={(e) => setDappAddress(e.target.value)}
          />
        </div>
        <br />
        <br />
      </div>
      <br />
      {/* <Balance /> */}
      <br />
      <br />
      {/* <Transfers dappAddress={dappAddress} /> */}
      <br />
      <br />
    </div>
  );
};

export default Payment;
