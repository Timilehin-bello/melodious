"use client";
import { useQuery } from "@apollo/client";
import { ethers } from "ethers";
import { useState } from "react";
import { VouchersDocument } from "../generated/graphql";

export type Voucher = {
  fetching: any;
  data: boolean;
  id: string;
  index: number;
  destination: string;
  input: any;
  payload: string;
  proof: any;
  executed: any;
  value: string;
  transactionHash?: string;
  application: {
    id: string;
    name: string;
    address: string;
  };
};

export const useVouchers = () => {
  const [cursor] = useState(null);
  const { loading, error, data, refetch, client } = useQuery(VouchersDocument, {
    variables: { cursor },
    pollInterval: 0,
  });

  console.log("useVouchers - GraphQL data:", data);
  console.log("useVouchers - GraphQL error:", error);
  console.log("useVouchers - GraphQL loading:", loading);
  console.log("useVouchers - Raw vouchers edges:", data?.vouchers?.edges);
  console.log("useVouchers - Total count:", data?.vouchers?.totalCount);

  const vouchers: Voucher[] =
    data &&
    data.vouchers.edges
      .filter((node: any) => {
        console.log("Filtering voucher node:", node);
        // Only include vouchers that have complete proof data to prevent ABI errors
        const proof = node.node?.proof;
        console.log("Voucher proof:", proof);

        if (!proof) {
          console.log("Voucher filtered out - missing proof data");
          return false;
        }
        console.log("const validity = proof.validity");
        // Validate all required proof fields are present and properly populated
        const validity = proof;
        const isValid =
          validity.outputIndex !== undefined &&
          validity.outputHashesSiblings &&
          Array.isArray(validity.outputHashesSiblings);
        console.log("Voucher validity check:", isValid);
        return isValid;
      })
      .map((node: any) => {
        const n = node.node;
        let payload = n?.payload;
        let inputPayload = n?.input.payload;
        if (inputPayload) {
          try {
            // Changed from ethers.toUtf8String to ethers.utils.toUtf8String
            inputPayload = ethers.utils.toUtf8String(inputPayload);
          } catch (e) {
            inputPayload = inputPayload + " (hex)";
          }
        } else {
          inputPayload = "(empty)";
        }
        if (payload) {
          // Changed from new ethers.AbiCoder() to ethers.utils.defaultAbiCoder
          const decoder = new ethers.utils.AbiCoder();
          const selector = decoder.decode(["bytes4"], payload)[0];
          // Changed from ethers.dataSlice to ethers.utils.hexDataSlice
          payload = ethers.utils.hexDataSlice(payload, 4);
          try {
            console.log("selector", selector);

            switch (selector) {
              case "0xa9059cbb": {
                const decode = decoder.decode(["address", "uint256"], payload);
                // Changed from ethers.formatEther to ethers.utils.formatEther
                payload = `Erc20 Transfer - Amount: ${ethers.utils.formatEther(
                  decode[1]
                )} - Address: ${decode[0]}`;
                break;
              }
              case "0x42842e0e": {
                const decode = decoder.decode(
                  ["address", "address", "uint256"],
                  payload
                );
                payload = `Erc721 Transfer - Id: ${decode[2]} - Address: ${decode[1]}`;
                break;
              }
              case "0x522f6815": {
                console.log("0x522f6815", payload);
                const decode2 = decoder.decode(["address", "uint256"], payload);
                payload = `Ether Transfer - Amount: ${ethers.utils.formatEther(
                  decode2[1]
                )} (Native eth) - Address: ${decode2[0]}`;
                break;
              }
              case "0xf242432a": {
                const decode = decoder.decode(
                  ["address", "address", "uint256", "uint256"],
                  payload
                );
                payload = `Erc1155 Single Transfer - Id: ${decode[2]} Amount: ${decode[3]} - Address: ${decode[1]}`;
                break;
              }
              case "0x2eb2c2d6": {
                const decode = decoder.decode(
                  ["address", "address", "uint256[]", "uint256[]"],
                  payload
                );
                payload = `Erc1155 Batch Transfer - Ids: ${decode[2]} Amounts: ${decode[3]} - Address: ${decode[1]}`;
                break;
              }
              case "0xd0def521": {
                const decode = decoder.decode(["address", "string"], payload);
                payload = `Mint Erc721 - String: ${decode[1]} - Address: ${decode[0]}`;
                break;
              }
              case "0x755edd17": {
                const decode = decoder.decode(["address"], payload);
                payload = `Mint Erc721 - Address: ${decode[0]}`;
                break;
              }
              case "0x6a627842": {
                const decode = decoder.decode(["address"], payload);
                payload = `Mint Erc721 - Address: ${decode[0]}`;
                break;
              }
              default: {
                const decode = decoder.decode(["address", "uint256"], payload);

                // Changed from ethers.formatEther to ethers.utils.formatEther
                console.log("decode 0x6a627842", decode);
                console.log("payload 0x6a627842", payload);
                payload = `CTSI Transfer - Amount: ${ethers.utils.formatEther(
                  decode[1]
                )} - Address: ${decode[0]}`;

                break;
              }
            }
          } catch (e) {
            console.log("Error decoding payload:", e);
            // If decoding fails, show the raw payload as hex
            payload = `Raw Payload: ${payload}`;
          }
        } else {
          payload = "(empty)";
        }
        return {
          id: `${n?.id}`,
          index: parseInt(n?.index),
          destination: `${n?.destination ?? ""}`,
          payload: `${payload}`,
          value: `${n?.value ?? "0"}`,
          transactionHash: n?.transactionHash,
          application: n?.application || { id: "", name: "", address: "" },
          input: n
            ? {
                id: n.input.id,
                index: n.input.index,
                payload: inputPayload,
                msgSender: n.input.msgSender,
              }
            : {},
          proof: n?.proof || null,
          executed: n?.executed || null,
        };
      })
      .sort((a: any, b: any) => {
        if (b.input.id === a.input.id) {
          return b.index - a.index;
        } else {
          return b.input.index - a.input.index;
        }
      });
  return { loading, error, data, vouchers, refetch, client };
};
