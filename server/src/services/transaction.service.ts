import { ethers } from "ethers";
import { IPayload } from "../interfaces";
import { config } from "../configs/config";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";

const addTransactionRequest = async (payload: IPayload) => {
  try {
    const signer = await verifyTransaction(payload);

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

const submitTransaction = async (tx: any) => {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

  try {
    const signer = new ethers.Wallet(config.privateKey, provider);

    const abi = [
      "function addInput( address appContract, bytes calldata payload) external returns (bytes32)",
    ];

    const cleanedPayload = JSON.parse(tx.data);

    console.log(`Tx is: ${JSON.stringify(cleanedPayload)}`);

    const txHex = await objectToHex(cleanedPayload);
    console.log(`Hex representation is: ${txHex}`);

    const contract = new ethers.Contract(config.inputboxAddress, abi, signer);

    console.log(`contract is: ${contract.address}`);

    const finalTx = contract.addInput(config.dappAddress, txHex);

    // const receipt = await finalTx.wait();

    console.log(`Transaction receipt is:`, JSON.stringify(await finalTx));

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
