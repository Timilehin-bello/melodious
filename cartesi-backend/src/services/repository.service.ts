import { Album, Artist, Genre, Listener, Track, User } from "../models";

class Repository {
  static users: User[] = [];
  static albums: Album[] = [];
  static genres: Genre[] = [];
  static tracks: Track[] = [];
  static artists: Artist[] = [];
  static listeners: Listener[] = [];
}

export { Repository };
