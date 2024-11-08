import { AdvanceRoute, DefaultRoute, WalletRoute } from "cartesi-router";
import { Error_out, Output, Report, Notice, Wallet } from "cartesi-wallet";

import { UserController } from "../controllers";

class CreateUserRoute extends AdvanceRoute {
  user: UserController;
  constructor(user: UserController) {
    super();
    this.user = user;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.user.create({
        walletAddress: this.msg_sender,
        createdAt: new Date(request.metadata.timestamp * 1000),
        updatedAt: new Date(request.metadata.timestamp * 1000),
        ...this.request_args,
      });
    } catch (error) {
      const error_msg = `Failed to create user ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class UpdateUserRoute extends AdvanceRoute {
  user: UserController;
  constructor(user: UserController) {
    super();
    this.user = user;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      console.log("Executing Update User request");
      return this.user.updateUser({
        walletAddress: this.msg_sender,
        timestamp: request.metadata.timestamp,
        ...this.request_args,
      });
    } catch (error) {
      const error_msg = `Failed to update message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class DeleteUserRoute extends AdvanceRoute {
  user: UserController;
  constructor(user: UserController) {
    super();
    this.user = user;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.user.deleteUser(parseInt(this.request_args.userId));
    } catch (error) {
      const error_msg = `Failed to delete message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class DeleteUsersRoute extends AdvanceRoute {
  user: UserController;
  constructor(user: UserController) {
    super();
    this.user = user;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    try {
      return this.user.deleteUsers();
    } catch (error) {
      const error_msg = `Failed to delete message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class InspectRoute extends DefaultRoute {
  user: UserController;
  constructor(user: UserController) {
    super();
    this.user = user;
  }
}

class UsersRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.user.getUsers();
  };
}

class UserRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.user.getUser(parseInt(<string>request));
  };
}

export {
  UpdateUserRoute,
  DeleteUserRoute,
  DeleteUsersRoute,
  CreateUserRoute,
  UsersRoute,
  UserRoute,
};
