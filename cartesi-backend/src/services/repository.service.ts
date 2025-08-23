import * as Model from "../models";

class RepositoryService {
  static users: Model.User[] = [];
  static albums: Model.Album[] = [];
  static genres: Model.Genre[] = [];
  static tracks: Model.Track[] = [];
  static artists: Model.Artist[] = [];
  static listeners: Model.Listener[] = [];
  static config: Model.Config | null = null;
}

export { RepositoryService };
