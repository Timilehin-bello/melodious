import { AdvanceRoute, DefaultRoute } from "cartesi-router";
import { GenreController } from "../controllers";
import { Error_out } from "cartesi-wallet";

class CreateGenreRoute extends AdvanceRoute {
  genre: GenreController;

  constructor(genre: GenreController) {
    super();
    this.genre = genre;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.genre.createGenre({
        createdAt: new Date(request.metadata.timestamp * 1000),
        updatedAt: new Date(request.metadata.timestamp * 1000),
        ...this.request_args,
      });
    } catch (error) {
      const error_msg = `Failed to create genre ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class UpdateGenreRoute extends AdvanceRoute {
  genre: GenreController;

  constructor(genre: GenreController) {
    super();
    this.genre = genre;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      console.log("Executing Update genre request");
      return this.genre.updateGenre({
        updatedAt: new Date(request.metadata.timestamp * 1000),
        ...this.request_args,
      });
    } catch (error) {
      const error_msg = `Failed to update message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}
class DeleteGenreRoute extends AdvanceRoute {
  genre: GenreController;
  constructor(genre: GenreController) {
    super();
    this.genre = genre;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.genre.deleteGenre(parseInt(this.request_args.id));
    } catch (error) {
      const error_msg = `Failed to delete message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class DeleteGenresRoute extends AdvanceRoute {
  genre: GenreController;

  constructor(genre: GenreController) {
    super();
    this.genre = genre;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.genre.deleteGenres();
    } catch (error) {
      const error_msg = `Failed to delete message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class InspectRoute extends DefaultRoute {
  genre: GenreController;

  constructor(genre: GenreController) {
    super();
    this.genre = genre;
  }
}

class GenresRoute extends InspectRoute {
  public execute = (request: any) => {
    return this.genre.getGenres();
  };
}

class GenreRoute extends InspectRoute {
  public execute = (request: any) => {
    return this.genre.getGenre(parseInt(<string>request));
  };
}

export {
  CreateGenreRoute,
  UpdateGenreRoute,
  DeleteGenreRoute,
  DeleteGenresRoute,
  GenresRoute,
  GenreRoute,
};
