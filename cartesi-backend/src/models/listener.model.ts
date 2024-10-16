import { Error_out } from "cartesi-wallet";
import { Subscription } from "./subscription.model";
import { User } from "./user.model";
import { SubscriptionLevel } from "../configs/enum";

class Listener {
  static nextId = 0;
  id: number;
  subscriptionLevel: SubscriptionLevel;
  playlists: Playlist[];
  //   favorites: UserFavorites[];
  subscription: Subscription | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    userId: number,
    createdAt: Date,
    updatedAt: Date

    //     favorites: UserFavorites[],
  ) {
    this.id = Listener.nextId++;
    this.userId = userId;
    this.subscriptionLevel = SubscriptionLevel.FREE;
    this.playlists = [];
    this.subscription = null;
    //     this.favorites = favorites || [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

class CreateListener {
  listeners: Listener[];
  constructor() {
    this.listeners = [];
  }

  create(listenerBody: { user: User }) {
    if (this.getListenerByUserId(listenerBody.user.id)) {
      throw new Error_out("Listener with user ID already exists");
    }
    try {
      const listener = new Listener(
        listenerBody.user.id,
        listenerBody.user.createdAt,
        listenerBody.user.updatedAt
      );
      this.listeners.push(listener);
      return listener;
    } catch (error) {
      const error_msg = `Failed to create Listener ${error}`;
      console.debug(error_msg);
      throw new Error_out(error_msg);
    }
  }

  getListenerByUserId(userId: number) {
    return this.listeners.find((listener) => listener.userId === userId);
  }
}

export { Listener, CreateListener };
