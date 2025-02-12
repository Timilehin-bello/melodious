"use client";

import React, { useEffect } from "react";
import { ethers } from "ethers";
import { useNotices } from "@/cartesi/hooks/useNotices";

const Notices: React.FC = () => {
  const { loading, error, data, notices, refetch } = useNotices();

  useEffect(() => {
    refetch({ requestPolicy: "network-only" });
  }, [refetch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-gray-400">Oh no... {error.message}</p>;
  if (!data || !data.notices)
    return <p className="text-gray-400">No Notices</p>;

  const payloadIsJSON = (payload: any) => {
    try {
      JSON.parse(payload);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="overflow-x-auto border border-gray-300 p-4 rounded-lg">
      <table className="w-full border-collapse border text-black border-gray-200">
        <thead>
          <tr className="">
            <th className="text-left p-2">Notices</th>
            <th className="p-2">
              <button
                className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                onClick={() => refetch({ requestPolicy: "network-only" })}
              >
                🔃
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {notices.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center p-4">
                -
              </td>
            </tr>
          )}
          {notices.map((n: any) => (
            <tr key={`${n.input.index}-${n.index}`} className="border-b">
              {payloadIsJSON(n.payload) ? (
                <td className="p-2 ">
                  <span className="px-2 py-1 text-sm rounded bg-blue-200">
                    {JSON.parse(n.payload).type}
                  </span>
                </td>
              ) : (
                <td className="p-2">
                  <span className="px-2 py-1 text-sm rounded bg-gray-300">
                    DappAdressRelay
                  </span>
                </td>
              )}

              {payloadIsJSON(n.payload) ? (
                <td className="p-2 text-gray-600 text-wrap">
                  {JSON.parse(n.payload).type === "etherdeposit" && (
                    <>
                      {ethers.utils.formatEther(
                        JSON.parse(n.payload).content.amount
                      )}{" "}
                      Ξ deposited to ctsi account{" "}
                      {JSON.parse(n.payload).content.address}
                    </>
                  )}
                  {JSON.parse(n.payload).type === "erc20deposit" && (
                    <>
                      {ethers.utils.formatEther(
                        JSON.parse(n.payload).content.amount
                      )}{" "}
                      amount deposited to ctsi account{" "}
                      {JSON.parse(n.payload).content.address}. ERC20 address{" "}
                      {JSON.parse(n.payload).content.erc20}
                    </>
                  )}
                  {JSON.parse(n.payload).type === "erc721deposit" && (
                    <>
                      NFT address{" "}
                      <span className="px-1 py-0.5 text-xs bg-purple-200 rounded">
                        {JSON.parse(n.payload).content.erc721}
                      </span>{" "}
                      and id {JSON.parse(n.payload).content.token_id}{" "}
                      transferred to ctsi account{" "}
                      {JSON.parse(n.payload).content.address}
                    </>
                  )}
                </td>
              ) : (
                <td className="p-2 text-gray-600 text-wrap">{n.payload}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Notices;
