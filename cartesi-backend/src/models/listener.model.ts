import { Subscription } from "./subscription.model";
import { SubscriptionLevel } from "../configs/enum";
import { Playlist } from "./playlist.model";

class Listener {
  static nextId = 0;
  id: number;
  subscriptionLevel: SubscriptionLevel;
  playlists: Playlist[];
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

export { Listener };
