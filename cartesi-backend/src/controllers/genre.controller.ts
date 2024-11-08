import { Error_out, Log, Notice } from "cartesi-wallet";
import { Genre } from "../models";
import { Repository } from "../services";

class GenreController {
  public createGenre(genreBody: Genre) {
    try {
      const existingGenre = this.getGenreById(genreBody.id);

      if (existingGenre) {
        return new Error_out(`Genre with id ${genreBody.id} already exists`);
      }

      const existingGenreByName = this.getGenreByName(genreBody.name);

      if (existingGenreByName) {
        return new Error_out(
          `Genre with name ${genreBody.name} already exists`
        );
      }

      const genre = new Genre(
        genreBody.name,
        genreBody.imageUrl,
        genreBody.description,
        genreBody.createdAt,
        genreBody.updatedAt
      );

      Repository.genres.push(genre);
      console.log("Genre created", genre);

      const genre_json = JSON.stringify(genre);
      const notice_payload = `{{"type":"create_genre","content":${genre_json}}}`;

      return new Notice(notice_payload);
    } catch (error) {
      console.debug("Error creating genre", error);
      return new Error_out(`Failed to create genre with id ${genreBody.id}`);
    }
  }

  public updateGenre(genreBody: Genre) {
    console.log("Updating genre", genreBody);

    try {
      const updateGenre = this.getGenreById(genreBody.id);

      console.log("Update genre", updateGenre);
      if (!updateGenre) {
        return new Error_out(`Genre with id ${genreBody.id} not found`);
      }

      const { id, createdAt, ...rest } = genreBody;
      Object.assign(updateGenre, { ...rest });

      console.log("Genre updated", updateGenre);
      const genre_json = JSON.stringify(updateGenre);
      const notice_payload = `{{"type":"update_genre","content":${genre_json}}}`;
      return new Notice(notice_payload);
    } catch (error) {
      return new Error_out(`Failed to update genre with id ${genreBody.id}`);
    }
  }

  public deleteGenre(id: number) {
    try {
      const genre = this.getGenreById(id);
      if (!genre) {
        return new Error_out(`Genre with id ${id} not found`);
      }
      Repository.genres = Repository.genres.filter((genre) => genre.id !== id);
      console.log("Genre deleted", genre);
      const genre_json = JSON.stringify(genre);
      const notice_payload = `{{"type":"delete_genre","content":${genre_json}}}`;
      return new Notice(notice_payload);
    } catch (error) {
      return new Error_out(`Failed to delete genre with id ${id}`);
    }
  }

  public deleteGenres() {
    try {
      Repository.genres = [];
      console.log("All Genres deleted");

      return new Notice(`{{"type":"delete_all_genres","content":null }}`);
    } catch (error) {
      return new Error_out(`Failed to delete all genres`);
    }
  }

  public getGenreByName(name: string) {
    try {
      return Repository.genres.find(
        (genre) => genre.name.toLowerCase() === name.toLowerCase()
      );

      // if (genre) {
      //   return new Log(JSON.stringify(genre));
      // }
      // return new Log(JSON.stringify([]));
    } catch (error) {
      return new Error_out(`Genre with name ${name} not found`);
    }
  }

  public getGenres() {
    try {
      const genre_json = JSON.stringify(Repository.genres);
      console.log("genres", genre_json);
      return new Log(genre_json);
    } catch (error) {
      const error_msg = `Failed to get Genres ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  }

  public getGenre(id: number) {
    try {
      let genre_json = JSON.stringify(this.getGenreById(id));
      console.log("Genre", genre_json);
      return new Log(genre_json);
    } catch (error) {
      return new Error_out(`Genre with id ${id} not found`);
    }
  }

  public getGenreById(id: number) {
    return Repository.genres.find((genre) => genre.id === id);
  }
}
export { GenreController };
