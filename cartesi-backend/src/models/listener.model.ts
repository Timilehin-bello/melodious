import { Subscription } from "./subscription.model";
import { User } from "./user.model";

class Listener {
  static nextId = 0;
  id: number;
  subscriptionLevel: SubscriptionLevel;
  playlists: Playlist[];
  //   favorites: UserFavorites[];
  subscription: Subscription | null;
  user: User;
  userId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    user: User,
    userId: number,
    subscriptionLevel: SubscriptionLevel
    //     favorites: UserFavorites[],
  ) {
    this.id = Listener.nextId++;
    this.user = user;
    this.userId = userId;
    this.subscriptionLevel = subscriptionLevel || SubscriptionLevel.FREE;
    this.playlists = [];
    this.subscription = null;
    //     this.favorites = favorites || [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export { Listener };
