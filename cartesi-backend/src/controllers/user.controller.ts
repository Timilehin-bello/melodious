import { Error_out, Log, Notice } from "cartesi-wallet";
import { User } from "../models";
import { UserType } from "../configs/enum";
import { ListenerController } from "./listener.controller";
import { ArtistController } from "./artist.controller";
import { Json } from "../interfaces";
import { RepositoryService } from "../services";

class UserController {
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
        const listener = new ListenerController().createListener({ user });

        user.listener = listener;
        if (!user || !listener) {
          return new Error_out("Failed to create User or Listener");
        }
      } else if (userBody.userType === UserType.ARTIST) {
        console.log("Creating artist");
        const artist = new ArtistController().createArtist({
          user,
          biography: userBody.biography || null,
          socialMediaLinks: userBody.socialMediaLinks || null,
        });

        user.artist = artist;
        if (!user || !artist) {
          return new Error_out("Failed to create User or Artist");
        }
      }

      RepositoryService.users.push(user);

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
    userBody: User & {
      currentWalletAddress: string;
      timestamp: number;
    }
  ) {
    try {
      const updateUser = this.getUserByUniqueValue({
        key: "walletAddress",
        value: userBody.currentWalletAddress,
      });

      if (!updateUser) {
        return new Error_out(
          `User with wallet ${userBody.currentWalletAddress} not found`
        );
      }
      const isUsernameTaken = this.getUserByUniqueValue({
        key: "username",
        value: `${userBody.username}`,
      });

      if (userBody.username && isUsernameTaken) {
        return new Error_out("Username already taken");
      }

      if (
        updateUser?.walletAddress !==
        userBody.currentWalletAddress.toLowerCase()
      ) {
        return new Error_out("Only the user itself can update its details");
      }

      // if(updateUser.artist) {
      //   updateUser.artist.biography = userBody.biography;
      //   updateUser.artist.socialMediaLinks = userBody.socialMediaLinks;
      // }

      const {
        id,
        cartesiTokenBalance,
        walletAddress,
        timestamp,
        updatedAt,
        ...rest
      } = userBody;
      Object.assign(updateUser, {
        ...rest,
        updatedAt: new Date(timestamp * 1000),
      });

      // this.fileHelper.writeFile(RepositoryService.users); // Persist changes to JSON
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
      const users_json = JSON.stringify(RepositoryService.users);
      console.log("Users", users_json);
      return new Log(users_json);
    } catch (error) {
      const error_msg = `Failed to get Users ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  }

  public getUser(userId: number) {
    try {
      const user_json = JSON.stringify(
        this.getUserByUniqueValue({ key: "id", value: userId })
      );
      console.log("User", user_json);
      return new Log(user_json);
    } catch (error) {
      return new Error_out(`User with id ${userId} not found`);
    }
  }

  public getUserByWalletAddress(walletAddress: string) {
    try {
      const user_json = JSON.stringify(
        this.getUserByUniqueValue({
          key: "walletAddress",
          value: walletAddress.toLocaleLowerCase(),
        })
      );
      console.log("User", user_json);
      return new Log(user_json);
    } catch (error) {
      console.debug("Error getting user by wallet address", error);
      return new Error_out(
        `User with wallet address ${walletAddress} not found`
      );
    }
  }

  public deleteUser(userId: number) {
    try {
      const user = this.getUserByUniqueValue({ key: "id", value: userId });
      if (!user) {
        return new Error_out(`User with id ${userId} not found`);
      }

      RepositoryService.users = RepositoryService.users.filter(
        (user) => user.id !== userId
      );

      console.log("User deleted", user);

      const user_json = JSON.stringify(user);
      console.log("Deleting User", user_json);

      const notice_payload = `{{"type":"delete_user","content":${user_json} }}`;

      return new Notice(notice_payload);
    } catch (error) {
      console.debug("Error deleting user", error);
      return new Error_out(`Failed to delete user with id ${userId}`);
    }
  }

  public deleteUsers() {
    try {
      RepositoryService.users = [];
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
    console.log("key", key, "value", value);
    const user = RepositoryService.users.find((user) => user[key] === value);
    return user;
  }
}

export { UserController };
