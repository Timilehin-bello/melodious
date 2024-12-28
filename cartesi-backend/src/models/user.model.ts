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
    this.createdAt = createAt;
    this.updatedAt = updatedAt;
  }
}

export { User };
