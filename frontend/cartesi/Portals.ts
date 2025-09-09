import { ethers } from "ethers";
// import { ethers, JsonRpcProvider, JsonRpcSigner, ethers.utils.parseEther, Provider, toBigInt } from "ethers";
import { RollupsContracts } from "./hooks/useRollups";
import {
  IERC1155__factory,
  IERC20__factory,
  IERC721__factory,
} from "./generated/rollups";
import { Report } from "./hooks/useReports";
import { getVoucherWithProof, createUrqlClient } from "./VoucherService";
import { errorAlert, successAlert } from "@/lib/customAlert";
import { ApolloClient } from "@apollo/client";
import toast from "react-hot-toast";

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
      "Depositing to vault:",
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
      throw new Error(
        `Insufficient balance. You have ${ethers.utils.formatEther(
          userBalance
        )} tokens, but trying to deposit ${amount}`
      );
    }

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(
      signerAddress,
      erc20PortalAddress
    );
    console.log("currentAllowance", currentAllowance.toString());

    // Approve tokens if needed
    if (currentAllowance.lt(amountInWei)) {
      console.log("Approving tokens...");
      try {
        const approveTx = await tokenContract.approve(
          erc20PortalAddress,
          amountInWei
        );
        console.log("Approval transaction submitted:", approveTx.hash);
        const approveReceipt = await approveTx.wait(1);
        console.log(
          "Approval transaction confirmed:",
          approveReceipt.transactionHash
        );
      } catch (approveError: any) {
        console.error("Token approval failed:", approveError);
        throw new Error(
          `Token approval failed: ${approveError?.message || approveError}`
        );
      }
    }

    // Create vault deposit payload matching backend expected format
    const vaultPayload = JSON.stringify({
      method: "vault_deposit",
      args: {
        amount: amount,
      },
    });

    const data = ethers.utils.toUtf8Bytes(vaultPayload);

    // Deposit tokens to portal with vault payload
    console.log("Depositing tokens to vault...");
    console.log("Deposit parameters:", {
      token,
      dappAddress,
      amount: amountInWei.toString(),
      dataLength: data.length,
    });

    let depositTx;
    try {
      depositTx = await rollups.erc20PortalContract.depositERC20Tokens(
        token,
        dappAddress,
        amountInWei,
        data
      );
      console.log("Deposit transaction submitted:", depositTx.hash);
    } catch (depositError: any) {
      console.error("ERC20 portal deposit failed:", depositError);
      throw new Error(
        `ERC20 portal deposit failed: ${depositError?.message || depositError}`
      );
    }

    let receipt;
    try {
      receipt = await depositTx.wait(1);
      console.log(
        "Vault deposit transaction confirmed:",
        receipt.transactionHash
      );
    } catch (receiptError: any) {
      console.error("Deposit transaction confirmation failed:", receiptError);
      throw new Error(
        `Deposit transaction confirmation failed: ${
          receiptError?.message || receiptError
        }`
      );
    }

    // Send additional input after ERC20 portal deposit
    console.log("Sending additional input after deposit...");

    let inputTx;
    try {
      inputTx = await rollups.inputContract.addInput(dappAddress, data);
      console.log("Input transaction submitted:", inputTx.hash);
    } catch (inputError: any) {
      console.error("Add input failed:", inputError);
      throw new Error(`Add input failed: ${inputError?.message || inputError}`);
    }

    let inputReceipt;
    try {
      inputReceipt = await inputTx.wait(1);
      console.log("Input transaction confirmed:", inputReceipt.transactionHash);
    } catch (inputReceiptError: any) {
      console.error(
        "Input transaction confirmation failed:",
        inputReceiptError
      );
      throw new Error(
        `Input transaction confirmation failed: ${
          inputReceiptError?.message || inputReceiptError
        }`
      );
    }

    return { depositReceipt: receipt, inputReceipt };
  } catch (e: any) {
    console.error("Vault deposit error:", e);

    // Provide more detailed error information
    let errorMessage = "Unknown error occurred during vault deposit";

    if (e?.message) {
      errorMessage = e.message;
    } else if (e?.reason) {
      errorMessage = e.reason;
    } else if (e?.data?.message) {
      errorMessage = e.data.message;
    } else if (typeof e === "string") {
      errorMessage = e;
    }

    console.error("Detailed error message:", errorMessage);

    // Create a new error with better context
    const enhancedError = new Error(`Vault deposit failed: ${errorMessage}`);
    enhancedError.cause = e;

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
    console.error("depositErc20ToPortal error:", e);
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
      console.error("Failed to get voucher with proof");
      return { message: "Failed to get voucher with proof" };
    }

    // Enhanced proof validation to prevent ABI errors
    if (
      !voucherWithProof.proof ||
      !voucherWithProof.destination ||
      !voucherWithProof.payload
    ) {
      console.error("Voucher proof data incomplete:", {
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
      console.error("Proof structure incomplete - not ready for execution:", {
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
        console.error("Contract execution error:", contractError);

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
