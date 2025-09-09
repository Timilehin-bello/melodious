"use client";

import axios from "axios";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { io, Socket } from "socket.io-client";
import { DeviceInfo } from "@/lib/getDeviceInfo";
import { disconnectSocket, initSocket } from "@/lib/socket";
import { RollupsContracts, useRollups } from "@/cartesi/hooks/useRollups";
import toast from "react-hot-toast";

declare global {
  interface Window {
    ethereum: any;
  }
}

interface IMelodiousContext {
  uploadToIPFS: (file: File) => Promise<string>;
  signMessages: (message: any) => Promise<any>;
  createUser: (user: ICreateUser) => Promise<any>;
  createGenre: (genre: ICreateGenre) => Promise<any>;
  withdrawCTSI: (amount: number) => Promise<any>;
  createAlbum?: (album: ICreateAlbum) => Promise<any>;
  createSingleTrack: (album: ICreateTrack) => Promise<any>;
  getUser: (userId: number) => Promise<any>;
  rollups: RollupsContracts | undefined;
  dappAddress: string;

  // sendEvent: (event: PlaybackEvent) => void | null;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  //////////////////////////////////////////
  socket: Socket | null;
  isConnected: boolean;
  isConnectionAllowed: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  setConditionFulfilled: (value: boolean) => void;
  isLoggedIn: boolean;
  userData: any;
  checkLoginStatus: () => Promise<boolean>;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}
interface SocketState {
  token: string | null;
  isConditionFulfilled: boolean;
}

interface ICreateAlbum {
  title: string;
  imageUrl: string;
  genreId: number;
  label: string;
  isPublished: boolean;
  tracks: Array<{
    title: string;
    imageUrl: string;
    genreId: number;
    audioUrl: string;
    isrcCode: number;
    duration: number;
    isPublished: boolean;
  }>;
}

interface ICreateGenre {
  name: string;
  description: string;
  imageUrl: string;
}

interface ICreateUser {
  name: string;
  displayName: string;
  username: string;
  userType: string;
  country?: string;
  biography?: string;
  socialMediaLinks?: {
    twitter: string;
    instagram: string;
    facebook: string;
  };
}

interface ICreateTrack {
  title: string;
  duration?: string;
  genreId: number;
  imageUrl: string;
  audioUrl: string;
  isrcCode: string;
  isPublished: string;
}

// Define event types and payload interfaces
type EventType =
  | "startPlaying"
  | "updatePosition"
  | "updateBuffer"
  | "networkQualityUpdate"
  | "pausePlaying"
  | "resumePlaying"
  | "bufferingStart"
  | "bufferingEnd"
  | "stopPlaying"
  | "skipTrack";

type StartPlayingPayload = {
  trackId: number;
  artistId: number;
  deviceInfo: DeviceInfo;
  duration: number;
};

type UpdatePositionPayload = number; // milliseconds
type UpdateBufferPayload = number; // bytes
type NetworkQualityPayload = "good" | "poor" | "unstable";

type PlaybackEvent = {
  event: EventType;
  payload?:
    | StartPlayingPayload
    | UpdatePositionPayload
    | UpdateBufferPayload
    | NetworkQualityPayload
    | Record<string, never>; // For empty payloads
};

export const MelodiousContext = React.createContext<IMelodiousContext>({
  uploadToIPFS: async (file: File) => {
    return "";
  },
  signMessages: async (message: any) => {
    return "";
  },
  createUser: async (user: ICreateUser) => {
    return "";
  },
  createGenre: async (genre: ICreateGenre) => {
    return "";
  },
  withdrawCTSI: async (amount: number) => {
    return "";
  },
  createAlbum: async (songs: ICreateAlbum) => {
    return "";
  },
  createSingleTrack: async (song: ICreateTrack) => {
    return "";
  },

  getUser: async (userId: number) => {
    return "";
  },
  // sendEvent: (event: PlaybackEvent) => {
  //   return null;
  // },
  playing: false,
  setPlaying: () => {},
  socket: null,
  isConnected: false,
  isConnectionAllowed: false,
  connect: () => {},
  disconnect: () => {},
  setConditionFulfilled: () => {},
  isLoggedIn: false,
  userData: null,
  checkLoginStatus: async () => {
    return false;
  },
  setUserData: () => {},
  rollups: undefined,
  dappAddress: "",
});

export const MelodiousProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  // const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketState, setSocketState] = useState<SocketState>({
    token: null,
    isConditionFulfilled: false,
  });

  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dappAddress = process.env.NEXT_PUBLIC_DAPP_ADDRESS || "";
  const rollups = useRollups(dappAddress);

  const checkLoginStatus = async () => {
    let data = localStorage.getItem("xx-mu") as any | null;
    if (!data) return false; // handle the case when there's no data

    data = JSON.parse(data);
    const accessToken = data["tokens"]["token"].access.token;
    const thirdwebToken = data["tokens"]["token"].thirdWeb.token;

    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_SERVER_ENDPOINT + `/auth/isLoggedIn`,
        {
          params: {
            accessToken: accessToken,
            thirdwebToken: thirdwebToken,
          },
        }
      );

      setUserData(data.user);
      setIsLoggedIn(response.data);
      console.log("isLoggedIn", response.data);

      return response.data;
    } catch (error) {
      console.log("Error checking login status:", error);
      toast.error("Error checking login status:" + error);
      return false;
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Computed property to determine if connection should be allowed
  const isConnectionAllowed = Boolean(
    socketState.token && socketState.isConditionFulfilled
  );

  // Update the condition status
  const setConditionFulfilled = (value: boolean) => {
    setSocketState((prev) => ({
      ...prev,
      isConditionFulfilled: value,
    }));
  };

  const connect = (token: string) => {
    setSocketState((prev) => ({
      ...prev,
      token: token,
    }));
  };

  const disconnect = () => {
    if (socket) {
      disconnectSocket();

      setIsConnected(false);
      setSocketState((prev) => ({
        ...prev,
        token: null,
      }));
    }
  };

  // Effect to handle socket connection based on conditions
  useEffect(() => {
    if (!isConnectionAllowed) {
      // Disconnect socket if conditions are not met
      if (socket) {
        disconnect();
      }
      return;
    }

    // If all conditions are met, initialize socket
    try {
      const socketInstance = io({
        // serverUrl: "http://localhost:8088",
        // authToken: socketState.token!,

        auth: {
          token: socketState.token!,
        },
      });

      setSocket(socketInstance);

      socketInstance.on("connection", () => {
        setIsConnected(true);
        console.log("Socket connected via context");
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected via context");
      });

      socketInstance.on("connect_error", (error) => {
        console.log("Socket connection error:", error);
        setIsConnected(false);
      });

      socketInstance.on("unauthorized", (error) => {
        console.log("Unauthorized socket access:", error);
        disconnect();
      });

      // Cleanup function
      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } catch (error) {
      console.log("Failed to connect socket:", error);
      setIsConnected(false);
    }
  }, [isConnectionAllowed, socketState.token]);

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      console.log("Uploading file to IPFS...", file);
      // toast.success("Uploading file to IPFS...");
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
      toast.success("File uploaded to IPFS!");
      const subdomain = process.env.NEXT_PUBLIC_PINATA_SUBDOMAIN;
      if (!subdomain) {
        throw new Error("PINATA_SUBDOMAIN is not defined");
      }
      return `${subdomain}/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
      console.log("Error uploading to Pinata:", error);
      toast.error("Error uploading to Pinata");

      throw error;
    }
  };

  const createUser = async ({
    name,
    displayName,
    username,
    country,
    userType,
  }: ICreateUser): Promise<any> => {
    const userPayload = {
      method: "create_user",
      args: {
        name: name,
        displayName: displayName,
        username: username,
        country: country,
        userType: userType,
      },
    };

    try {
      const txhash = await signMessages(userPayload);

      console.log("txhash", txhash);
      console.log(`Transaction hash is: ${JSON.stringify(txhash)}`);
      return txhash;
    } catch (error) {
      console.log("Error creating user:", error);
      toast.error("Error creating user: \n" + error);
    }
  };
  const getUser = async (userId: number): Promise<any> => {
    const userPayload = {
      method: "get_user",
      args: {
        userId: userId,
      },
    };

    try {
      const txhash = await signMessages(userPayload);
      toast.success("User created successfully");
      console.log(`Transaction hash is: ${JSON.stringify(txhash)}`);
      return txhash;
    } catch (error) {
      console.log("Error creating user:", error);
      toast.error("Error creating user: \n" + error);
    }
  };

  const createGenre = async ({
    name,
    imageUrl,
    description,
  }: ICreateGenre): Promise<any> => {
    const genrePayload = {
      method: "create_genre",
      args: {
        name: name,
        imageUrl: imageUrl,
        description: description,
      },
    };

    try {
      const txhash = await signMessages(genrePayload);
      if (txhash) {
        console.log(`Transaction hash is: ${txhash}`);
        return txhash;
      }
    } catch (error) {
      console.log("Error creating genre:", error);
    }
  };

  const withdrawCTSI = async (amount: number): Promise<any> => {
    const genrePayload = {
      method: "withdraw_artist_vault",
      args: {
        amount,
      },
    };

    try {
      const txhash = await signMessages(genrePayload);

      console.log(`Transaction hash is: ${txhash}`);
      return txhash;
    } catch (error) {
      toast.error("Error withdrawing CTSI " + error);
      console.log("Error creating user:", error);
    }
  };

  const createSingleTrack = async ({
    title,
    duration,
    genreId,
    imageUrl,
    audioUrl,
    isrcCode,
    isPublished,
  }: ICreateTrack): Promise<any> => {
    const trackPayload = {
      method: "create_track",
      args: {
        title: title,
        duration: duration,
        genreId: genreId,
        imageUrl: imageUrl,
        audioUrl: audioUrl,
        isrcCode: isrcCode,
        isPublished: isPublished,
      },
    };

    try {
      const txhash = await signMessages(trackPayload);
      if (txhash) {
        // console.log(`Transaction hash is: ${txhash}`);
        toast.success("Track created successfully");
        return txhash;
      }
    } catch (error) {
      // console.log("Error creating user:", error);
      toast.error("Error creating user: \n" + error);
    }
  };

  const signMessages = async (message: any) => {
    console.log("signMessages", JSON.stringify(message));
    try {
      console.log("Signing message...", message);
      const { address, signature } = await signMessage({ data: message });
      console.log(`Address is: ${address}`);
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

      const provider = new Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(JSON.stringify(message));
      const address = await signer.getAddress();
      return { address, signature };
    } catch (err: any) {
      console.log("Error signing message:signMessage", err.message);
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
      console.log(
        "Error sending transaction:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <MelodiousContext.Provider
      value={{
        uploadToIPFS,
        signMessages,
        createUser,
        getUser,
        createGenre,
        createSingleTrack,
        withdrawCTSI,
        playing,
        setPlaying,
        socket,
        isConnected,
        isConnectionAllowed,
        connect,
        disconnect,
        setConditionFulfilled,
        userData,
        isLoggedIn,
        setUserData,
        checkLoginStatus,
        rollups,
        dappAddress,
      }}
    >
      {children}
    </MelodiousContext.Provider>
  );
};

export const useMelodiousContext = () => useContext(MelodiousContext);
