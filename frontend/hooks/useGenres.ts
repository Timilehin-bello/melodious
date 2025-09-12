import { useMemo } from "react";
import { useRepositoryData } from "./useNoticesQuery";

export interface Genre {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook to get all genres from repository notices
 * @returns Object containing genres array, loading state, error state, and utility functions
 */
export function useGenres() {
  const {
    genres: genresFromRepository,
    isLoading,
    isError,
    error,
    refetch,
  } = useRepositoryData();

  const genres = useMemo(() => {
    // Use genres directly from repository data
    return genresFromRepository || [];
  }, [genresFromRepository]);

  return {
    genres,
    isLoading,
    isError,
    error,
    refetch,
    // Utility functions
    getGenreById: (id: number) =>
      genres.find((genre: Genre) => genre.id === id),
    getGenreByName: (name: string) =>
      genres.find(
        (genre: Genre) => genre.name.toLowerCase() === name.toLowerCase()
      ),
    hasGenres: genres.length > 0,
  };
}

/**
 * Hook to get a specific genre by ID
 * @param id Genre ID to fetch
 * @returns Object containing genre data, loading state, and error state
 */
export function useGenreById(id: number | undefined) {
  const { genres, isLoading, isError, error, refetch } = useGenres();

  const genre = useMemo(() => {
    if (!id || !genres.length) return null;
    return genres.find((g: Genre) => g.id === id) || null;
  }, [id, genres]);

  return {
    genre,
    isLoading,
    isError,
    error,
    refetch,
    genreExists: !!genre,
  };
}

/**
 * Hook to get genres by name pattern
 * @param namePattern Pattern to match genre names (case-insensitive)
 * @returns Object containing matching genres, loading state, and error state
 */
export function useGenresByName(namePattern: string) {
  const { genres, isLoading, isError, error, refetch } = useGenres();

  const matchingGenres = useMemo(() => {
    if (!namePattern || !genres.length) return [];
    const pattern = namePattern.toLowerCase();
    return genres.filter((genre: Genre) =>
      genre.name.toLowerCase().includes(pattern)
    );
  }, [namePattern, genres]);

  return {
    genres: matchingGenres,
    isLoading,
    isError,
    error,
    refetch,
    hasMatches: matchingGenres.length > 0,
  };
}
