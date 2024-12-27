import { FavouriteType } from "../configs/enum";
import { Listener } from "./listener.model";

class UserFavorites {
  static nextId = 1;
  id: number;
  favoriteType: FavouriteType;
  itemId: number;
  listener: Listener;
  listenerId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    favoriteType: FavouriteType,
    itemId: number,
    listener: Listener,
    listenerId: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = UserFavorites.nextId++;
    this.favoriteType = favoriteType || FavouriteType.TRACK;
    this.itemId = itemId;
    this.listener = listener;
    this.listenerId = listenerId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}

export { UserFavorites };
