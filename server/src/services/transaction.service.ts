import { ethers } from "ethers";
import { IPayload } from "../interfaces";
import { config } from "../configs/config";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { prisma, userService } from ".";
import { title } from "process";
import { getUserByUniqueValue } from "./user.service";
import { convertDurationToSeconds } from "../utils/helper";

const addTransactionRequest = async (payload: IPayload) => {
  try {
    const signer = await verifyTransaction(payload);

    console.log("verify Transaction", JSON.stringify(signer));

    if (signer !== payload.signer) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid signature");
    }

    const tx = await genarateTransaction(payload);
    const status = await submitTransaction(tx);

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

const submitTransaction = async (tx: { data: string; signer: string }) => {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

  try {
    const signer = new ethers.Wallet(config.privateKey, provider);

    const abi = [
      "function addInput( address appContract, bytes calldata payload) external returns (bytes32)",
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
    // console.log(`Transaction is complete: ${JSON.stringify(isTxComplete)}`);

    console.log(`Transaction hash is: ${isTxComplete.transactionHash}`);

    if (cleanedPayload.method === "create_track") {
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
    }

    return true;
  } catch (error) {
    // throw error;
    console.log(error);
    return false;
  }
};

const objectToHex = async (obj: any) => {
  const jsonString = JSON.stringify(obj);
  const buffer = Buffer.from(jsonString, "utf8");
  const hexString = "0x" + buffer.toString("hex");
  return hexString;
};

export { addTransactionRequest };
