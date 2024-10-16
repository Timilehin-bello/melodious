import { Error_out, Log, Wallet, Notice } from "cartesi-wallet";
import { Router } from "cartesi-router";
import { CreateListener, Listener } from "./listener.model";
import { Artist, CreateArtist } from "./artist.model";
import { stringify, parse } from "flatted";
import { UserType } from "../configs/enum";
const wallet = new Wallet(new Map());

const router = new Router(wallet);

class User {
  static nextId = 0;
  // private static ids = new Set<number>();
  id: number;
  name: string;
  displayName: string;
  cartesiTokenBalance: number | 0;
  walletAddress: string;
  username: string;
  profileImage: string | null;
  country: string | null;
  artist: Artist | null;
  listener: Listener | null;
  permissions: { [address: string]: string[] };
  createdAt: Date;
  updatedAt: Date;

  constructor(
    name: string,
    displayName: string,
    walletAddress: string,
    username: string,
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
    this.username = username.toLowerCase();
    this.permissions = { [walletAddress]: ["read", "write", "delete"] };
    this.profileImage = profileImage || null;
    this.country = country || null;
    this.artist = artist || null;
    this.listener = listener || null;
    this.createdAt = createAt;
    this.updatedAt = updatedAt;
  }
}

class CreateUser {
  users: User[];
  constructor() {
    this.users = [];
  }

  create(
    userBody: Omit<User, "userType"> & {
      userType: "LISTENER" | "ARTIST";
    }
  ) {
    if (this.getUserByUniqueValue({ walletAddress: userBody.walletAddress })) {
      console.log("User with wallet address already exists");
      return new Error_out("User with wallet address already exists");
    }

    if (this.getUserByUniqueValue({ username: userBody.username })) {
      console.log("User with username already exists");
      return new Error_out("User with wallet address already exists");
    }

    console.log(`CreatedAt ${userBody.createdAt}`);

    try {
      const user = new User(
        userBody.name,
        userBody.displayName,
        userBody.walletAddress,
        userBody.username,
        userBody.createdAt,
        userBody.updatedAt
      );

      if (userBody.userType === UserType.LISTENER) {
        console.log("Creating listener");
        const listener = new CreateListener().create({ user });

        user.listener = listener;
        if (!user || !listener) {
          return new Error_out("Failed to create User or Listener");
        }
      } else if (userBody.userType === UserType.ARTIST) {
        console.log("Creating artist");
        const artist = new CreateArtist().create({ user });

        user.artist = artist;
        if (!user || !artist) {
          return new Error_out("Failed to create User or Artist");
        }
      }

      this.users.push(user);

      console.log("user", user);

      const user_json = JSON.stringify(user);
      const notice_payload = `{{"type":"add_user","content":${user_json}}}`;
      console.log(
        `User ${user.name} created with wallet address ${user.walletAddress}`
      );
      // const notice_payload_json = parse(user_json);
      // console.log("notice parse", notice_payload_json);
      return new Notice(notice_payload);
    } catch (error) {
      const error_msg = `Failed to create User ${error}`;
      console.debug("Create User", error_msg);
      return new Error_out(error_msg);
    }
  }

  updateUser(
    currentWalletAddress: string,
    timestamp: number,
    userBody: Partial<User>
  ) {
    try {
      const updateUser = this.getUserByUniqueValue({
        walletAddress: currentWalletAddress,
      });
      if (
        !this.getUserByUniqueValue({
          walletAddress: currentWalletAddress,
        })
      ) {
        return new Error_out(
          `User with wallet ${currentWalletAddress} not found`
        );
      }

      if (this.getUserByUniqueValue({ username: userBody.username })) {
        return new Error_out(
          `User with username ${userBody.username} already exists`
        );
      }

      if (updateUser?.walletAddress !== currentWalletAddress.toLowerCase()) {
        return new Error_out("Only the user itself can update its details");
      }

      const { id, cartesiTokenBalance, walletAddress, updatedAt, ...rest } =
        userBody;
      Object.assign(updateUser, {
        ...rest,
        updatedAt: new Date(timestamp * 1000),
      });
      const user_json = JSON.stringify(updateUser);

      console.log("Updating User", user_json);
      const notice_payload = `{{"type":"update_user","content":${user_json}}}`;

      return new Notice(notice_payload);
    } catch (error) {
      console.debug("Error updating user", error);
      return new Error_out(`Failed to update user with id ${userBody.id}`);
    }
  }
  getUsers() {
    try {
      const users_json = JSON.stringify(this.users);
      console.log("Users", users_json);
      return new Log(users_json);
    } catch (error) {
      const error_msg = `Failed to get Users ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  }

  getUser(user_id: number) {
    try {
      let user_json = JSON.stringify(this.users[user_id]);
      console.log("User", user_json);
      return new Log(user_json);
    } catch (error) {
      return new Error_out(`User with id ${user_id} not found`);
    }
  }

  deleteUser(user_id: number) {
    try {
      const user = this.getUserByUniqueValue({ id: user_id });
      if (!user) {
        return new Error_out(`User with id ${user_id} not found`);
      }

      this.users = this.users.filter((u) => u.id !== user_id);

      console.log("User deleted", user);

      const user_json = JSON.stringify(user);
      console.log("Deleting User", user_json);

      const notice_payload = `{{"type":"delete_user","content":${user_json} }}`;

      return new Notice(notice_payload);
    } catch (error) {
      console.debug("Error deleting user", error);
      return new Error_out(`Failed to delete user with id ${user_id}`);
    }
  }

  deleteUsers() {
    try {
      this.users = [];
      console.log("All Users deleted");
      return new Notice(`{{"type":"delete_all_users","content":null }}`);
    } catch (error) {
      console.debug("Error deleting all users", error);
      return new Error_out("Failed to delete all users");
    }
  }

  getUserByUniqueValue({
    id,
    walletAddress,
    username,
  }: {
    id?: number;
    walletAddress?: string;
    username?: string;
  }) {
    return this.users.find(
      (user) =>
        user.id === id ||
        user.walletAddress === walletAddress ||
        user.username === username
    );
  }
}

export { User, CreateUser };
