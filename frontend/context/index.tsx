"use client";

import axios from "axios";
import { ethers } from "ethers";
import React from "react";
import { createContext, useContext, ReactNode } from "react";

declare global {
  interface Window {
    ethereum: any;
  }
}

interface IMelodiousContext {
  uploadToIPFS: (file: File) => Promise<string>;
  signMessages: (message: any) => Promise<any>;
  createUser: () => Promise<any>;
}

export const MelodiousContext = React.createContext<IMelodiousContext>({
  uploadToIPFS: async (file: File) => {
    return "";
  },
  signMessages: async (message: any) => {
    return "";
  },
  createUser: async () => {
    return "";
  },
});

export const MelodiousProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      console.log("Uploading file to IPFS...", file);
      const formData = new FormData();
      formData.append("file", file!);

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
        }
      );

      console.log("File uploaded to IPFS:", res.data.IpfsHash);
      const subdomain = process.env.NEXT_PUBLIC_PINATA_SUBDOMAIN;
      if (!subdomain) {
        throw new Error("PINATA_SUBDOMAIN is not defined");
      }

      return `${subdomain}/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  };

  const createUser = async () => {
    const userPayload = {
      method: "create_user",
      args: {
        name: "Timilehin Bello",
        displayName: "Timmy",
        username: "ti.bello",
        userType: "LISTENER",
      },
    };

    try {
      const txhash = await signMessages(userPayload);
      console.log(`Transaction hash is: ${txhash}`);
      return txhash;
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const signMessages = async (message: any) => {
    console.log("signMessages", JSON.stringify(message));
    try {
      console.log("Signing message...", message);
      const { address, signature } = await signMessage({ data: message });
      const finalPayload = createMessage(message, address, signature);
      const realSigner = await ethers.utils.verifyMessage(
        finalPayload.message,
        finalPayload.signature
      );
      console.log(`Realsigner is: ${realSigner}`);
      console.log("final payload", finalPayload);
      const txhash = await sendTransaction(finalPayload);
      return txhash;
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const signMessage = async (
    message: any
  ): Promise<{ address: string; signature: string }> => {
    try {
      console.log("signMessage", JSON.stringify(message));
      if (!window?.ethereum)
        throw new Error("No crypto wallet found. Please install it.");

      await window.ethereum.send("eth_requestAccounts");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(JSON.stringify(message));
      const address = await signer.getAddress();
      return { address, signature };
    } catch (err: any) {
      console.log(err.message);
      throw err;
    }
  };

  const createMessage = (
    new_data: any,

    signer: any,
    signature: any
  ) => {
    // Stringify the message object
    const messageString = JSON.stringify({ data: new_data });
    // Construct the final JSON object
    const finalObject = {
      message: messageString,
      signer: signer,
      signature: signature,
    };
    return finalObject;
  };

  const sendTransaction = async (data: any) => {
    console.log("forwarding transaction to relayer........");
    try {
      const endpoint = process.env.NEXT_PUBLIC_SERVER_ENDPOINT;
      const response = await axios.post(`${endpoint}/transactions`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Transaction successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error sending transaction:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <MelodiousContext.Provider
      value={{ uploadToIPFS, signMessages, createUser }}
    >
      {children}
    </MelodiousContext.Provider>
  );
};

export const useMelodiousContext = () => useContext(MelodiousContext);
