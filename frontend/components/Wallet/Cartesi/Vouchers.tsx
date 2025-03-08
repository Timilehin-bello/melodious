"use client";

import { ethers } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import { useRollups } from "@/cartesi/hooks/useRollups";

import { Voucher, useVouchers } from "@/cartesi/hooks/useVouchers";
import { executeVoucher, executeVouchers } from "@/cartesi/Portals";
import toast from "react-hot-toast";

interface IVoucherProps {
  dappAddress: string;
}

export const Vouchers: React.FC<IVoucherProps> = (props) => {
  const { loading, error, data, vouchers, refetch, client } = useVouchers();
  const [voucherToExecute, setVoucherToExecute] = useState<any>();
  const rollups = useRollups(props.dappAddress);

  const getProof = async (voucher: Voucher) => {
    setVoucher(voucher);
    refetch({ requestPolicy: "network-only" });
  };

  const setVoucher = useCallback(
    async (voucher: any) => {
      console.log("voucher 123", voucher);
      if (rollups) {
        voucher.executed = await rollups.dappContract.wasVoucherExecuted(
          ethers.BigNumber.from(voucher.input.index),
          ethers.BigNumber.from(voucher.index)
        );
      }
      console.log("voucher.executed", voucherToExecute);
      setVoucherToExecute(voucher);
      console.log(voucherToExecute);
    },
    [rollups, voucherToExecute]
  );

  useEffect(() => {
    console.log("vouchers", vouchers);
    refetch({ requestPolicy: "network-only" });
  }, [refetch, vouchers]);

  if (loading) return <p className="text-slate-400">Loading...</p>;
  if (error) return <p className="text-slate-400">Oh no... {error.message}</p>;

  if (!data || !data.vouchers)
    return <p className="text-slate-400">No vouchers</p>;

  return (
    <div className="overflow-x-auto border border-gray-300 p-4 rounded-lg text-slate-200">
      <p></p>
      <button
        className="mt-4 float-right px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={() => refetch({ requestPolicy: "network-only" })}
      >
        Reload 🔃
      </button>
      {voucherToExecute ? (
        <table className="w-full mt-6 table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Input Index</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Voucher Index</th>
              {/*<th>Destination</th> */}
              {/* <th>Payload</th> */}
              {/* <th>Proof</th> */}
              {/* <th>Input Payload</th> */}
              {/* <th>Msg</th> */}
            </tr>
          </thead>
          <tbody>
            <tr
              key={`${voucherToExecute && voucherToExecute.input.index}-${
                voucherToExecute && voucherToExecute.index
              }`}
            >
              <td className="px-4 py-2">
                {voucherToExecute && voucherToExecute.input.index}
              </td>
              {/*<Td>{voucherToExecute.destination}</Td> */}
              <td className="px-4 py-2">
                <button
                  className={`px-4 py-2 text-sm bg-green-500 text-white rounded-md ${
                    voucherToExecute.executed
                      ? "bg-gray-400 cursor-not-allowed"
                      : "hover:bg-green-600"
                  }`}
                  disabled={voucherToExecute.executed}
                  onClick={async () => {
                    const res: any = await executeVoucher(
                      client,
                      voucherToExecute,
                      rollups!
                    );
                    toast.success(res);
                  }}
                >
                  {voucherToExecute &&
                  voucherToExecute.executed &&
                  voucherToExecute.executed
                    ? "Voucher executed"
                    : "Execute Voucher"}
                </button>
              </td>
              <td className="px-4 py-2">
                {voucherToExecute && voucherToExecute.index}
              </td>
              {/* <td>{voucherToExecute.payload}</td> */}
              {/* <td>{voucherToExecute.proof}</td> */}
              {/* <Td>{voucherToExecute.input.payload}</Td> */}
              {/* <Td>{voucherToExecute.msg}</Td> */}
              <br /> <br />
            </tr>
          </tbody>
        </table>
      ) : (
        <p></p>
      )}

      <table className="w-full mt-8 table-auto">
        <thead>
          <tr className="text-gray-900">
            {/*<th>Input Index</th>
                        <th>Voucher Index</th>
                        <th>Destination</th> */}
            <th className="px-4 py-2">Action</th>
            {/* <th>Input Payload</th> */}
            <th className="px-4 py-2">Payload</th>
            {/* <th>Proof</th> */}
          </tr>
        </thead>
        <tbody>
          {vouchers && vouchers.length === 0 && (
            <tr>
              <td className="text-center px-4 py-2" colSpan={4}>
                -
              </td>
            </tr>
          )}
          {vouchers &&
            vouchers.map((n: any) => (
              <tr key={`${n.input.index}-${n.index}`}>
                {/*<Td>{n.input.index}</Td>
                            <Td>{n.index}</Td>
                            <Td>{n.destination}</Td> */}
                <td className="px-4 py-2">
                  <button
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={() => getProof(n)}
                  >
                    Get Proof
                  </button>
                </td>
                {/* <td>{n.input.payload}</td> */}
                <td className="px-4 py-2 text-slate-500 text-wrap">
                  {n.payload}
                </td>
                {/* <td>
                                <button disabled={!!n.proof} onClick={() => executeVoucher(n)}>Execute voucher</button>
                            </td> */}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
