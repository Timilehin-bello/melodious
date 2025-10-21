import { Error_out } from "cartesi-wallet";

class Referral {
  static nextId = 1;
  id: number;
  referrerWalletAddress: string; // Wallet address of user who made the referral
  referredWalletAddress: string; // Wallet address of user who was referred
  referrerName: string; // Display name of the referrer
  referredName: string; // Display name of the referred user
  referralCode: string; // Code used for referral
  meloPointsEarned: number; // Points earned from this referral
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  completedAt: Date | null;

  constructor(
    referrerWalletAddress: string,
    referredWalletAddress: string,
    referrerName: string,
    referredName: string,
    referralCode: string,
    meloPointsEarned: number,
    createdAt: Date,
    status: "PENDING" | "COMPLETED" | "CANCELLED" = "PENDING",
    completedAt?: Date | null
  ) {
    if (referrerWalletAddress === referredWalletAddress) {
      throw new Error_out("Users cannot refer themselves");
    }

    if (meloPointsEarned < 0) {
      throw new Error_out("Melo points earned cannot be negative");
    }

    if (!referralCode || referralCode.trim().length === 0) {
      throw new Error_out("Referral code is required");
    }

    // Validate wallet addresses
    if (!/^0x[a-fA-F0-9]{40}$/.test(referrerWalletAddress)) {
      throw new Error_out("Invalid referrer wallet address");
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(referredWalletAddress)) {
      throw new Error_out("Invalid referred wallet address");
    }

    this.id = Referral.nextId++;
    this.referrerWalletAddress = referrerWalletAddress.toLowerCase();
    this.referredWalletAddress = referredWalletAddress.toLowerCase();
    this.referrerName = referrerName.trim();
    this.referredName = referredName.trim();
    this.referralCode = referralCode.toUpperCase();
    this.meloPointsEarned = meloPointsEarned;
    this.status = status;
    this.createdAt = createdAt;
    this.completedAt = completedAt || null;
  }

  /**
   * Mark referral as completed
   */
  public complete(timestamp?: number): void {
    if (this.status === "COMPLETED") {
      throw new Error_out("Referral is already completed");
    }

    if (this.status === "CANCELLED") {
      throw new Error_out("Cannot complete a cancelled referral");
    }

    this.status = "COMPLETED";
    this.completedAt = timestamp ? new Date(timestamp * 1000) : new Date();
  }

  /**
   * Cancel referral
   */
  public cancel(): void {
    if (this.status === "COMPLETED") {
      throw new Error_out("Cannot cancel a completed referral");
    }

    this.status = "CANCELLED";
  }

  /**
   * Check if referral is active (completed)
   */
  public isActive(): boolean {
    return this.status === "COMPLETED";
  }
}

export { Referral };
