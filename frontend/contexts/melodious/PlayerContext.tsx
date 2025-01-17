"use client";
import { getDeviceInfo } from "@/lib/getDeviceInfo";
import { Track } from "@/types";
// Context: PlayerContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

interface PlayerContextProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  volume: number;
  repeat: boolean;
  loop: boolean;
  playlist: (Track | null)[];
  currentIndex: number;
  progress: number;
  favorites: Track[];
  playTrack: (track: Track) => void;
  playPlaylist: (tracks: Track[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleRepeat: () => void;
  toggleLoop: () => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number) => void;
  addToFavorites: (track: Track) => void;
  isFavorite: (track: Track) => boolean;
  emitUpdatePosition: (position: number) => void;
  emitBufferingStart: () => void;
  emitBufferingEnd: () => void;
  emitNetworkQualityUpdate: (quality: string) => void;
  handlePlaybackState: (state: "pause" | "resume" | "stop" | "skip") => void;
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [repeat, setRepeat] = useState(false);
  const [loop, setLoop] = useState(false);
  const [playlist, setPlaylist] = useState<(Track | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [favorites, setFavorites] = useState<Track[]>([]);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // const token = localStorage.getItem("authToken");
    let data = localStorage.getItem("xx-mu") as any;
    //     console.log("token gotten", JSON.parse(data));

    data = JSON.parse(data) ?? null;

    const token = data ? data["tokens"]["token"].access.token : null;
    if (token) {
      const newSocket = io("http://localhost:8088", {
        path: "/v1/socket.io",
        auth: { token },
        // transports: ["websocket"],
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (socket && currentTrack) {
      socket.emit("startPlaying", {
        trackId: currentTrack.id,
        artistId: currentTrack,
        deviceInfo: getDeviceInfo(),
        duration: currentTrack.duration * 1000, // in milliseconds
      });
    }

    return () => {
      if (socket && currentTrack) {
        socket.emit("stopPlaying", {});
      }
    };
  }, [currentTrack, socket]);

  const emitUpdateBuffer = (bufferSize: number) => {
    socket?.emit("updateBuffer", bufferSize); // Buffer size in bytes
  };

  const emitPlaybackState = (state: "pause" | "resume" | "stop" | "skip") => {
    socket?.emit(`${state}Playing`, {});
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          emitUpdatePosition(newProgress); // Emit progress in seconds
          if (newProgress >= currentTrack.duration) {
            clearInterval(interval!);
            setIsPlaying(false); // Stop playback when track ends
            handlePlaybackState("stop");
          }
          return newProgress;
        });
      }, 1000); // Update position every second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack]);

  const playTrack = useCallback((track: Track) => {
    localStorage.setItem("currentTrack", JSON.stringify(track));
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  const playPlaylist = useCallback((tracks: Track[]) => {
    setPlaylist(tracks);
    setCurrentIndex(0);
    setCurrentTrack(tracks[0] || null);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentTrack(playlist[currentIndex + 1]);
      setProgress(0);
    } else if (repeat) {
      setCurrentIndex(0);
      setCurrentTrack(playlist[0]);
      setProgress(0);
    }
  }, [currentIndex, playlist, repeat]);

  const prevTrack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setCurrentTrack(playlist[currentIndex - 1]);
      setProgress(0);
    }
  }, [currentIndex, playlist]);

  const toggleRepeat = useCallback(() => setRepeat((prev) => !prev), []);
  const toggleLoop = useCallback(() => setLoop((prev) => !prev), []);

  const seekTo = useCallback((seconds: number) => {
    setProgress(seconds);
  }, []);

  const addToFavorites = useCallback((track: Track) => {
    setFavorites((prev) =>
      prev.find((t) => t.id === track.id) ? prev : [...prev, track]
    );
  }, []);

  const isFavorite = useCallback(
    (track: Track) => favorites.some((t) => t.id === track.id),
    [favorites]
  );

  const emitUpdatePosition = (position: number) => {
    socket?.emit("updatePosition", position * 1000); // Position in milliseconds
  };

  const emitBufferingStart = () => {
    socket?.emit("bufferingStart", {});
  };

  const emitBufferingEnd = () => {
    socket?.emit("bufferingEnd", {});
  };

  const emitNetworkQualityUpdate = (quality: string) => {
    socket?.emit("networkQualityUpdate", quality);
    toast.success(`Now playing: ${quality}`);
  };

  const handlePlaybackState = (state: "pause" | "resume" | "stop" | "skip") => {
    socket?.emit(`${state}Playing`, {});
  };

  useEffect(() => {
    const cachedTrack = localStorage.getItem("currentTrack");
    if (cachedTrack) {
      setCurrentTrack(JSON.parse(cachedTrack));
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        setIsPlaying,
        volume,
        repeat,
        loop,
        playlist,
        currentIndex,
        progress,
        favorites,
        playTrack,
        playPlaylist,
        togglePlayPause,
        nextTrack,
        prevTrack,
        toggleRepeat,
        toggleLoop,
        setVolume,
        seekTo,
        addToFavorites,
        isFavorite,
        emitUpdatePosition,
        emitBufferingStart,
        emitBufferingEnd,
        emitNetworkQualityUpdate,
        handlePlaybackState,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};
