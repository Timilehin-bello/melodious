import { Album } from "../models";

class AlbumController {
  albums: Album[];

  constructor() {
    this.albums = [];
  }

  create(albumBody: Album) {}
}

export { AlbumController };
