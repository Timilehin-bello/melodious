import { Error_out } from "cartesi-wallet";
import { Listener } from "../models";
import { User } from "../models/user.model";
import { RepositoryService } from "../services";

class ListenerController {
  createListener(listenerBody: { user: User }) {
    if (this.getListenerByUserId(listenerBody.user.id)) {
      throw new Error_out("Listener with user ID already exists");
    }
    try {
      const listener = new Listener(
        listenerBody.user.id,
        listenerBody.user.createdAt,
        listenerBody.user.updatedAt
      );
      RepositoryService.listeners.push(listener);
      return listener;
    } catch (error) {
      const error_msg = `Failed to create Listener ${error}`;
      console.debug(error_msg);
      throw new Error_out(error_msg);
    }
  }

  getListenerByUserId(userId: number) {
    return RepositoryService.listeners.find(
      (listener) => listener.userId === userId
    );
  }
}

export { ListenerController };
