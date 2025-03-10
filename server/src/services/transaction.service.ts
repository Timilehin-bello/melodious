import { ethers } from "ethers";
import { IPayload } from "../interfaces";
import { config } from "../configs/config";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { prisma, userService } from ".";
import { title } from "process";
import { getUserByUniqueValue } from "./user.service";
import { convertDurationToSeconds } from "../utils/helper";
import { IMethodHandlers, ITransaction, ITransactionPayload } from "../types";

const addTransactionRequest = async (payload: IPayload) => {
  try {
    const signer = await verifyTransaction(payload);

    console.log("verify Transaction", JSON.stringify(signer));

    if (signer !== payload.signer) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid signature");
    }

    const tx = await genarateTransaction(payload);
    const status = await submitTransaction(tx);
    console.log("status", status);

    return status;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const verifyTransaction = async (payload: IPayload) => {
  console.log(`payload is: ${JSON.stringify(payload.message)}`);

  try {
    const realSigner = await ethers.utils.verifyMessage(
      payload.message,
      payload.signature
    );

    return realSigner;
  } catch (err) {
    console.log(err);
  }
};

const genarateTransaction = async (payload: IPayload) => {
  try {
    const newTx = {
      data: JSON.stringify(JSON.parse(payload.message).data),
      signer: payload.signer,
    };
    return newTx;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// const submitTransaction = async (tx: { data: string; signer: string }) => {
//   const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

//   try {
//     const signer = new ethers.Wallet(config.privateKey, provider);

//     const abi = [
//       "function addInput( address appContract, bytes calldata payload) external returns (bytes32)",
//     ];

//     const cleanedPayload = JSON.parse(tx.data);

//     console.log(`method is: ${cleanedPayload.method}`);

//     console.log(`Tx is cleaned: ${JSON.stringify(cleanedPayload)}`);

//     const parsedObject = JSON.parse(JSON.stringify(tx));

//     cleanedPayload.args.signer = parsedObject.signer;

//     const txHex = await objectToHex(cleanedPayload);
//     console.log(`Hex representation is: ${txHex}`);

//     const contract = new ethers.Contract(config.inputboxAddress, abi, signer);

//     console.log(`contract is: ${contract.address}`);

//     const finalTx = await contract.addInput(config.dappAddress, txHex);
//     const isTxComplete = await finalTx.wait();
//     // console.log(`Transaction is complete: ${JSON.stringify(isTxComplete)}`);

//     console.log(`Transaction hash is: ${isTxComplete.transactionHash}`);

//     if (cleanedPayload.method === "create_track") {
//       const durationToSecond = convertDurationToSeconds(
//         cleanedPayload.args.duration
//       );
//       console.log(`Duration in seconds is: ${durationToSecond}`);
//       const user = await userService.getUserByUniqueValue(
//         {
//           walletAddress: tx.signer.toLowerCase(),
//         },
//         { artist: true }
//       );

//       if (!user || !user.artist) {
//         throw new ApiError(httpStatus.NOT_FOUND, "Artist not found");
//       }

//       if (!user || !user.artist) {
//         throw new ApiError(httpStatus.NOT_FOUND, "Artist not found");
//       }
//       const createTrack = await prisma.track.create({
//         data: {
//           title: cleanedPayload.args.title,
//           artistId: user.artist.id,
//           duration: durationToSecond,
//         },
//       });

//       console.log(`Track is created: ${JSON.stringify(createTrack)}`);
//     }

//     return isTxComplete;
//   } catch (error) {
//     // throw error;
//     console.log(error);
//     return false;
//   }
// };

const submitTransaction = async (tx: { data: string; signer: string }) => {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

  try {
    const signer = new ethers.Wallet(config.privateKey, provider);

    const abi = [
      "function addInput(address appContract, bytes calldata payload) external returns (bytes32)",
    ];

    const cleanedPayload = JSON.parse(tx.data);
    console.log(`method is: ${cleanedPayload.method}`);
    console.log(`Tx is cleaned: ${JSON.stringify(cleanedPayload)}`);

    const parsedObject = JSON.parse(JSON.stringify(tx));
    cleanedPayload.args.signer = parsedObject.signer;

    const txHex = await objectToHex(cleanedPayload);
    console.log(`Hex representation is: ${txHex}`);

    const contract = new ethers.Contract(config.inputboxAddress, abi, signer);
    console.log(`contract is: ${contract.address}`);

    const finalTx = await contract.addInput(config.dappAddress, txHex);
    const isTxComplete = await finalTx.wait();
    console.log(`Transaction hash is: ${isTxComplete.transactionHash}`);

    // Process the payload based on its method
    const serverResponse = await processTransactionPayload(cleanedPayload, tx);

    return {
      isTxComplete,
      serverResponse,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
};

const signMessages = async (message: any) => {
  console.log("signMessages", JSON.stringify(message));
  try {
    console.log("Signing message...", message);
    const { address, signature } = await signMessage({ data: message });
    console.log(`Address is: ${address}`);
    const finalPayload = createMessage(message, address, signature);
    const realSigner = ethers.utils.verifyMessage(
      finalPayload.message,
      finalPayload.signature
    );
    console.log(`Realsigner is: ${realSigner}`);
    console.log("final payload", finalPayload);
    const txhash = await addTransactionRequest(finalPayload);
    return txhash;
  } catch (err: any) {
    console.log(err.message);
  }
};

const signMessage = async (
  message: any
): Promise<{ address: string; signature: string }> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const signer = new ethers.Wallet(config.privateKey, provider);
    const signature = await signer.signMessage(JSON.stringify(message));
    const address = await signer.getAddress();
    return { address, signature };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createMessage = (new_data: any, signer: any, signature: any) => {
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

const objectToHex = async (obj: any) => {
  const jsonString = JSON.stringify(obj);
  const buffer = Buffer.from(jsonString, "utf8");
  const hexString = "0x" + buffer.toString("hex");
  return hexString;
};

const methodHandlers: IMethodHandlers = {
  create_track: async (
    cleanedPayload: any,
    tx: { data: string; signer: string }
  ) => {
    const durationToSecond = convertDurationToSeconds(
      cleanedPayload.args.duration
    );
    console.log(`Duration in seconds is: ${durationToSecond}`);

    const user = await userService.getUserByUniqueValue(
      {
        walletAddress: tx.signer.toLowerCase(),
      },
      { artist: true }
    );

    if (!user || !user.artist) {
      throw new ApiError(httpStatus.NOT_FOUND, "Artist not found");
    }

    const createTrack = await prisma.track.create({
      data: {
        title: cleanedPayload.args.title,
        artistId: user.artist.id,
        duration: durationToSecond,
      },
    });

    console.log(`Track is created: ${JSON.stringify(createTrack)}`);
    return createTrack;
  },
  create_user: async (
    cleanedPayload: any,
    tx: { data: string; signer: string }
  ) => {
    const createUser = await userService.createUser({
      walletAddress: tx.signer.toLowerCase(),
      userType: cleanedPayload.args.userType,
    });

    console.log(
      `User with type ${
        cleanedPayload.args.userType
      } is created: ${JSON.stringify(createUser)}`
    );
    return createUser;
  },
};

const processTransactionPayload = async (
  cleanedPayload: ITransactionPayload,
  tx: ITransaction
): Promise<any> => {
  const method = cleanedPayload.method;
  console.log(`Processing method: ${method}`);

  if (methodHandlers[method]) {
    return await methodHandlers[method](cleanedPayload, tx);
  }

  // If no handler exists for the method
  console.log(`No handler found for method: ${method}`);
  return null;
};

export { addTransactionRequest, signMessages };
