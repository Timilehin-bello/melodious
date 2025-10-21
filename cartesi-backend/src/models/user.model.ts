import { Error_out, Wallet } from "cartesi-wallet";
import { Router } from "cartesi-router";
import { Listener } from "./listener.model";
import { Artist } from "./artist.model";
const wallet = new Wallet(new Map());

const router = new Router(wallet);

class User {
  static nextId = 1;
  // private static ids = new Set<number>();
  id: number;
  name: string;
  displayName: string;
  cartesiTokenBalance: number | 0;
  walletAddress: string;
  role: "LISTENER" | "ARTIST";
  username: string;
  profileImage: string | null;
  country: string | null;
  artist: Artist | null;
  listener: Listener | null;
  referralCode: string; // Unique referral code for this user
  meloPoints: number; // Current Melo points balance
  totalReferrals: number; // Count of successful referrals
  createdAt: Date;
  updatedAt: Date;

  constructor(
    name: string,
    displayName: string,
    walletAddress: string,
    username: string,
    role: "LISTENER" | "ARTIST",
    createAt: Date,
    updatedAt: Date,
    artist?: Artist | null,
    listener?: Listener | null,
    profileImage?: string | null,
    country?: string | null
  ) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new Error_out("Invalid wallet address");
    }
    if (!artist !== !listener) {
      throw new Error_out(
        "Either artist or listener must be passed, but not both"
      );
    }

    if (/[^a-zA-Z0-9.]/.test(username)) {
      throw new Error_out("Username can only contain letters, numbers and .");
    }

    // let id = User.nextId;
    // while (User.ids.has(id)) {
    //   id = User.nextId++;
    // }
    // User.ids.add(id);

    this.id = User.nextId++;
    this.name = name;
    this.displayName = displayName;
    this.walletAddress = walletAddress.toLowerCase();
    this.cartesiTokenBalance = 0;
    this.role = role;
    this.username = username.toLowerCase();
    this.profileImage = profileImage || null;
    this.country = country || null;
    this.artist = artist || null;
    this.listener = listener || null;
    this.referralCode = this.generateReferralCode();
    this.meloPoints = 0;
    this.totalReferrals = 0;
    this.createdAt = createAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Generate a unique referral code for the user
   */
  private generateReferralCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "MELO-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Add Melo points to user's balance
   */
  public addMeloPoints(points: number, timestamp?: number): void {
    if (points <= 0) {
      throw new Error_out("Points to add must be positive");
    }
    this.meloPoints += points;
    this.updatedAt = timestamp ? new Date(timestamp * 1000) : new Date();
  }

  /**
   * Deduct Melo points from user's balance
   */
  public deductMeloPoints(points: number, timestamp?: number): void {
    if (points <= 0) {
      throw new Error_out("Points to deduct must be positive");
    }
    if (this.meloPoints < points) {
      throw new Error_out("Insufficient Melo points balance");
    }
    this.meloPoints -= points;
    this.updatedAt = timestamp ? new Date(timestamp * 1000) : new Date();
  }

  /**
   * Increment total referrals count
   */
  public incrementReferrals(timestamp?: number): void {
    this.totalReferrals += 1;
    this.updatedAt = timestamp ? new Date(timestamp * 1000) : new Date();
  }

  /**
   * Convert Melo points to CTSI tokens
   */
  public convertMeloToCtsi(meloPoints: number, conversionRate: number): number {
    if (meloPoints <= 0) {
      throw new Error_out("Melo points to convert must be positive");
    }
    if (conversionRate <= 0) {
      throw new Error_out("Conversion rate must be positive");
    }
    if (this.meloPoints < meloPoints) {
      throw new Error_out("Insufficient Melo points balance");
    }

    const ctsiAmount = meloPoints / conversionRate;
    this.deductMeloPoints(meloPoints);
    this.cartesiTokenBalance += ctsiAmount;

    return ctsiAmount;
  }
}

export { User };
