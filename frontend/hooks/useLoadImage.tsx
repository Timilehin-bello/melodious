// import { useSupabaseClient } from "@supabase/auth-helpers-react";

// import { Song } from "@/types";

interface Song {
  id: string;
  user_id: string;
  artist: string;
  title: string;
  song_path: string;
  image_path: string;
}

const useLoadImage = (song: Song) => {
  //   const supabaseClient = useSupabaseClient();

  if (!song) {
    return null;
  }

  //   const { data: imageData } = supabaseClient.storage
  //     .from("images")
  //     .getPublicUrl(song.image_path);

  return "/images/artist.svg";
};

export default useLoadImage;
