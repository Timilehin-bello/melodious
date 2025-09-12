import { useTrackById } from "@/hooks/useTracks";
import { useMemo } from "react";
import { toast } from "react-hot-toast";

interface UseGetSongById {
  isLoading: boolean;
  song: any | undefined;
  error: Error | undefined;
}

const useGetSongById = (id?: string) => {
  const trackId = id ? parseInt(id, 10) : undefined;
  const { track, isLoading, isError, error } = useTrackById(trackId);

  const song = useMemo(() => {
    if (!track) return undefined;

    return {
      id: track.id,
      song_path: track.audioUrl,
      title: track.title,
      image_path: track.imageUrl,
    };
  }, [track]);

  return {
    isLoading,
    song,
    error: isError ? error : undefined,
  };
};

export default useGetSongById;
