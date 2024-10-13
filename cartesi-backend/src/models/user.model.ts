import { Error_out } from "cartesi-wallet";
import { Listener } from "./listener.model";
import { Artist } from "./artist.model";

class User {
  static nextId = 0;
  id: number;
  name: string;
  cartesiTokenBalance?: number | null;
  walletAddress: string;
  username: string;
  profileImage: string | null;
  country: string | null;
  artist: Artist | null;
  listener?: Listener | null;
  permissions: { [address: string]: string[] };
  createdAt: Date;
  updatedAt: Date;

  constructor(
    name: string,
    walletAddress: string,
    username: string,
    profileImage: string | null,
    country: string | null,
    artist: Artist | null,
    listener: Listener | null
  ) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new Error_out("Invalid wallet address");
    }
    if (!walletAddress.startsWith("0x")) {
      throw new Error_out("Invalid wallet address");
    }
    if (!(artist || listener)) {
      throw new Error_out("Either artist or listener must be passed");
    }
    if (artist && listener) {
      throw new Error_out("Both artist and listener can not be passed");
    }

    this.id = User.nextId++;
    this.name = name;
    this.walletAddress = walletAddress;
    this.username = username;
    this.permissions = { [walletAddress]: ["read", "write", "delete"] };
    this.profileImage = profileImage || null;
    this.country = country || null;
    this.artist = artist || null;
    this.listener = listener || null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  canRead(address: string): boolean {
    return !!this.permissions[address]?.includes("read");
  }

  canWrite(address: string): boolean {
    return !!this.permissions[address]?.includes("write");
  }

  canUpdate(address: string): boolean {
    return !!this.permissions[address]?.includes("write");
  }

  canDelete(address: string): boolean {
    return !!this.permissions[address]?.includes("delete");
  }
}

/*** 
const users: User[] = [];

const getUserByAddress = (address: string): User | undefined => {
  return users.find((user) => user.walletAddress === address);
};


function checkUserBeforeOperation(
  address: string,
  operation: "read" | "write" | "delete"
): boolean {
  const user = getUserByAddress(address);
  if (!user) {
    return false;
  }
  switch (operation) {
    case "read":
      return user.canRead(address);
    case "write":
      return user.canWrite(address);
    case "delete":
      return user.canDelete(address);
  }
}

 Example usage:
const user1 = new User("Alice", "0x123456");
users.push(user1);
console.log(checkUserBeforeOperation("0x123456", "read")); // true
console.log(checkUserBeforeOperation("0x789012", "write")); // false

****/

export { User };
