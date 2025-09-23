import { ethers } from "ethers";
// import { ethers, JsonRpcProvider, JsonRpcSigner, ethers.utils.parseEther, Provider, toBigInt } from "ethers";
import { RollupsContracts } from "./hooks/useRollups";
import {
  IERC1155__factory,
  IERC20__factory,
  IERC721__factory,
  ERC721Portal__factory,
  ERC1155SinglePortal__factory,
} from "./generated/rollups";
import { Report } from "./hooks/useReports";
import { getVoucherWithProof, createUrqlClient } from "./VoucherService";
import { errorAlert, successAlert } from "@/lib/customAlert";
import { ApolloClient } from "@apollo/client";
import toast from "react-hot-toast";
import { TrackNFTABI } from "@/configs";

export const sendAddress = async (
  rollups: RollupsContracts | undefined,
  dappAddress: string
) => {
  if (rollups) {
    try {
      const relayTx = await rollups.relayContract.relayDAppAddress(dappAddress);
      const tx = await relayTx.wait(1);
      return tx.transactionHash;
    } catch (e) {
      console.log(`${e}`);
      return e;
    }
  }
};

export const addInput = async (
  rollups: RollupsContracts | undefined,
  jsonPayload: string,
  dappAddress: string
) => {
  if (rollups) {
    try {
      const payload = ethers.utils.toUtf8Bytes(jsonPayload);
      const tx = await rollups.inputContract.addInput(dappAddress, payload);
      const receipt = await tx?.wait();
      console.log(receipt?.transactionHash);
      return receipt;
    } catch (e) {
      console.log(`${e}`);
      return e;
    }
  }
};

export const depositEtherToPortal = async (
  rollups: RollupsContracts | undefined,
  signer: any,
  amount: number,
  dappAddress: string
) => {
  try {
    console.log(
      "Depositing ether",
      "rollups",
      rollups,
      "provider",
      signer,
      "amount",
      amount
    );
    const signerInstance = signer;
    const signerAddress = await signer?.getAddress();
    console.log("signerAddress", signerAddress);
    if (rollups && signerInstance) {
      const data = ethers.utils.toUtf8Bytes(`Deposited (${amount}) ether.`);
      const txOverrides = { value: ethers.utils.parseEther(`${amount}`) };
      console.log("Ether to deposit: ", txOverrides);

      const tx = await rollups.etherPortalContract.depositEther(
        dappAddress,
        data,
        txOverrides
      );
      const receipt = await tx.wait(1);
      console.log("receipt", receipt?.transactionHash);
      return receipt;
    }
  } catch (e: any) {
    console.log(`${e}`);
    return e;
  }
};

export const depositErc20ToVault = async (
  rollups: RollupsContracts | undefined,
  signer: any,
  token: string,
  amount: number,
  dappAddress: string
) => {
  try {
    // Input validation
    if (!rollups) throw new Error("Rollups contracts not initialized");
    if (!signer) throw new Error("Signer not provided");
    if (!token || !ethers.utils.isAddress(token))
      throw new Error("Invalid token address");
    if (!dappAddress || !ethers.utils.isAddress(dappAddress))
      throw new Error("Invalid DApp address");
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    console.log("Depositing to vault:", { token, amount, dappAddress });

    const signerAddress = await signer.getAddress();
    const amountInWei = ethers.utils.parseEther(`${amount}`);
    const erc20PortalAddress = rollups.erc20PortalContract.address;
    const tokenContract = IERC20__factory.connect(token, signer);

    console.log("Transaction details:", {
      signerAddress,
      erc20PortalAddress,
      amountInWei: amountInWei.toString(),
    });

    // Check user's token balance
    const userBalance = await tokenContract.balanceOf(signerAddress);
    if (userBalance.lt(amountInWei)) {
      throw new Error(
        `Insufficient balance. You have ${ethers.utils.formatEther(
          userBalance
        )} tokens, but trying to deposit ${amount}`
      );
    }

    // Check and handle token approval
    const currentAllowance = await tokenContract.allowance(
      signerAddress,
      erc20PortalAddress
    );
    if (currentAllowance.lt(amountInWei)) {
      console.log("Approving tokens...");
      const approveTx = await tokenContract.approve(
        erc20PortalAddress,
        amountInWei
      );
      console.log("Approval transaction submitted:", approveTx.hash);
      await approveTx.wait(1);
      console.log("Token approval confirmed");
    }

    // Create vault deposit payload
    const vaultPayload = JSON.stringify({
      method: "vault_deposit",
      args: { amount },
    });
    const data = ethers.utils.toUtf8Bytes(vaultPayload);

    // Execute deposit transaction
    console.log("Depositing tokens to vault...");
    const depositTx = await rollups.erc20PortalContract.depositERC20Tokens(
      token,
      dappAddress,
      amountInWei,
      data
    );
    console.log("Deposit transaction submitted:", depositTx.hash);
    const receipt = await depositTx.wait(1);
    console.log("Vault deposit confirmed:", receipt.transactionHash);

    // Send additional input
    console.log("Sending additional input...");
    const inputTx = await rollups.inputContract.addInput(dappAddress, data);
    console.log("Input transaction submitted:", inputTx.hash);
    const inputReceipt = await inputTx.wait(1);
    console.log("Input transaction confirmed:", inputReceipt.transactionHash);

    return { depositReceipt: receipt, inputReceipt };
  } catch (error: any) {
    console.error("Vault deposit error:", error);

    const errorMessage =
      error?.message ||
      error?.reason ||
      error?.data?.message ||
      "Unknown error occurred during vault deposit";
    const enhancedError = new Error(`Vault deposit failed: ${errorMessage}`);
    enhancedError.cause = error;

    throw enhancedError;
  }
};

export const depositErc20ToPortal = async (
  rollups: RollupsContracts | undefined,
  signer: any,
  token: string,
  amount: number,
  dappAddress: string
) => {
  try {
    // Input validation
    if (!rollups) {
      throw new Error("Rollups contracts not initialized");
    }
    if (!signer) {
      throw new Error("Signer not provided");
    }
    if (!token || !ethers.utils.isAddress(token)) {
      throw new Error("Invalid token address");
    }
    if (!dappAddress || !ethers.utils.isAddress(dappAddress)) {
      throw new Error("Invalid DApp address");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    console.log(
      "rollups",
      rollups,
      "signer",
      signer,
      "token",
      token,
      "amount",
      amount,
      "dappAddress",
      dappAddress
    );

    const signerAddress = await signer.getAddress();
    const amountInWei = ethers.utils.parseEther(`${amount}`);
    const erc20PortalAddress = rollups.erc20PortalContract.address;
    const tokenContract = IERC20__factory.connect(token, signer);

    console.log("signerAddress", signerAddress);
    console.log("erc20PortalAddress", erc20PortalAddress);
    console.log("amountInWei", amountInWei.toString());

    // Check user's token balance
    const userBalance = await tokenContract.balanceOf(signerAddress);
    console.log("userBalance", userBalance.toString());

    if (userBalance.lt(amountInWei)) {
      const balanceInEther = ethers.utils.formatEther(userBalance);
      throw new Error(
        `Insufficient token balance. You have ${balanceInEther} tokens but need ${amount} tokens.`
      );
    }

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(
      signerAddress,
      erc20PortalAddress
    );
    console.log("currentAllowance", currentAllowance.toString());

    // Approve tokens if allowance is insufficient
    if (amountInWei.gt(currentAllowance)) {
      console.log("Approving tokens for portal...");
      const approveTx = await tokenContract.approve(
        erc20PortalAddress,
        amountInWei
      );

      // Wait for approval transaction to be mined
      const approveReceipt = await approveTx.wait(1);
      if (!approveReceipt.status) {
        throw new Error("Token approval transaction failed");
      }
      console.log("Token approval successful", approveReceipt.transactionHash);
    }

    // Perform the deposit
    console.log("Depositing tokens to portal...");
    const deposit = await rollups.erc20PortalContract.depositERC20Tokens(
      token,
      dappAddress,
      amountInWei,
      "0x"
    );

    const transReceipt = await deposit.wait(1);
    if (!transReceipt.status) {
      throw new Error("Deposit transaction failed");
    }

    console.log("Deposit successful", transReceipt.transactionHash);
    return transReceipt;
  } catch (e: any) {
    console.log("depositErc20ToPortal error:", e);
    // Re-throw the error with a more user-friendly message if it's a generic error
    if (e.message && e.message.includes("user rejected")) {
      throw new Error("Transaction was rejected by user");
    }
    if (e.message && e.message.includes("insufficient funds")) {
      throw new Error("Insufficient ETH for gas fees");
    }
    throw e;
  }
};
// export const depositErc20ToPortal = async (
//   rollups: RollupsContracts | undefined,
//   provider: ethers.providers.JsonRpcProvider | undefined,
//   token: string,
//   amount: number,
//   dappAddress: string
// ) => {
//   try {
//     if (rollups && provider) {
//       const data = ethers.utils.toUtf8Bytes(
//         `Deposited (${amount}) of ERC20 (${token}).`
//       );
//       const signer = await provider.getSigner();
//       const signerAddress = await signer?.getAddress();

//       const erc20PortalAddress = rollups.erc20PortalContract.address;
//       const tokenContract = signer
//         ? IERC20__factory.connect(token, signer)
//         : IERC20__factory.connect(token, signer!);

//       console.log("signerAddress", signerAddress);
//       console.log("erc20PortalAddress", erc20PortalAddress);
//       // query current allowance
//       const currentAllowance = await tokenContract.allowance(
//         signerAddress!,
//         erc20PortalAddress
//       );
//       console.log("currentAllowance: ", currentAllowance.toString());
//       console.log(
//         "ethers.utils.parseEther(`${amount}`",
//         ethers.utils.parseEther(`${amount}`)
//       );
//       if (ethers.utils.parseEther(`${amount}`) > currentAllowance) {
//         // Allow portal to withdraw `amount` tokens from signer
//         const tx = await tokenContract.approve(
//           erc20PortalAddress,
//           ethers.utils.parseEther(`${amount}`)
//         );
//       }

//       console.log("token test", token);
//       const deposit = await rollups.erc20PortalContract.depositERC20Tokens(
//         token,
//         dappAddress,
//         ethers.utils.parseEther(`${amount}`),
//         "0x"
//       );
//       const transReceipt = await deposit.wait(1);
//       return transReceipt;
//     }
//   } catch (e) {
//     console.log(`${e}`);
//     return e;
//   }
// };

export const withdrawEther = async (
  rollups: RollupsContracts | undefined,
  provider: ethers.providers.JsonRpcProvider | undefined,
  amount: number,
  dappAddress: string
) => {
  try {
    if (rollups && provider) {
      const ether_amount = ethers.utils.parseEther(String(amount)).toString();
      console.log("ether after parsing: ", ether_amount);
      const input_obj = {
        method: "ether_withdraw",
        args: {
          amount: ether_amount,
        },
      };
      const data = JSON.stringify(input_obj);
      const payload = ethers.utils.toUtf8Bytes(data);
      console.log("dappAddress", dappAddress);
      const tx = await rollups.inputContract.addInput(dappAddress, payload);
      const receipt = await tx.wait(1);
      return receipt;
    }
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const withdrawErc20 = async (
  rollups: RollupsContracts | undefined,
  provider: ethers.providers.JsonRpcProvider | undefined,
  amount: number,
  address: string,
  dappAddress: string
) => {
  try {
    if (rollups && provider) {
      const erc20_amount = ethers.utils.parseEther(String(amount)).toString();
      console.log("erc20 after parsing: ", erc20_amount);
      const input_obj = {
        method: "erc20_withdraw",
        args: {
          erc20: address,
          amount: erc20_amount,
        },
      };
      const data = JSON.stringify(input_obj);
      const payload = ethers.utils.toUtf8Bytes(data);
      const tx = await rollups.inputContract.addInput(dappAddress, payload);
      const receipt = await tx.wait(1);
      return receipt;
    }
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const withdrawCTSIReward = async (
  rollups: RollupsContracts | undefined,
  amount: number,
  dappAddress: string
) => {
  try {
    if (rollups) {
      const input_obj = {
        method: "withdraw_reward",
        args: {
          amount,
        },
      };
      const data = JSON.stringify(input_obj);
      const payload = ethers.utils.toUtf8Bytes(data);
      const tx = await rollups.inputContract.addInput(dappAddress, payload);
      const receipt = await tx.wait(1);
      return receipt;
    }
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const withdrawErc721 = async (
  rollups: RollupsContracts | undefined,
  provider: ethers.providers.JsonRpcProvider | undefined,
  address: string,
  id: number,
  dappAddress: string
) => {
  try {
    if (rollups && provider) {
      const erc721_id = String(id);
      console.log("erc721 after parsing: ", erc721_id);
      const input_obj = {
        method: "erc721_withdraw",
        args: {
          erc721: address,
          token_id: id,
        },
      };
      const data = JSON.stringify(input_obj);
      const payload = ethers.utils.toUtf8Bytes(data);
      const tx = await rollups.inputContract.addInput(dappAddress, payload);
      const receipt = await tx.wait(1);
      return receipt;
    }
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const transferNftToPortal = async (
  rollups: RollupsContracts | undefined,
  provider: ethers.providers.JsonRpcProvider | undefined,
  contractAddress: string,
  nftid: number,
  dappAddress: string
) => {
  try {
    if (rollups && provider) {
      const data = ethers.utils.toUtf8Bytes(
        `Deposited (${nftid}) of ERC721 (${contractAddress}).`
      );
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const erc721PortalAddress = await rollups.erc721PortalContract.address;

      const tokenContract = signer
        ? IERC721__factory.connect(contractAddress, signer)
        : IERC721__factory.connect(contractAddress, signer);

      // query current approval
      const currentApproval = await tokenContract.getApproved(nftid);
      if (currentApproval !== erc721PortalAddress) {
        // Allow portal to withdraw `amount` tokens from signer
        const tx = await tokenContract.approve(erc721PortalAddress, nftid);
      }

      // Transfer
      const tx = await rollups.erc721PortalContract.depositERC721Token(
        contractAddress,
        dappAddress,
        nftid,
        "0x",
        data
      );

      const receipt = await tx.wait(1);
      return receipt;
    }
  } catch (e) {
    console.log(`${e}`);
    return e;
  }
};

export const transferErc1155SingleToPortal = async (
  rollups: RollupsContracts | undefined,
  provider: ethers.providers.JsonRpcProvider | undefined,
  contractAddress: string,
  id: number,
  amount: number,
  dappAddress: string
) => {
  try {
    if (rollups && provider) {
      const data = ethers.utils.toUtf8Bytes(
        `Deposited (${amount}) tokens from id (${id}) of ERC1155 (${contractAddress}).`
      );
      //const data = `Deposited ${args.amount} tokens (${args.token}) for DAppERC20Portal(${portalAddress}) (signer: ${address})`;
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const erc1155SinglePortalAddress = await rollups
        .erc1155SinglePortalContract.address;

      const tokenContract = signer
        ? IERC1155__factory.connect(contractAddress, signer)
        : IERC1155__factory.connect(contractAddress, signer);

      // query current approval
      const currentApproval = await tokenContract.isApprovedForAll(
        signerAddress,
        erc1155SinglePortalAddress
      );
      if (!currentApproval) {
        // Allow portal to withdraw `amount` tokens from signer
        const tx = await tokenContract.setApprovalForAll(
          erc1155SinglePortalAddress,
          true
        );
        const receipt = await tx.wait(1);
        const event = (
          await tokenContract.queryFilter(
            tokenContract.filters.ApprovalForAll(),
            receipt?.blockHash
          )
        ).pop();
        if (!event) {
          throw Error(
            `could set approval for DAppERC1155Portal(${erc1155SinglePortalAddress})  (signer: ${signerAddress}, tx: ${tx.hash})`
          );
        }
      }

      // Transfer
      const tx =
        await rollups.erc1155SinglePortalContract.depositSingleERC1155Token(
          contractAddress,
          dappAddress,
          id,
          amount,
          "0x",
          data
        );
      const receipt = await tx.wait(1);
      return receipt;
    }
  } catch (e) {
    console.log(`${e}`);
    return e;
  }
};

export const transferErc1155BatchToPortal = async (
  rollups: RollupsContracts | undefined,
  provider: ethers.providers.JsonRpcProvider | undefined,
  contractAddress: string,
  ids: number[],
  amounts: number[],
  dappAddress: string
) => {
  try {
    if (rollups && provider) {
      const data = ethers.utils.toUtf8Bytes(
        `Deposited (${amounts}) tokens from ids (${ids}) of ERC1155 (${contractAddress}).`
      );
      //const data = `Deposited ${args.amount} tokens (${args.token}) for DAppERC20Portal(${portalAddress}) (signer: ${address})`;
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const erc1155BatchPortalAddress = await rollups.erc1155BatchPortalContract
        .address;

      const tokenContract = signer
        ? IERC1155__factory.connect(contractAddress, signer)
        : IERC1155__factory.connect(contractAddress, signer);

      // query current approval
      const currentApproval = await tokenContract.isApprovedForAll(
        signerAddress,
        erc1155BatchPortalAddress
      );
      if (!currentApproval) {
        // Allow portal to withdraw `amount` tokens from signer
        const trans = await tokenContract.setApprovalForAll(
          erc1155BatchPortalAddress,
          true
        );
        const receipt = await trans.wait(1);
        const event = (
          await tokenContract.queryFilter(
            tokenContract.filters.ApprovalForAll(),
            receipt?.blockHash
          )
        ).pop();
        if (!event) {
          throw Error(
            `could set approval for DAppERC1155Portal(${erc1155BatchPortalAddress})  (signer: ${signerAddress}, tx: ${receipt?.transactionHash})`
          );
        }
      }

      // Transfer
      const tx =
        await rollups.erc1155BatchPortalContract.depositBatchERC1155Token(
          contractAddress,
          dappAddress,
          ids,
          amounts,
          "0x",
          data
        );
      const receipt = await tx.wait(1);
      return receipt;
    }
  } catch (e) {
    return e;
  }
};

export const executeVoucher = async (
  client: ApolloClient<any>,
  voucher: any,
  rollups: RollupsContracts
) => {
  console.log("rollups", rollups);
  // const client = createUrqlClient();
  console.log("voucher", voucher);

  try {
    if (!rollups) {
      toast.error("Could not execute voucher");
      return;
    }

    console.log("voucher.input.index", voucher.input.index);
    console.log("voucher.index", voucher.index);
    // ethers.BigNumber.from(voucher.input.index);
    const isExecuted = await rollups.dappContract.wasVoucherExecuted(
      BigInt(voucher.input.index),
      BigInt(voucher.index)
    );

    if (isExecuted) {
      toast.error("Fund already withdrawn");
      return;
    }

    console.log(
      "client",
      client,
      "voucher.index",
      voucher.index,
      "voucher.input.index",
      voucher.input.index
    );

    const voucherWithProof = await getVoucherWithProof(
      client,
      voucher.index,
      voucher.input.index
    );

    console.log("voucherWithProof", voucherWithProof);

    if (!voucherWithProof) {
      console.log("Failed to get voucher with proof");
      return { message: "Failed to get voucher with proof" };
    }

    // Enhanced proof validation to prevent ABI errors
    if (
      !voucherWithProof.proof ||
      !voucherWithProof.destination ||
      !voucherWithProof.payload
    ) {
      console.log("Voucher proof data incomplete:", {
        hasProof: !!voucherWithProof.proof,
        hasDestination: !!voucherWithProof.destination,
        hasPayload: !!voucherWithProof.payload,
      });
      return { message: "Voucher proof data incomplete" };
    }

    // Validate proof structure completeness to prevent 0x87332c01 ABI error
    const proof = voucherWithProof.proof;
    if (
      !proof.validity ||
      !proof.context ||
      proof.validity.inputIndexWithinEpoch === undefined ||
      proof.validity.outputIndexWithinInput === undefined ||
      !proof.validity.outputHashesRootHash ||
      !proof.validity.vouchersEpochRootHash ||
      !proof.validity.noticesEpochRootHash ||
      !proof.validity.machineStateHash ||
      !Array.isArray(proof.validity.outputHashInOutputHashesSiblings) ||
      !Array.isArray(proof.validity.outputHashesInEpochSiblings)
    ) {
      console.log("Proof structure incomplete - not ready for execution:", {
        hasValidity: !!proof.validity,
        hasContext: !!proof.context,
        hasInputIndexWithinEpoch:
          proof.validity?.inputIndexWithinEpoch !== undefined,
        hasOutputIndexWithinInput:
          proof.validity?.outputIndexWithinInput !== undefined,
        hasOutputHashesRootHash: !!proof.validity?.outputHashesRootHash,
        hasVouchersEpochRootHash: !!proof.validity?.vouchersEpochRootHash,
        hasNoticesEpochRootHash: !!proof.validity?.noticesEpochRootHash,
        hasMachineStateHash: !!proof.validity?.machineStateHash,
        hasOutputHashSiblings: Array.isArray(
          proof.validity?.outputHashInOutputHashesSiblings
        ),
        hasEpochSiblings: Array.isArray(
          proof.validity?.outputHashesInEpochSiblings
        ),
      });
      return {
        message:
          "Proof data not ready for execution. Please wait a moment and try again.",
        retryable: true,
      };
    }

    if (voucherWithProof) {
      console.log("Executing voucher with:", {
        destination: voucherWithProof.destination,
        payloadLength: voucherWithProof.payload?.length,
        hasProof: !!voucherWithProof.proof,
        proof: voucherWithProof.proof,
      });

      console.log(
        "Full proof object:",
        JSON.stringify(voucherWithProof.proof, null, 2)
      );

      // Convert proof structure to match contract expectations
      const formattedProof = {
        validity: {
          inputIndexWithinEpoch: ethers.BigNumber.from(
            voucherWithProof.proof.validity.inputIndexWithinEpoch
          ),
          outputIndexWithinInput: ethers.BigNumber.from(
            voucherWithProof.proof.validity.outputIndexWithinInput
          ),
          outputHashesRootHash:
            voucherWithProof.proof.validity.outputHashesRootHash,
          vouchersEpochRootHash:
            voucherWithProof.proof.validity.vouchersEpochRootHash,
          noticesEpochRootHash:
            voucherWithProof.proof.validity.noticesEpochRootHash,
          machineStateHash: voucherWithProof.proof.validity.machineStateHash,
          outputHashInOutputHashesSiblings:
            voucherWithProof.proof.validity.outputHashInOutputHashesSiblings,
          outputHashesInEpochSiblings:
            voucherWithProof.proof.validity.outputHashesInEpochSiblings,
        },
        context: voucherWithProof.proof.context,
      };

      console.log("Formatted proof:", formattedProof);

      try {
        const tx = await rollups.dappContract.executeVoucher(
          voucherWithProof.destination,
          voucherWithProof.payload,
          formattedProof
        );

        console.log("Transaction submitted:", tx.hash);
        const receipt = await tx.wait();

        if (receipt) {
          console.log("Voucher receipt", receipt);
          return {
            success: true,
            message: "Congratulations! Funds successfully withdrawn",
            txHash: tx.hash,
            receipt: receipt,
          };
        }

        if (!receipt) {
          console.log("No receipt received", receipt);
          return { message: "Could not execute voucher - no receipt" };
        }

        console.log("Voucher executed successfully", voucherWithProof);
        return {
          success: true,
          message: "Voucher executed successfully",
          txHash: tx.hash,
        };
      } catch (contractError) {
        console.log("Contract execution error:", contractError);

        // Check if it's an ABI error that might resolve on retry
        if (
          contractError &&
          typeof contractError === "object" &&
          "message" in contractError
        ) {
          const errorMessage = (contractError as any).message || "";
          if (
            errorMessage.includes("AbiErrorSignatureNotFoundError") ||
            errorMessage.includes("0x87332c01")
          ) {
            return {
              message: `AbiErrorSignatureNotFoundError: ${errorMessage}`,
              retryable: true,
            };
          }
        }

        throw contractError;
      }
    }
  } catch (e) {
    console.log("Error executing voucher:", e);
    errorAlert(`Could not execute voucher ${e}`);
    return e;
  }
};

export const executeVouchers = async (
  voucher: any,
  rollups: RollupsContracts
) => {
  console.log("executeVouchers", rollups, "voucher.proof    ", voucher.proof);
  if (rollups && !!voucher.proof) {
    console.log("Testing", voucher);

    const newVoucherToExecute = { ...voucher };
    try {
      const tx = await rollups.dappContract.executeVoucher(
        voucher.destination,
        voucher.payload,
        voucher.proof
      );
      const receipt = await tx.wait();
      newVoucherToExecute.msg = `voucher executed! (tx="${tx.hash}")`;
      if (receipt.events) {
        newVoucherToExecute.msg = `${
          newVoucherToExecute.msg
        } - resulting events: ${JSON.stringify(receipt.events)}`;
        newVoucherToExecute.executed =
          await rollups.dappContract.wasVoucherExecuted(
            ethers.BigNumber.from(voucher.input.index),
            ethers.BigNumber.from(voucher.index)
          );
      }
    } catch (e) {
      newVoucherToExecute.msg = `COULD NOT EXECUTE VOUCHER: ${JSON.stringify(
        e
      )}`;
      console.log(`COULD NOT EXECUTE VOUCHER: ${JSON.stringify(e)}`);
    }
  }
};

export const inspectCall = async (inspectUrl: string, endpoint: string) => {
  try {
    const result = await fetch(`${inspectUrl}/${endpoint}`);
    if (!result.ok) {
      toast.error("Network response was not ok");
      return;
    }
    const data = await result.json();
    const decode = data.reports.map((report: Report) => {
      return ethers.utils.toUtf8String(report.payload);
    });
    const reportData: any = JSON.parse(decode);
    return reportData;
  } catch (error) {
    console.log(error);
  }
};

// NFT Management Functions

// Mint Track NFT (ERC-721)
// Deposit Track NFT (ERC-721) to portal
export const depositTrackNFT = async (
  rollups: RollupsContracts | undefined,
  signer: any,
  nftContractAddress: string,
  tokenId: number,
  dappAddress: string
) => {
  try {
    // Input validation
    if (!rollups) throw new Error("Rollups contracts not initialized");
    if (!signer) throw new Error("Signer not provided");
    if (!nftContractAddress || !ethers.utils.isAddress(nftContractAddress))
      throw new Error("Invalid NFT contract address");
    if (!dappAddress || !ethers.utils.isAddress(dappAddress))
      throw new Error("Invalid DApp address");
    if (tokenId < 0) throw new Error("Invalid token ID");

    console.log("Depositing Track NFT:", {
      nftContractAddress,
      tokenId,
      dappAddress,
    });

    const signerAddress = await signer.getAddress();
    const nftContract = new ethers.Contract(
      nftContractAddress,
      TrackNFTABI,
      signer
    );
    const erc721PortalAddress = rollups.erc721PortalContract.address;

    // Check NFT ownership
    const owner = await nftContract.ownerOf(tokenId);
    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error("You don't own this NFT");
    }

    // Check and handle NFT approval
    const approvedAddress = await nftContract.getApproved(tokenId);
    if (approvedAddress.toLowerCase() !== erc721PortalAddress.toLowerCase()) {
      console.log("Approving NFT for portal...");
      const approveTx = await nftContract.approve(erc721PortalAddress, tokenId);
      console.log("NFT approval transaction submitted:", approveTx.hash);
      await approveTx.wait(1);
      console.log("NFT approval confirmed");
    }

    // Create deposit payload - using mint_track_nft route from backend
    const depositPayload = JSON.stringify({
      method: "mint_track_nft",
      args: {
        contractAddress: nftContractAddress,
        tokenId,
        timestamp: Math.floor(Date.now() / 1000),
      },
    });
    const baseLayerData = ethers.utils.toUtf8Bytes("");
    const execLayerData = ethers.utils.toUtf8Bytes(depositPayload);

    // Execute NFT deposit through portal
    console.log("Depositing NFT through portal...");
    const depositTx = await rollups.erc721PortalContract.depositERC721Token(
      nftContractAddress,
      dappAddress,
      tokenId,
      baseLayerData,
      execLayerData
    );
    console.log("NFT deposit transaction submitted:", depositTx.hash);
    const receipt = await depositTx.wait(1);
    console.log("NFT deposit confirmed:", receipt.transactionHash);

    return receipt;
  } catch (error: any) {
    console.error("NFT deposit error:", error);

    const errorMessage =
      error?.message ||
      error?.reason ||
      error?.data?.message ||
      "Unknown error occurred during NFT deposit";
    const enhancedError = new Error(`NFT deposit failed: ${errorMessage}`);
    enhancedError.cause = error;

    throw enhancedError;
  }
};

export const mintTrackNFTPortal = async (
  rollups: RollupsContracts | undefined,
  signer: any,
  nftContractAddress: string,
  trackId: string,
  ipfsHash: string,
  royaltyPercentage: number,
  dappAddress: string
) => {
  try {
    // Input validation
    if (!rollups) throw new Error("Rollups contracts not initialized");
    if (!signer) throw new Error("Signer not provided");
    if (!nftContractAddress || !ethers.utils.isAddress(nftContractAddress))
      throw new Error("Invalid NFT contract address");
    if (!dappAddress || !ethers.utils.isAddress(dappAddress))
      throw new Error("Invalid DApp address");
    if (!trackId) throw new Error("Track ID cannot be empty");
    if (!ipfsHash || ipfsHash.trim() === "")
      throw new Error("IPFS hash cannot be empty");
    if (royaltyPercentage < 0 || royaltyPercentage > 100)
      throw new Error("Royalty percentage must be between 0 and 100");

    console.log("Minting Track NFT:", {
      nftContractAddress,
      trackId,
      ipfsHash,
      royaltyPercentage,
    });

    const signerAddress = await signer.getAddress();
    const nftContract = new ethers.Contract(
      nftContractAddress,
      TrackNFTABI,
      signer
    );
    const erc721PortalAddress = rollups.erc721PortalContract.address;

    console.log("Transaction details:", {
      signerAddress,
      erc721PortalAddress,
      nftContractAddress,
    });

    // Check if contract is approved for all tokens or set approval
    const isApprovedForAll = await nftContract.isApprovedForAll(
      signerAddress,
      erc721PortalAddress
    );

    if (!isApprovedForAll) {
      console.log("Setting approval for all NFTs...");
      const approveTx = await nftContract.setApprovalForAll(
        erc721PortalAddress,
        true
      );
      console.log("Approval transaction submitted:", approveTx.hash);
      await approveTx.wait(1);
      console.log("NFT approval confirmed");
    }

    // Create mint payload for ERC721 portal
    const mintPayload = JSON.stringify({
      method: "mint_track_nft", // Use backend NFT route
      args: {
        walletAddress: signerAddress,
        trackId,
        ipfsHash,
        royaltyPercentage,
        timestamp: Math.floor(Date.now() / 1000),
      },
    });
    const data = ethers.utils.toUtf8Bytes(mintPayload);

    // Get tokenId from total supply
    const totalSupply = await nftContract.totalSupply();
    const tokenId = totalSupply.add(1).toNumber();

    console.log("totalSupply", totalSupply);
    console.log("Token ID to be minted:", tokenId);

    // Deposit NFT through ERC721 portal before adding input
    console.log("Depositing NFT through ERC721 portal...");
    // const depositTx = await rollups.erc721PortalContract.depositERC721Token(
    //   nftContractAddress,
    //   dappAddress,
    //   tokenId,
    //   "0x",
    //   data
    // );
    // console.log("ERC721 deposit transaction submitted:", depositTx.hash);
    // await depositTx.wait(1);
    console.log("ERC721 deposit confirmed");

    // Send mint request through input contract (backend will emit voucher)
    console.log("Processing mint request...");
    const mintTx = await rollups.inputContract.addInput(dappAddress, data);
    console.log("Mint transaction submitted:", mintTx.hash);
    const receipt = await mintTx.wait(1);
    console.log("Mint confirmed:", receipt.transactionHash);

    return receipt;
  } catch (error: any) {
    console.error("Track NFT mint error:", error);

    const errorMessage =
      error?.message ||
      error?.reason ||
      error?.data?.message ||
      "Unknown error occurred during Track NFT minting";
    const enhancedError = new Error(`Track NFT mint failed: ${errorMessage}`);
    enhancedError.cause = error;

    throw enhancedError;
  }
};

// Keep the original function for backward compatibility
export const mintTrackNFT = async (
  rollups: RollupsContracts | undefined,
  dappAddress: string,
  trackId: string,
  ipfsHash: string,
  royaltyPercentage: number,
  walletAddress?: string // Optional wallet address, defaults to signer if not provided
) => {
  try {
    if (!rollups) {
      throw new Error("Rollups contracts not available");
    }

    // Input validation to match backend and smart contract expectations
    if (!trackId) {
      throw new Error("Track ID cannot be empty");
    }
    if (!ipfsHash || ipfsHash.trim() === "") {
      throw new Error("IPFS hash cannot be empty");
    }
    if (royaltyPercentage < 0 || royaltyPercentage > 100) {
      throw new Error("Royalty percentage must be between 0 and 100");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    // Backend expects: walletAddress, trackId, ipfsHash, royaltyPercentage
    const payload = {
      method: "mint_track_nft", // Use backend NFT route
      args: {
        walletAddress: walletAddress, // Backend will use msg.sender if not provided
        trackId,
        ipfsHash,
        royaltyPercentage,
        timestamp,
      },
    };

    const jsonPayload = JSON.stringify(payload);
    const data = ethers.utils.toUtf8Bytes(jsonPayload);

    const tx = await rollups.inputContract.addInput(dappAddress, data);
    const receipt = await tx.wait(1);

    console.log("Track NFT minting transaction:", receipt.transactionHash);
    return receipt;
  } catch (error) {
    console.error("Error minting Track NFT:", error);
    throw error;
  }
};

// Purchase Artist Tokens (ERC-1155) through portal with payment
export const purchaseArtistTokensPortal = async (
  rollups: RollupsContracts | undefined,
  signer: any,
  nftContractAddress: string,
  trackId: string, // Changed from tokenId to trackId to match backend expectations
  amount: number,
  paymentTokenAddress: string,
  totalPayment: string,
  dappAddress: string
) => {
  try {
    // Input validation
    if (!rollups) throw new Error("Rollups contracts not initialized");
    if (!signer) throw new Error("Signer not provided");
    if (!nftContractAddress || !ethers.utils.isAddress(nftContractAddress))
      throw new Error("Invalid NFT contract address");
    if (!paymentTokenAddress || !ethers.utils.isAddress(paymentTokenAddress))
      throw new Error("Invalid payment token address");
    if (!dappAddress || !ethers.utils.isAddress(dappAddress))
      throw new Error("Invalid DApp address");
    if (!trackId || trackId.trim() === "") throw new Error("Invalid track ID");
    if (amount <= 0) throw new Error("Amount must be greater than 0");
    if (!totalPayment || ethers.BigNumber.from(totalPayment).lte(0))
      throw new Error("Invalid payment amount");

    console.log("Purchasing Artist Tokens:", {
      nftContractAddress,
      trackId,
      amount,
      totalPayment,
    });

    const signerAddress = await signer.getAddress();
    const paymentToken = IERC20__factory.connect(paymentTokenAddress, signer);
    const paymentAmount = ethers.BigNumber.from(totalPayment);

    // Check payment token balance
    const balance = await paymentToken.balanceOf(signerAddress);
    if (balance.lt(paymentAmount)) {
      throw new Error(
        `Insufficient balance. Required: ${ethers.utils.formatEther(
          paymentAmount
        )}, Available: ${ethers.utils.formatEther(balance)}`
      );
    }

    // Handle payment token approval and deposit
    const currentAllowance = await paymentToken.allowance(
      signerAddress,
      rollups.erc20PortalContract.address
    );
    if (currentAllowance.lt(paymentAmount)) {
      console.log("Approving payment tokens...");
      const approveTx = await paymentToken.approve(
        rollups.erc20PortalContract.address,
        paymentAmount
      );
      console.log("Payment approval transaction submitted:", approveTx.hash);
      await approveTx.wait(1);
      console.log("Payment approval confirmed");
    }

    // Deposit payment tokens first
    console.log("Depositing payment tokens...");
    const paymentPayload = JSON.stringify({
      method: "erc20_deposit", // Use backend portal route name
      args: {
        trackId,
        amount,
        paymentAmount: totalPayment,
        timestamp: Math.floor(Date.now() / 1000),
      },
    });
    const paymentData = ethers.utils.toUtf8Bytes(paymentPayload);
    const paymentTx = await rollups.erc20PortalContract.depositERC20Tokens(
      paymentTokenAddress,
      dappAddress,
      paymentAmount,
      paymentData
    );
    console.log("Payment deposit transaction submitted:", paymentTx.hash);
    await paymentTx.wait(1);
    console.log("Payment deposit confirmed");

    // Create purchase payload - backend expects buyerAddress, trackId, amount, totalPrice
    const purchasePayload = JSON.stringify({
      method: "purchase_artist_tokens", // Use backend NFT route
      args: {
        buyerAddress: signerAddress,
        trackId: trackId,
        amount: amount,
        totalPrice: parseFloat(ethers.utils.formatEther(totalPayment)),
        timestamp: Math.floor(Date.now() / 1000),
      },
    });
    const data = ethers.utils.toUtf8Bytes(purchasePayload);

    // Send purchase request through input contract (backend will emit voucher)
    console.log("Processing purchase request...");
    const purchaseTx = await rollups.inputContract.addInput(dappAddress, data);
    console.log("Purchase transaction submitted:", purchaseTx.hash);
    const receipt = await purchaseTx.wait(1);
    console.log("Purchase confirmed:", receipt.transactionHash);

    return receipt;
  } catch (error: any) {
    console.error("Artist tokens purchase error:", error);

    const errorMessage =
      error?.message ||
      error?.reason ||
      error?.data?.message ||
      "Unknown error occurred during artist tokens purchase";
    const enhancedError = new Error(
      `Artist tokens purchase failed: ${errorMessage}`
    );
    enhancedError.cause = error;

    throw enhancedError;
  }
};

// Mint Artist Tokens (ERC-1155)
export const mintArtistTokens = async (
  rollups: RollupsContracts | undefined,
  dappAddress: string,
  trackId: string,
  amount: number,
  pricePerToken: number,
  walletAddress?: string // Optional wallet address, defaults to signer if not provided
) => {
  try {
    if (!rollups) {
      throw new Error("Rollups contracts not available");
    }

    // Input validation to match backend expectations
    if (!trackId) {
      throw new Error("Track ID cannot be empty");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (pricePerToken <= 0) {
      throw new Error("Price per token must be greater than 0");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    // Backend expects: walletAddress, trackId, amount, pricePerToken
    const payload = {
      method: "mint_artist_tokens", // Use backend NFT route
      args: {
        walletAddress,
        trackId,
        amount,
        pricePerToken,
        timestamp,
      },
    };

    const jsonPayload = JSON.stringify(payload);
    const data = ethers.utils.toUtf8Bytes(jsonPayload);

    const tx = await rollups.inputContract.addInput(dappAddress, data);
    const receipt = await tx.wait(1);

    console.log("Artist Tokens minting transaction:", receipt.transactionHash);
    return receipt;
  } catch (error) {
    console.error("Error minting Artist Tokens:", error);
    throw error;
  }
};

// Purchase Artist Tokens
// Legacy function - use purchaseArtistTokensPortal for new implementations
export const purchaseArtistTokens = async (
  rollups: RollupsContracts | undefined,
  dappAddress: string,
  tokenId: number,
  amount: number,
  totalPrice: number
) => {
  try {
    if (!rollups) {
      throw new Error("Rollups contracts not available");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      method: "purchase_artist_tokens",
      args: {
        tokenId,
        amount,
        totalPrice,
        timestamp,
      },
    };

    const jsonPayload = JSON.stringify(payload);
    const data = ethers.utils.toUtf8Bytes(jsonPayload);

    const tx = await rollups.inputContract.addInput(dappAddress, data);
    const receipt = await tx.wait(1);

    console.log("Artist Tokens purchase transaction:", receipt.transactionHash);
    return receipt;
  } catch (error) {
    console.error("Error purchasing Artist Tokens:", error);
    throw error;
  }
};

// Transfer Track NFT (ERC-721) through portal
export const transferTrackNFTPortal = async (
  rollups: RollupsContracts | undefined,
  signer: any,
  nftContractAddress: string,
  tokenId: number,
  toAddress: string,
  dappAddress: string
) => {
  try {
    // Input validation
    if (!rollups) throw new Error("Rollups contracts not initialized");
    if (!signer) throw new Error("Signer not provided");
    if (!nftContractAddress || !ethers.utils.isAddress(nftContractAddress))
      throw new Error("Invalid NFT contract address");
    if (!toAddress || !ethers.utils.isAddress(toAddress))
      throw new Error("Invalid recipient address");
    if (!dappAddress || !ethers.utils.isAddress(dappAddress))
      throw new Error("Invalid DApp address");
    if (tokenId < 0) throw new Error("Invalid token ID");

    console.log("Transferring Track NFT:", {
      nftContractAddress,
      tokenId,
      toAddress,
    });

    const signerAddress = await signer.getAddress();
    const nftContract = IERC721__factory.connect(nftContractAddress, signer);
    const erc721PortalAddress = rollups.erc721PortalContract.address;

    // Check NFT ownership
    const owner = await nftContract.ownerOf(tokenId);
    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error("You don't own this NFT");
    }

    // Handle NFT approval for portal
    const approvedAddress = await nftContract.getApproved(tokenId);
    if (approvedAddress.toLowerCase() !== erc721PortalAddress.toLowerCase()) {
      console.log("Approving NFT for portal...");
      const approveTx = await nftContract.approve(erc721PortalAddress, tokenId);
      console.log("NFT approval transaction submitted:", approveTx.hash);
      await approveTx.wait(1);
      console.log("NFT approval confirmed");
    }

    // Create transfer payload - using backend portal route
    const transferPayload = JSON.stringify({
      method: "erc721_deposit",
      args: {
        contractAddress: nftContractAddress,
        tokenId,
        toAddress,
        timestamp: Math.floor(Date.now() / 1000),
      },
    });
    const baseLayerData = ethers.utils.toUtf8Bytes("");
    const execLayerData = ethers.utils.toUtf8Bytes(transferPayload);

    // Execute transfer through portal
    console.log("Transferring NFT through portal...");
    const transferTx = await rollups.erc721PortalContract.depositERC721Token(
      nftContractAddress,
      dappAddress,
      tokenId,
      baseLayerData,
      execLayerData
    );
    console.log("NFT transfer transaction submitted:", transferTx.hash);
    const receipt = await transferTx.wait(1);
    console.log("NFT transfer confirmed:", receipt.transactionHash);

    return receipt;
  } catch (error: any) {
    console.error("NFT transfer error:", error);

    const errorMessage =
      error?.message ||
      error?.reason ||
      error?.data?.message ||
      "Unknown error occurred during NFT transfer";
    const enhancedError = new Error(`NFT transfer failed: ${errorMessage}`);
    enhancedError.cause = error;

    throw enhancedError;
  }
};

// Legacy Transfer Track NFT (ERC-721) - use transferTrackNFTPortal for new implementations
export const transferTrackNFT = async (
  rollups: RollupsContracts | undefined,
  dappAddress: string,
  tokenId: number,
  toAddress: string
) => {
  try {
    if (!rollups) {
      throw new Error("Rollups contracts not available");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      method: "transfer_track_nft",
      args: {
        tokenId,
        toAddress,
        timestamp,
      },
    };

    const jsonPayload = JSON.stringify(payload);
    const data = ethers.utils.toUtf8Bytes(jsonPayload);

    const tx = await rollups.inputContract.addInput(dappAddress, data);
    const receipt = await tx.wait(1);

    console.log("Track NFT transfer transaction:", receipt.transactionHash);
    return receipt;
  } catch (error) {
    console.error("Error transferring Track NFT:", error);
    throw error;
  }
};

// Transfer Artist Tokens (ERC-1155) through portal
export const transferArtistTokensPortal = async (
  rollups: RollupsContracts | undefined,
  signer: any,
  nftContractAddress: string,
  tokenId: number,
  toAddress: string,
  amount: number,
  dappAddress: string
) => {
  try {
    // Input validation
    if (!rollups) throw new Error("Rollups contracts not initialized");
    if (!signer) throw new Error("Signer not provided");
    if (!nftContractAddress || !ethers.utils.isAddress(nftContractAddress))
      throw new Error("Invalid NFT contract address");
    if (!toAddress || !ethers.utils.isAddress(toAddress))
      throw new Error("Invalid recipient address");
    if (!dappAddress || !ethers.utils.isAddress(dappAddress))
      throw new Error("Invalid DApp address");
    if (tokenId < 0) throw new Error("Invalid token ID");
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    console.log("Transferring Artist Tokens:", {
      nftContractAddress,
      tokenId,
      toAddress,
      amount,
    });

    const signerAddress = await signer.getAddress();
    const nftContract = IERC1155__factory.connect(nftContractAddress, signer);
    const erc1155PortalAddress = rollups.erc1155SinglePortalContract.address;

    // Check token balance
    const balance = await nftContract.balanceOf(signerAddress, tokenId);
    if (balance.lt(amount)) {
      throw new Error(
        `Insufficient token balance. Required: ${amount}, Available: ${balance.toString()}`
      );
    }

    // Handle token approval for portal
    const isApproved = await nftContract.isApprovedForAll(
      signerAddress,
      erc1155PortalAddress
    );
    if (!isApproved) {
      console.log("Approving tokens for portal...");
      const approveTx = await nftContract.setApprovalForAll(
        erc1155PortalAddress,
        true
      );
      console.log("Token approval transaction submitted:", approveTx.hash);
      await approveTx.wait(1);
      console.log("Token approval confirmed");
    }

    // Create transfer payload - using backend portal route
    const transferPayload = JSON.stringify({
      method: "erc1155_deposit",
      args: {
        contractAddress: nftContractAddress,
        tokenId,
        toAddress,
        amount,
        timestamp: Math.floor(Date.now() / 1000),
      },
    });
    const baseLayerData = ethers.utils.toUtf8Bytes("");
    const execLayerData = ethers.utils.toUtf8Bytes(transferPayload);

    // Execute transfer through portal
    console.log("Transferring tokens through portal...");
    const transferTx =
      await rollups.erc1155SinglePortalContract.depositSingleERC1155Token(
        nftContractAddress,
        dappAddress,
        tokenId,
        amount,
        baseLayerData,
        execLayerData
      );
    console.log("Token transfer transaction submitted:", transferTx.hash);
    const receipt = await transferTx.wait(1);
    console.log("Token transfer confirmed:", receipt.transactionHash);

    return receipt;
  } catch (error: any) {
    console.error("Artist tokens transfer error:", error);

    const errorMessage =
      error?.message ||
      error?.reason ||
      error?.data?.message ||
      "Unknown error occurred during token transfer";
    const enhancedError = new Error(
      `Artist tokens transfer failed: ${errorMessage}`
    );
    enhancedError.cause = error;

    throw enhancedError;
  }
};

// Legacy Transfer Artist Tokens (ERC-1155) - use transferArtistTokensPortal for new implementations
export const transferArtistTokens = async (
  rollups: RollupsContracts | undefined,
  dappAddress: string,
  tokenId: number,
  toAddress: string,
  amount: number
) => {
  try {
    if (!rollups) {
      throw new Error("Rollups contracts not available");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      method: "transfer_artist_tokens",
      args: {
        tokenId,
        toAddress,
        amount,
        timestamp,
      },
    };

    const jsonPayload = JSON.stringify(payload);
    const data = ethers.utils.toUtf8Bytes(jsonPayload);

    const tx = await rollups.inputContract.addInput(dappAddress, data);
    const receipt = await tx.wait(1);

    console.log("Artist Tokens transfer transaction:", receipt.transactionHash);
    return receipt;
  } catch (error) {
    console.error("Error transferring Artist Tokens:", error);
    throw error;
  }
};
