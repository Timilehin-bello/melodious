import { encodeFunctionData, parseEther, zeroHash, hexToBytes, numberToHex } from "viem";
import { Error_out } from "cartesi-wallet";
import { ConfigService } from "./config.service";
import { RepositoryService } from "./repository.service";

interface WithdrawalRequest {
  walletAddress: string;
  amount?: number;
  tokenId?: number;
  tokenAddress?: string;
  timestamp?: number;
}

// Cartesi Rollups v2.0 voucher interface
interface VoucherV2 {
  type: "voucher"; // Required by cartesi-wallet Output interface
  destination: string;
  payload: string;
  value?: string;
}

class WithdrawalService {
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }

  /**
   * Create Ether withdrawal voucher following Cartesi v2.0 documentation
   * @param request - Withdrawal request containing recipient address and amount
   * @returns VoucherV2 or Error_out
   */
  public createEtherWithdrawal(
    request: WithdrawalRequest
  ): VoucherV2 | Error_out {
    if (!request.walletAddress || !request.amount) {
      return new Error_out("Missing required fields: walletAddress and amount");
    }

    const config = this.configService.getConfig();
    if (!config) {
      return new Error_out("Failed to get configuration");
    }

    try {
      // Convert amount to Wei
      const amountInWei = parseEther(request.amount.toString());

      // For Ether withdrawal, create a voucher with hex-formatted value
      // According to Cartesi v2.0 docs, Ether withdrawals need proper hex formatting
      const voucher: VoucherV2 = {
        type: "voucher",
        destination: request.walletAddress,
        payload: "0x", // Empty payload for direct Ether transfer
        value: numberToHex(amountInWei), // Amount in Wei as proper hex
      };

      // Create repository notice for withdrawal tracking
      RepositoryService.createRepositoryNotice("ether_withdrawal", {
        walletAddress: request.walletAddress,
        amount: request.amount,
        timestamp: request.timestamp
          ? new Date(request.timestamp * 1000)
          : new Date(),
        voucher: {
          destination: voucher.destination,
          payload: voucher.payload,
          value: voucher.value?.toString(),
        },
      });

      return voucher;
    } catch (error) {
      console.error("Error creating Ether withdrawal:", error);
      return new Error_out("Failed to create Ether withdrawal voucher");
    }
  }

  /**
   * Create ERC-20 token withdrawal voucher following Cartesi v2.0 documentation
   * @param request - Withdrawal request containing recipient, amount, and token address
   * @returns VoucherV2 or Error_out
   */
  public createERC20Withdrawal(
    request: WithdrawalRequest
  ): VoucherV2 | Error_out {
    if (!request.walletAddress || !request.amount || !request.tokenAddress) {
      return new Error_out(
        "Missing required fields: walletAddress, amount, and tokenAddress"
      );
    }

    const config = this.configService.getConfig();
    if (!config) {
      return new Error_out("Failed to get configuration");
    }

    try {
      // Convert amount to Wei (assuming 18 decimals for ERC-20)
      const amountInWei = parseEther(request.amount.toString());

      // Create ERC-20 transfer function call
      const transferCallData = encodeFunctionData({
        abi: [
          {
            name: "transfer",
            type: "function",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "transfer",
        args: [request.walletAddress as `0x${string}`, amountInWei],
      });

      const voucher: VoucherV2 = {
        type: "voucher",
        destination: request.tokenAddress,
        payload: transferCallData,
        value: zeroHash, // No Ether sent with ERC-20 transfer
      };

      // Create repository notice for withdrawal tracking
      RepositoryService.createRepositoryNotice("erc20_withdrawal", {
        walletAddress: request.walletAddress,
        amount: request.amount,
        tokenAddress: request.tokenAddress,
        timestamp: request.timestamp
          ? new Date(request.timestamp * 1000)
          : new Date(),
        voucher: {
          destination: voucher.destination,
          payload: voucher.payload,
          value: voucher.value,
        },
      });

      return voucher;
    } catch (error) {
      console.error("Error creating ERC-20 withdrawal:", error);
      return new Error_out("Failed to create ERC-20 withdrawal voucher");
    }
  }

  /**
   * Create ERC-721 NFT withdrawal voucher following Cartesi v2.0 documentation
   * @param request - Withdrawal request containing recipient, tokenId, and token address
   * @returns VoucherV2 or Error_out
   */
  public createERC721Withdrawal(
    request: WithdrawalRequest
  ): VoucherV2 | Error_out {
    if (
      !request.walletAddress ||
      request.tokenId === undefined ||
      !request.tokenAddress
    ) {
      return new Error_out(
        "Missing required fields: walletAddress, tokenId, and tokenAddress"
      );
    }

    const config = this.configService.getConfig();
    if (!config) {
      return new Error_out("Failed to get configuration");
    }

    try {
      // Create ERC-721 transferFrom function call
      // Note: The DApp contract should be the owner of the NFT
      const transferFromCallData = encodeFunctionData({
        abi: [
          {
            name: "transferFrom",
            type: "function",
            inputs: [
              { name: "from", type: "address" },
              { name: "to", type: "address" },
              { name: "tokenId", type: "uint256" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "transferFrom",
        args: [
          config.dappContractAddress as `0x${string}`, // From: DApp contract
          request.walletAddress as `0x${string}`, // To: Recipient
          BigInt(request.tokenId), // Token ID
        ],
      });

      const voucher: VoucherV2 = {
        type: "voucher",
        destination: request.tokenAddress,
        payload: transferFromCallData,
        value: zeroHash, // No Ether sent with ERC-721 transfer
      };

      // Create repository notice for withdrawal tracking
      RepositoryService.createRepositoryNotice("erc721_withdrawal", {
        walletAddress: request.walletAddress,
        tokenId: request.tokenId,
        tokenAddress: request.tokenAddress,
        timestamp: request.timestamp
          ? new Date(request.timestamp * 1000)
          : new Date(),
        voucher: {
          destination: voucher.destination,
          payload: voucher.payload,
          value: voucher.value,
        },
      });

      return voucher;
    } catch (error) {
      console.error("Error creating ERC-721 withdrawal:", error);
      return new Error_out("Failed to create ERC-721 withdrawal voucher");
    }
  }
}

export { WithdrawalService };
export type { WithdrawalRequest, VoucherV2 };
