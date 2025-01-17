// import { Song } from "@/types";

// import { useUser } from "./useUser";
import usePlayer from "./usePlayer";
// import useAuthModal from "./useAuthModal";
// import useSubscribeModal from "./useSubscribeModal";

export interface Song {
  id: string;
  user_id: string;
  artist: string;
  title: string;
  song_path: string;
  image_path: string;
}

const useOnPlay = (songs: Song[]) => {
  const { setId, setIds, setUnshuffledIds } = usePlayer();

  //   const authModal = useAuthModal();
  //   const subscribeModal = useSubscribeModal();
  //   const { user, subscription } = useUser();

  const onPlay = (id: string) => {
    // if (!user) {
    //   return authModal.onOpen();
    // }

    // if (!subscription) {
    //   return subscribeModal.onOpen();
    // }

    setId(id);
    const ids = songs.map((song) => song.id);
    setIds(ids);
    setUnshuffledIds(ids);
  };

  return onPlay;
};

export default useOnPlay;
