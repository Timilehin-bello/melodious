import { Error_out, Log } from "cartesi-wallet";
import { WithdrawalService } from "../services";
import type {
  WithdrawalRequest,
  VoucherV2,
} from "../services/withdrawal.service";

class WithdrawalController {
  private withdrawalService: WithdrawalService;

  constructor() {
    this.withdrawalService = new WithdrawalService();
  }

  /**
   * Handle Ether withdrawal request
   * @param withdrawalBody - Withdrawal request data
   * @returns VoucherV2 or Error_out
   */
  public withdrawEther(withdrawalBody: WithdrawalRequest) {
    // Validate required fields
    if (!withdrawalBody.walletAddress || !withdrawalBody.amount) {
      return new Error_out("Missing required fields: walletAddress and amount");
    }

    // Validate wallet address format
    if (!this.isValidAddress(withdrawalBody.walletAddress)) {
      return new Error_out("Invalid wallet address format");
    }

    // Validate amount
    if (withdrawalBody.amount <= 0) {
      return new Error_out("Amount must be greater than 0");
    }

    console.log("Processing Ether withdrawal:", withdrawalBody);

    try {
      const result =
        this.withdrawalService.createEtherWithdrawal(withdrawalBody);

      if (result instanceof Error_out) {
        return result;
      }

      console.log("Ether withdrawal voucher created:", result);
      return result;
    } catch (error) {
      console.error("Error processing Ether withdrawal:", error);
      return new Error_out("Failed to process Ether withdrawal");
    }
  }

  /**
   * Handle ERC-20 token withdrawal request
   * @param withdrawalBody - Withdrawal request data
   * @returns VoucherV2 or Error_out
   */
  public withdrawERC20(withdrawalBody: WithdrawalRequest) {
    // Validate required fields
    if (
      !withdrawalBody.walletAddress ||
      !withdrawalBody.amount ||
      !withdrawalBody.tokenAddress
    ) {
      return new Error_out(
        "Missing required fields: walletAddress, amount, and tokenAddress"
      );
    }

    // Validate addresses format
    if (!this.isValidAddress(withdrawalBody.walletAddress)) {
      return new Error_out("Invalid wallet address format");
    }

    if (!this.isValidAddress(withdrawalBody.tokenAddress)) {
      return new Error_out("Invalid token address format");
    }

    // Validate amount
    if (withdrawalBody.amount <= 0) {
      return new Error_out("Amount must be greater than 0");
    }

    console.log("Processing ERC-20 withdrawal:", withdrawalBody);

    try {
      const result =
        this.withdrawalService.createERC20Withdrawal(withdrawalBody);

      if (result instanceof Error_out) {
        return result;
      }

      console.log("ERC-20 withdrawal voucher created:", result);
      return result;
    } catch (error) {
      console.error("Error processing ERC-20 withdrawal:", error);
      return new Error_out("Failed to process ERC-20 withdrawal");
    }
  }

  /**
   * Handle ERC-721 NFT withdrawal request
   * @param withdrawalBody - Withdrawal request data
   * @returns VoucherV2 or Error_out
   */
  public withdrawERC721(withdrawalBody: WithdrawalRequest) {
    // Validate required fields
    if (
      !withdrawalBody.walletAddress ||
      withdrawalBody.tokenId === undefined ||
      !withdrawalBody.tokenAddress
    ) {
      return new Error_out(
        "Missing required fields: walletAddress, tokenId, and tokenAddress"
      );
    }

    // Validate addresses format
    if (!this.isValidAddress(withdrawalBody.walletAddress)) {
      return new Error_out("Invalid wallet address format");
    }

    if (!this.isValidAddress(withdrawalBody.tokenAddress)) {
      return new Error_out("Invalid token address format");
    }

    // Validate tokenId
    if (withdrawalBody.tokenId < 0) {
      return new Error_out("Token ID must be a non-negative number");
    }

    console.log("Processing ERC-721 withdrawal:", withdrawalBody);

    try {
      const result =
        this.withdrawalService.createERC721Withdrawal(withdrawalBody);

      if (result instanceof Error_out) {
        return result;
      }

      console.log("ERC-721 withdrawal voucher created:", result);
      return result;
    } catch (error) {
      console.error("Error processing ERC-721 withdrawal:", error);
      return new Error_out("Failed to process ERC-721 withdrawal");
    }
  }

  /**
   * Get withdrawal history (placeholder for future implementation)
   * @param walletAddress - User's wallet address
   * @returns Log with withdrawal history or Error_out
   */
  public getWithdrawalHistory(walletAddress: string) {
    if (!walletAddress) {
      return new Error_out("Wallet address is required");
    }

    if (!this.isValidAddress(walletAddress)) {
      return new Error_out("Invalid wallet address format");
    }

    try {
      // This would typically fetch from a database or repository
      // For now, return a placeholder response
      const history = {
        walletAddress,
        withdrawals: [],
        message: "Withdrawal history feature coming soon",
      };

      return new Log(JSON.stringify(history));
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      return new Error_out("Failed to fetch withdrawal history");
    }
  }

  /**
   * Validate Ethereum address format
   * @param address - Address to validate
   * @returns boolean indicating if address is valid
   */
  private isValidAddress(address: string): boolean {
    // Basic Ethereum address validation (0x followed by 40 hex characters)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
  }
}

export { WithdrawalController };
