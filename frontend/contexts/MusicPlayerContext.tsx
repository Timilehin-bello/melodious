"use client";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

type Track = {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  src: string;
  duration: number;
};

type MusicPlayerContextType = {
  playlist: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export const MusicPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [playlist] = useState<Track[]>([
    {
      id: "1",
      title: "Song One",
      artist: "Artist One",
      coverImage: "/cover1.jpg",
      src: "/audio/song1.mp3",
      duration: 180,
    },
    {
      id: "2",
      title: "Song Two",
      artist: "Artist Two",
      coverImage: "/cover2.jpg",
      src: "/audio/song2.mp3",
      duration: 200,
    },
    {
      id: "2",
      title: "Song three",
      artist: "Artist Three",
      coverImage: "/cover2.jpg",
      src: "/audio/song3.mp3",
      duration: 200,
    },
  ]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(playlist[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.src;
      audioRef.current.play();
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const currentIndex = playlist.findIndex(
      (track) => track.id === currentTrack?.id
    );
    let nextIndex = currentIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (repeat && currentIndex === playlist.length - 1) {
      nextIndex = 0;
    }
    if (nextIndex < playlist.length) {
      playTrack(playlist[nextIndex]);
    }
  };

  const prevTrack = () => {
    const currentIndex = playlist.findIndex(
      (track) => track.id === currentTrack?.id
    );
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      playTrack(playlist[prevIndex]);
    }
  };

  const toggleShuffle = () => setShuffle((prev) => !prev);

  const toggleRepeat = () => setRepeat((prev) => !prev);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play();
    }
  }, [currentTrack]);

  const contextValue = {
    playlist,
    currentTrack,
    isPlaying,
    volume,
    shuffle,
    repeat,
    audioRef,
    playTrack,
    togglePlayPause,
    nextTrack,
    prevTrack,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};
