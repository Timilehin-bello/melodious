import { Error_out, Log, Notice } from "cartesi-wallet";
import { User } from "../models";
import { UserType } from "../configs/enum";
import { ListenerController } from "./listener.controller";
import { ArtistController } from "./artist.controller";
import { Json } from "../interfaces";

class UserController {
  users: User[];

  constructor() {
    this.users = [];
  }

  create(
    userBody: Omit<User, "userType"> & {
      userType: "LISTENER" | "ARTIST";
      biography?: string;
      socialMediaLinks?: Json;
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
        const listener = new ListenerController().create({ user });

        user.listener = listener;
        if (!user || !listener) {
          return new Error_out("Failed to create User or Listener");
        }
      } else if (userBody.userType === UserType.ARTIST) {
        console.log("Creating artist");
        const artist = new ArtistController().create({
          user,
          biography: userBody.biography || null,
          socialMediaLinks: userBody.socialMediaLinks || null,
        });

        user.artist = artist;
        if (!user || !artist) {
          return new Error_out("Failed to create User or Artist");
        }
      }

      this.users.push(user);

      console.log("user", user);

      const user_json = JSON.stringify(user);
      const notice_payload = `{{"type":"create_user","content":${user_json}}}`;
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

      // if(updateUser.artist) {
      //   updateUser.artist.biography = userBody.biography;
      //   updateUser.artist.socialMediaLinks = userBody.socialMediaLinks;
      // }

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

export { UserController };
