import { Error_out, Log, Notice } from "cartesi-wallet";
import { User, Referral, ReferralTransaction, Config } from "../models";
import { RepositoryService } from "../services";

class ReferralController {
  private get config(): Config {
    const config = RepositoryService.config;
    if (!config) {
      throw new Error(
        "Config must be initialized before using ReferralController"
      );
    }
    return config;
  }

  /**
   * Process referral when a new user registers
   */
  public processReferral(
    referralCode: string,
    newUserWalletAddress: string,
    newUserName: string
  ) {
    try {
      // Find the referrer by referral code
      const referrer = this.getUserByReferralCode(referralCode);
      if (!referrer) {
        return new Error_out(`Invalid referral code: ${referralCode}`);
      }

      // Check if user is trying to refer themselves
      if (
        referrer.walletAddress.toLowerCase() ===
        newUserWalletAddress.toLowerCase()
      ) {
        return new Error_out("Users cannot refer themselves");
      }

      // Check if the new user has already been referred
      const existingReferral = RepositoryService.referrals.find(
        (ref) =>
          ref.referredWalletAddress === newUserWalletAddress.toLowerCase()
      );
      if (existingReferral) {
        return new Error_out("User has already been referred");
      }

      // Create referral record
      const referral = new Referral(
        referrer.walletAddress,
        newUserWalletAddress,
        referrer.name,
        newUserName,
        referralCode,
        this.config.referralPoints,
        new Date(),
        "COMPLETED",
        new Date()
      );

      // Add referral to repository
      RepositoryService.referrals.push(referral);

      // Award points to referrer
      referrer.addMeloPoints(this.config.referralPoints);
      referrer.incrementReferrals();

      // Create transaction record
      const transaction = ReferralTransaction.createEarnedTransaction(
        referrer.walletAddress,
        this.config.referralPoints,
        referral.id,
        newUserName,
        newUserWalletAddress
      );
      RepositoryService.referralTransactions.push(transaction);

      // Create repository notices
      const referralNotice = RepositoryService.createRepositoryNotice(
        "referral_completed",
        {
          referral,
          referrer: {
            walletAddress: referrer.walletAddress,
            name: referrer.name,
            meloPoints: referrer.meloPoints,
            totalReferrals: referrer.totalReferrals,
          },
          referredUser: {
            walletAddress: newUserWalletAddress,
            name: newUserName,
          },
          pointsAwarded: this.config.referralPoints,
        }
      );

      const transactionNotice = RepositoryService.createDataNotice(
        "referralTransactions",
        "created",
        transaction
      );

      console.log(
        `Referral processed: ${referrer.name} referred ${newUserName}, awarded ${this.config.referralPoints} Melo points`
      );

      return referralNotice;
    } catch (error) {
      console.error("Error processing referral:", error);
      return new Error_out(`Failed to process referral: ${error}`);
    }
  }

  /**
   * Convert Melo points to CTSI tokens
   */
  public convertMeloToCtsi(
    walletAddress: string,
    meloPoints: number,
    timestamp: number
  ) {
    try {
      // Find user
      const user = this.getUserByWalletAddress(walletAddress);
      if (!user) {
        return new Error_out(
          `User with wallet address ${walletAddress} not found`
        );
      }

      // Validate conversion amount
      if (meloPoints < this.config.minConversion) {
        return new Error_out(
          `Minimum conversion is ${this.config.minConversion} Melo points`
        );
      }

      if (meloPoints > this.config.maxDailyConversion) {
        return new Error_out(
          `Maximum daily conversion is ${this.config.maxDailyConversion} Melo points`
        );
      }

      // Check if user has sufficient balance
      if (user.meloPoints < meloPoints) {
        return new Error_out(
          `Insufficient Melo points. Available: ${user.meloPoints}, Required: ${meloPoints}`
        );
      }

      // Perform conversion
      const ctsiAmount = user.convertMeloToCtsi(
        meloPoints,
        this.config.conversionRate
      );

      // Create transaction record
      const transaction = ReferralTransaction.createConversionTransaction(
        user.walletAddress,
        meloPoints,
        ctsiAmount,
        this.config.conversionRate
      );
      RepositoryService.referralTransactions.push(transaction);

      // Update user timestamp
      user.updatedAt = new Date(timestamp * 1000);

      // Create repository notices
      const conversionNotice = RepositoryService.createRepositoryNotice(
        "melo_points_converted",
        {
          user: {
            walletAddress: user.walletAddress,
            name: user.name,
            meloPoints: user.meloPoints,
            cartesiTokenBalance: user.cartesiTokenBalance,
          },
          conversion: {
            meloPointsConverted: meloPoints,
            ctsiReceived: ctsiAmount,
            conversionRate: this.config.conversionRate,
          },
          transaction,
        }
      );

      const transactionNotice = RepositoryService.createDataNotice(
        "referralTransactions",
        "created",
        transaction
      );

      console.log(
        `Conversion completed: ${user.name} converted ${meloPoints} Melo points to ${ctsiAmount} CTSI`
      );

      return conversionNotice;
    } catch (error) {
      console.error("Error converting Melo points:", error);
      return new Error_out(`Failed to convert Melo points: ${error}`);
    }
  }

  /**
   * Get user's referral statistics
   */
  public getReferralStats(walletAddress: string) {
    try {
      const user = this.getUserByWalletAddress(walletAddress);
      if (!user) {
        return new Error_out(
          `User with wallet address ${walletAddress} not found`
        );
      }

      const userReferrals = RepositoryService.referrals.filter(
        (ref) =>
          ref.referrerWalletAddress === walletAddress.toLowerCase() &&
          ref.status === "COMPLETED"
      );

      const userTransactions = RepositoryService.referralTransactions.filter(
        (trans) => trans.userWalletAddress === walletAddress.toLowerCase()
      );

      const earnedTransactions = userTransactions.filter((trans) =>
        trans.isEarned()
      );
      const conversionTransactions = userTransactions.filter((trans) =>
        trans.isConversion()
      );

      const totalPointsEarned = earnedTransactions.reduce(
        (sum, trans) => sum + trans.meloPoints,
        0
      );
      const totalPointsConverted = conversionTransactions.reduce(
        (sum, trans) => sum + trans.meloPoints,
        0
      );
      const totalCtsiReceived = conversionTransactions.reduce(
        (sum, trans) => sum + (trans.ctsiAmount || 0),
        0
      );

      const stats = {
        user: {
          walletAddress: user.walletAddress,
          name: user.name,
          referralCode: user.referralCode,
          currentMeloPoints: user.meloPoints,
          totalReferrals: user.totalReferrals,
        },
        statistics: {
          totalReferrals: userReferrals.length,
          totalPointsEarned,
          totalPointsConverted,
          totalCtsiReceived,
          currentBalance: user.meloPoints,
        },
        recentReferrals: userReferrals.map((ref) => ({
          id: ref.id,
          referredWalletAddress: ref.referredWalletAddress,
          referredName: ref.referredName,
          referrerName: ref.referrerName,
          pointsEarned: ref.meloPointsEarned,
          createdAt: ref.createdAt,
          completedAt: ref.completedAt,
        })),
        recentTransactions: userTransactions.slice(-10).map((trans) => ({
          id: trans.id,
          type: trans.type,
          meloPoints: trans.meloPoints,
          ctsiAmount: trans.ctsiAmount,
          description: trans.description,
          createdAt: trans.createdAt,
        })),
      };

      const statsJson = JSON.stringify(stats);
      console.log(`Referral stats for user ${walletAddress}:`, statsJson);
      return new Log(statsJson);
    } catch (error) {
      console.error("Error getting referral stats:", error);
      return new Error_out(`Failed to get referral stats: ${error}`);
    }
  }

  /**
   * Get user's referral history
   */
  public getUserReferrals(walletAddress: string) {
    try {
      const user = this.getUserByWalletAddress(walletAddress);
      if (!user) {
        return new Error_out(
          `User with wallet address ${walletAddress} not found`
        );
      }

      const userReferrals = RepositoryService.referrals.filter(
        (ref) => ref.referrerWalletAddress === walletAddress
      );

      const referralsWithDetails = userReferrals.map((ref) => {
        const referredUser = this.getUserByWalletAddress(
          ref.referredWalletAddress
        );
        return {
          id: ref.id,
          referredUser: referredUser
            ? {
                id: referredUser.id,
                name: referredUser.name,
                username: referredUser.username,
              }
            : null,
          referralCode: ref.referralCode,
          pointsEarned: ref.meloPointsEarned,
          status: ref.status,
          createdAt: ref.createdAt,
          completedAt: ref.completedAt,
        };
      });

      const historyJson = JSON.stringify({
        walletAddress,
        totalReferrals: userReferrals.length,
        referrals: referralsWithDetails,
      });

      console.log(`Referral history for user ${walletAddress}:`, historyJson);
      return new Log(historyJson);
    } catch (error) {
      console.error("Error getting user referrals:", error);
      return new Error_out(`Failed to get user referrals: ${error}`);
    }
  }

  /**
   * Get user's transaction history
   */
  public getReferralTransactions(walletAddress: string) {
    try {
      const user = this.getUserByWalletAddress(walletAddress);
      if (!user) {
        return new Error_out(
          `User with wallet address ${walletAddress} not found`
        );
      }

      const userTransactions = RepositoryService.referralTransactions.filter(
        (trans) => trans.userWalletAddress === walletAddress
      );

      const transactionsJson = JSON.stringify({
        walletAddress,
        totalTransactions: userTransactions.length,
        transactions: userTransactions.map((trans) => ({
          id: trans.id,
          type: trans.type,
          meloPoints: trans.meloPoints,
          ctsiAmount: trans.ctsiAmount,
          conversionRate: trans.conversionRate,
          referralId: trans.referralId,
          description: trans.description,
          createdAt: trans.createdAt,
        })),
      });

      console.log(
        `Transaction history for user ${walletAddress}:`,
        transactionsJson
      );
      return new Log(transactionsJson);
    } catch (error) {
      console.error("Error getting referral transactions:", error);
      return new Error_out(`Failed to get referral transactions: ${error}`);
    }
  }

  /**
   * Validate referral code
   */
  public validateReferralCode(referralCode: string) {
    try {
      const user = this.getUserByReferralCode(referralCode);
      if (!user) {
        return new Error_out(`Invalid referral code: ${referralCode}`);
      }

      const validationResult = {
        valid: true,
        referrer: {
          id: user.id,
          name: user.name,
          username: user.username,
          totalReferrals: user.totalReferrals,
        },
        pointsToEarn: this.config.referralPoints,
      };

      const resultJson = JSON.stringify(validationResult);
      console.log(`Referral code validation:`, resultJson);
      return new Log(resultJson);
    } catch (error) {
      console.error("Error validating referral code:", error);
      return new Error_out(`Failed to validate referral code: ${error}`);
    }
  }

  /**
   * Helper method to find user by ID
   */
  private getUserById(userId: number): User | undefined {
    return RepositoryService.users.find((user) => user.id === userId);
  }

  /**
   * Helper method to find user by referral code
   */
  private getUserByReferralCode(referralCode: string): User | undefined {
    return RepositoryService.users.find(
      (user) => user.referralCode.toUpperCase() === referralCode.toUpperCase()
    );
  }

  /**
   * Helper method to find user by wallet address
   */
  private getUserByWalletAddress(walletAddress: string): User | undefined {
    return RepositoryService.users.find(
      (user) => user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  /**
   * Get conversion rate and limits
   */
  public getConversionInfo() {
    try {
      const info = {
        conversionRate: this.config.conversionRate,
        minConversion: this.config.minConversion,
        maxDailyConversion: this.config.maxDailyConversion,
        referralPoints: this.config.referralPoints,
      };

      const infoJson = JSON.stringify(info);
      console.log("Conversion info:", infoJson);
      return new Log(infoJson);
    } catch (error) {
      console.error("Error getting conversion info:", error);
      return new Error_out(`Failed to get conversion info: ${error}`);
    }
  }
}

export { ReferralController };
