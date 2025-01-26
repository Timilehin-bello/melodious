import fetchMethod from "@/lib/readState";
import { useState, useEffect, useMemo } from "react";
// import { useSessionContext } from "@supabase/auth-helpers-react";
// import { Song } from "@/types";
import { toast } from "react-hot-toast";

interface UseGetSongById {
  isLoading: boolean;
  song: any | undefined;
  error: Error | undefined;
}

const useGetSongById = (id?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<any | undefined>();

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);

    const fetchSong = async () => {
      const data = await fetchMethod(`get_track/${id}`);
      //   if (error) {
      //     setIsLoading(false);
      //     return toast.error(error.message);
      // //   }

      if (data) {
        const newData = {
          id: data.id,
          song_path: data.audioUrl,
          title: data.title,
          image_path: data.imageUrl,
        };
        setSong(newData);
        setIsLoading(false);
      } else {
      }

      try {
        const data = await fetchMethod(`get_track/${id}`);
        //   if (error) {
        //     setIsLoading(false);
        //     return toast.error(error.message);
        // //   }

        if (data) {
          const newData = {
            id: data.id,
            song_path: data.audioUrl,
            title: data.title,
            image_path: data.imageUrl,
          };
          setSong(newData);
          setIsLoading(false);
        }
      } catch (error: any) {
        setIsLoading(false);
        return toast.error(error.message);
      }
    };

    fetchSong();
  }, [id]);

  return useMemo(() => ({ isLoading, song }), [isLoading, song]);
};

export default useGetSongById;
