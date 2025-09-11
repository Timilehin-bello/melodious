import { Error_out, Log, Notice } from "cartesi-wallet";
import { Genre } from "../models";
import { RepositoryService } from "../services";

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

      RepositoryService.genres.push(genre);
      console.log("Genre created", genre);

      // Create repository notice with genre creation data
      const repositoryNotice = RepositoryService.createRepositoryNotice("genre_created", genre);
      
      // Also create specific genre notice
      const genreNotice = RepositoryService.createDataNotice("genres", "created", genre);
      
      return repositoryNotice;
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
      
      // Create repository notice with genre update data
      const repositoryNotice = RepositoryService.createRepositoryNotice("genre_updated", updateGenre);
      
      // Also create specific genre notice
      const genreNotice = RepositoryService.createDataNotice("genres", "updated", updateGenre);
      
      return repositoryNotice;
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
      RepositoryService.genres = RepositoryService.genres.filter(
        (genre) => genre.id !== id
      );
      console.log("Genre deleted", genre);
      
      // Create repository notice with genre deletion data
      const repositoryNotice = RepositoryService.createRepositoryNotice("genre_deleted", genre);
      
      // Also create specific genre notice
      const genreNotice = RepositoryService.createDataNotice("genres", "deleted", genre);
      
      return repositoryNotice;
    } catch (error) {
      return new Error_out(`Failed to delete genre with id ${id}`);
    }
  }

  public deleteGenres() {
    try {
      const deletedCount = RepositoryService.genres.length;
      RepositoryService.genres = [];
      console.log("All Genres deleted");

      // Create repository notice for bulk deletion
      const repositoryNotice = RepositoryService.createRepositoryNotice("all_genres_deleted", { deletedCount });
      
      return repositoryNotice;
    } catch (error) {
      return new Error_out(`Failed to delete all genres`);
    }
  }

  public getGenreByName(name: string) {
    try {
      return RepositoryService.genres.find(
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
      const genre_json = JSON.stringify(RepositoryService.genres);
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
    return RepositoryService.genres.find((genre) => genre.id === id);
  }
}
export { GenreController };
