"use client";

import { useState, useEffect } from "react";

import usePlayer from "@/hooks/usePlayer";
// import useGetSongById from "@/hooks/useGetSongById";

import PlayerContent from "./MusicPlayerContent";
import useLoadSong from "@/hooks/useLoadSong";
import useGetSongById from "@/hooks/useGetSongById";

const MusicPlayer = () => {
  const [volume, setVolume] = useState(1);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [oldVolume, setOldVolume] = useState(1);

  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);
  // const song = {
  //   id: "1",
  //   user_id: "string",
  //   artist: "string",
  //   title: "string",
  //   song_path: "/audio/song1.mp3",
  //   image_path: "/images/artist.svg",
  // };

  const songUrl = useLoadSong(song!);

  useEffect(() => {
    if (isShuffle) {
      player.shuffle(player.unShuffledIds);
    } else {
      player.resetShuffle(player.unShuffledIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShuffle]);

  if (!song || !songUrl || !player.activeId) {
    return null;
  }

  return (
    <div className="fixed bottom-0 bg-[#121212AA] w-full py-2 h-[80px] px-4">
      <PlayerContent
        volume={volume}
        setVolume={setVolume}
        oldVolume={oldVolume}
        setOldVolume={setOldVolume}
        isLoop={isLoop}
        setIsLoop={setIsLoop}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        key={songUrl}
        song={song}
        songUrl={songUrl}
      />
    </div>
  );
};

export default MusicPlayer;
