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

const useLoadSong = (song: Song) => {
  //   const supabaseClient = useSupabaseClient();

  if (!song) {
    return null;
  }

  //   const { data: songData } = supabaseClient.storage
  //     .from("songs")
  //     .getPublicUrl(song.song_path);

  return "/audio/song1.mp3";
};

export default useLoadSong;
