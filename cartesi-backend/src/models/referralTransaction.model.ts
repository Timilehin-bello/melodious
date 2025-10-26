import { Error_out } from "cartesi-wallet";

class ReferralTransaction {
  static nextId = 1;
  id: number;
  userWalletAddress: string;
  type: "EARNED" | "CONVERTED";
  meloPoints: number;
  ctsiAmount?: number; // For conversion transactions
  conversionRate?: number; // Rate used for conversion (Melo points per CTSI)
  referralId?: number; // Link to referral if earned points
  description: string;
  createdAt: Date;

  constructor(
    userWalletAddress: string,
    type: "EARNED" | "CONVERTED",
    meloPoints: number,
    createdAt: Date,
    description: string,
    ctsiAmount?: number,
    conversionRate?: number,
    referralId?: number
  ) {
    // Validate wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(userWalletAddress)) {
      throw new Error_out("Invalid wallet address");
    }

    if (meloPoints <= 0) {
      throw new Error_out("Melo points must be positive");
    }

    if (type === "CONVERTED") {
      if (!ctsiAmount || ctsiAmount <= 0) {
        throw new Error_out(
          "CTSI amount is required for conversion transactions"
        );
      }
      if (!conversionRate || conversionRate <= 0) {
        throw new Error_out(
          "Conversion rate is required for conversion transactions"
        );
      }
    }

    if (type === "EARNED" && !referralId) {
      throw new Error_out(
        "Referral ID is required for earned points transactions"
      );
    }

    if (!description || description.trim().length === 0) {
      throw new Error_out("Transaction description is required");
    }

    this.id = ReferralTransaction.nextId++;
    this.userWalletAddress = userWalletAddress.toLowerCase();
    this.type = type;
    this.meloPoints = meloPoints;
    this.ctsiAmount = ctsiAmount;
    this.conversionRate = conversionRate;
    this.referralId = referralId;
    this.description = description.trim();
    this.createdAt = createdAt;
  }

  /**
   * Create an earned transaction
   */
  static createEarnedTransaction(
    userWalletAddress: string,
    meloPoints: number,
    referralId: number,
    referredUserName: string,
    referredWalletAddress: string,
    timestamp?: any
  ): ReferralTransaction {
    return new ReferralTransaction(
      userWalletAddress,
      "EARNED",
      meloPoints,
      timestamp ? timestamp : new Date(),
      `Earned ${meloPoints} Melo points for referring ${referredUserName} (${referredWalletAddress})`,
      undefined,
      undefined,
      referralId
    );
  }

  /**
   * Create a conversion transaction
   */
  static createConversionTransaction(
    userWalletAddress: string,
    meloPoints: number,
    ctsiAmount: number,
    conversionRate: number,
    timestamp?: number
  ): ReferralTransaction {
    return new ReferralTransaction(
      userWalletAddress,
      "CONVERTED",
      meloPoints,
      timestamp ? new Date(timestamp * 1000) : new Date(),
      `Converted ${meloPoints} Melo points to ${ctsiAmount} CTSI tokens`,
      ctsiAmount,
      conversionRate
    );
  }

  /**
   * Get formatted transaction description
   */
  public getFormattedDescription(): string {
    return this.description;
  }

  /**
   * Check if transaction is a conversion
   */
  public isConversion(): boolean {
    return this.type === "CONVERTED";
  }

  /**
   * Check if transaction is earned points
   */
  public isEarned(): boolean {
    return this.type === "EARNED";
  }
}

export { ReferralTransaction };
