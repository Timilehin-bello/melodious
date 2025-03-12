"use client";

import { Track } from "@/contexts/melodious/MusicProvider";
import { Play } from "lucide-react";

// import { Song } from "@/types";
export interface Song {
  id: string;
  user_id: string;
  artist: string;
  title: string;
  song_path: string;
  image_path: string;
}

interface PlayButtonProps {
  data: Track;
  onClick: (song: Track, id: string) => void;
}

const PlayButton = ({ onClick, data }: PlayButtonProps) => {
  return (
    <button
      className="transition opacity-0 rounded-full flex items-center bg-slate-500 
      p-4 drop-shadow-md translate translate-y-1/4 group-hover:opacity-100 
      group-hover:translate-y-0 hover:scale-110"
      onClick={() => onClick(data, data.id)}
    >
      <Play className="text-black" />
    </button>
  );
};

export default PlayButton;
