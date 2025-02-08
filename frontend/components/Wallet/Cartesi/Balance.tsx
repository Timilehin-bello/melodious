"use client";

import React, { useEffect } from "react";
import { ethers } from "ethers";
import { useActiveAccount } from "thirdweb/react";
import { useInspectCall } from "@/cartesi/hooks/useInspectCall";
import { BalanceProps } from "@/types";

const Balance: React.FC<BalanceProps> = ({
  account,
  transactionStatus,
  inspectCall,
  reports,
  decodedReports,
}) => {
  useEffect(() => {
    if (account?.address) {
      inspectCall(`balance/${account.address}`);
    }
  }, [account?.address, transactionStatus]);

  return (
    <div className="pt-4 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-center text-gray-600 p-2">Ether</th>
              <th className="text-center text-gray-600 p-2">ERC-20</th>
              <th className="text-center text-gray-600 p-2">ERC-721</th>
            </tr>
          </thead>
          <tbody>
            {reports?.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 p-4">
                  Looks like your Cartesi dApp balance is zero! 🙁
                </td>
              </tr>
            ) : (
              <tr>
                {decodedReports?.ether && (
                  <td className="text-center p-2">
                    {ethers.utils.formatEther(decodedReports.ether)}
                  </td>
                )}
                {decodedReports?.erc20 && (
                  <td className="text-center p-2">
                    <div>📍 {String(decodedReports.erc20).split(",")[0]}</div>
                    <div>
                      🤑{" "}
                      {Number(String(decodedReports.erc20).split(",")[1]) > 0
                        ? Number(String(decodedReports.erc20).split(",")[1]) /
                          10 ** 18
                        : null}
                    </div>
                  </td>
                )}
                {decodedReports?.erc721 && (
                  <td className="text-center p-2">
                    <div>📍 {String(decodedReports.erc721).split(",")[0]}</div>
                    <div>🆔 {String(decodedReports.erc721).split(",")[1]}</div>
                  </td>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* <button
        className="w-full mt-4 bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600"
        onClick={() => inspectCall(`balance/${account?.address}`)}
      >
        Get Balance
      </button> */}
    </div>
  );
};

export default Balance;
