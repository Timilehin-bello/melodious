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

  public create(
    userBody: Omit<User, "userType"> & {
      userType: "LISTENER" | "ARTIST";
      biography?: string;
      socialMediaLinks?: Json;
    }
  ) {
    if (
      this.getUserByUniqueValue({
        key: "walletAddress",
        value: userBody.walletAddress,
      })
    ) {
      console.log("User with wallet address already exists");
      return new Error_out("User with wallet address already exists");
    }

    if (
      this.getUserByUniqueValue({ key: "username", value: userBody.username })
    ) {
      console.log("User with username already exists");
      return new Error_out("User with wallet address already exists");
    }

    try {
      const user = new User(
        userBody.name,
        userBody.displayName,
        userBody.walletAddress,
        userBody.username,
        userBody.userType,
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
      return new Notice(notice_payload);
    } catch (error) {
      const error_msg = `Failed to create User ${error}`;
      console.debug("Create User", error_msg);
      return new Error_out(error_msg);
    }
  }

  public updateUser(
    currentWalletAddress: string,
    timestamp: number,
    userBody: Partial<User>
  ) {
    try {
      const updateUser = this.getUserByUniqueValue({
        key: "walletAddress",
        value: currentWalletAddress,
      });

      if (!updateUser) {
        return new Error_out(
          `User with wallet ${currentWalletAddress} not found`
        );
      }

      if (
        this.getUserByUniqueValue({
          key: "username",
          value: `${userBody.username}`,
        })
      ) {
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

      // this.fileHelper.writeFile(this.users); // Persist changes to JSON
      const user_json = JSON.stringify(updateUser);

      console.log("Updating User", user_json);
      const notice_payload = `{{"type":"update_user","content":${user_json}}}`;

      return new Notice(notice_payload);
    } catch (error) {
      console.debug("Error updating user", error);
      return new Error_out(`Failed to update user with id ${userBody.id}`);
    }
  }

  public getUsers() {
    try {
      // const users = this.fileHelper.readFile<User>(); // Read directly from file
      // console.log("Get Users from God", JSON.stringify(users));
      const users_json = JSON.stringify(this.users);
      console.log("Users", users_json);
      return new Log(users_json);
    } catch (error) {
      const error_msg = `Failed to get Users ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  }

  public getUser(user_id: number) {
    try {
      let user_json = JSON.stringify(this.users[user_id]);
      console.log("User", user_json);
      return new Log(user_json);
    } catch (error) {
      return new Error_out(`User with id ${user_id} not found`);
    }
  }

  public deleteUser(user_id: number) {
    try {
      const user = this.getUserByUniqueValue({ key: "id", value: user_id });
      if (!user) {
        return new Error_out(`User with id ${user_id} not found`);
      }

      this.users = this.users.filter((user) => user.id !== user_id);

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

  public deleteUsers() {
    try {
      this.users = [];
      console.log("All Users deleted");
      return new Notice(`{{"type":"delete_all_users","content":null }}`);
    } catch (error) {
      console.debug("Error deleting all users", error);
      return new Error_out("Failed to delete all users");
    }
  }
  public getUserByUniqueValue({
    key,
    value,
  }: {
    key: keyof Pick<User, "username" | "walletAddress" | "id">;
    value: User[keyof Pick<User, "username" | "walletAddress" | "id">];
  }) {
    return this.users.find((user) => user[key] === value);
  }
}

export { UserController };
