"use client";

import { getDeviceInfo } from "@/lib/getDeviceInfo";
import type React from "react";
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: number;
  album?: string;
  duration: number;
  audioUrl: string;
  imageUrl: string;
}

export interface Playlist {
  id: string;
  title: string;
  tracks: Track[];
}

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  playlist: Track[] | null;
  currentIndex: number;
  playTrack: (track: Track) => void;
  playPlaylist: (playlist: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  buffering: boolean;
  networkStrength: "good" | "medium" | "poor" | "offline";
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};

export const MusicPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Track[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [networkStrength, setNetworkStrength] = useState<
    "good" | "medium" | "poor" | "offline"
  >("good");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [user, setUser] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    let data = localStorage.getItem("xx-mu") as any;
    data = JSON.parse(data) ?? null;
    setUser(data?.user);

    const token = data ? data["tokens"]["token"].access.token : null;
    if (token) {
      socketRef.current = io("http://localhost:8088", {
        path: "/v1/socket.io",
        auth: { token },
        autoConnect: false,
      });

      socketRef.current.connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Track and emit player events
  const emitPlayerEvent = (eventName: string, data?: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(eventName, {
        trackId: currentTrack?.id,
        timestamp: new Date().toISOString(),
        ...data,
      });
    }
  };

  // Monitor network conditions
  useEffect(() => {
    const checkNetworkCondition = () => {
      if (!navigator.onLine) {
        setNetworkStrength("offline");
        return;
      }

      // In a real app, you might use the Network Information API
      // or measure download speeds to determine network strength
      const connection = (navigator as any).connection;

      if (connection) {
        if (connection.effectiveType === "4g") {
          setNetworkStrength("good");
        } else if (connection.effectiveType === "3g") {
          setNetworkStrength("medium");
        } else {
          setNetworkStrength("poor");
        }
      }
    };

    window.addEventListener("online", checkNetworkCondition);
    window.addEventListener("offline", checkNetworkCondition);

    // Some browsers support the connection change event
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", checkNetworkCondition);
    }

    checkNetworkCondition();

    return () => {
      window.removeEventListener("online", checkNetworkCondition);
      window.removeEventListener("offline", checkNetworkCondition);

      if (connection) {
        connection.removeEventListener("change", checkNetworkCondition);
      }
    };
  }, []);

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();

      // Set up event listeners
      audioRef.current.addEventListener("timeupdate", updateProgress);
      audioRef.current.addEventListener("loadedmetadata", updateDuration);
      audioRef.current.addEventListener("ended", handleTrackEnd);
      audioRef.current.addEventListener("error", handleAudioError);
      audioRef.current.addEventListener("play", () =>
        emitPlayerEvent("startPlaying", {
          trackId: currentTrack?.id,
          artistId: currentTrack?.artistId,
          deviceInfo: getDeviceInfo(),
          duration: currentTrack?.duration,
        })
      );
      audioRef.current.addEventListener("pause", () =>
        emitPlayerEvent("pausePlaying")
      );
      audioRef.current.addEventListener("ended", () =>
        emitPlayerEvent("stopPlaying")
      );

      // Add buffering event listeners
      audioRef.current.addEventListener("waiting", handleBufferingStart);
      audioRef.current.addEventListener("canplay", handleBufferingEnd);
      audioRef.current.addEventListener("playing", handleBufferingEnd);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateProgress);
        audioRef.current.removeEventListener("loadedmetadata", updateDuration);
        audioRef.current.removeEventListener("ended", handleTrackEnd);
        audioRef.current.removeEventListener("error", handleAudioError);
        audioRef.current.removeEventListener("play", () =>
          emitPlayerEvent("startPlaying", {
            trackId: currentTrack?.id,
            artistId: currentTrack?.artistId,
            deviceInfo: getDeviceInfo(),
            duration: currentTrack?.duration,
          })
        );
        audioRef.current.removeEventListener("pause", () =>
          emitPlayerEvent("pausePlaying")
        );
        audioRef.current.removeEventListener("ended", () =>
          emitPlayerEvent("stopPlaying")
        );
        audioRef.current.removeEventListener("waiting", handleBufferingStart);
        audioRef.current.removeEventListener("canplay", handleBufferingEnd);
        audioRef.current.removeEventListener("playing", handleBufferingEnd);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleBufferingStart = () => {
    setBuffering(true);
    emitPlayerEvent("bufferingStart");
  };

  const handleBufferingEnd = () => {
    setBuffering(false);
    emitPlayerEvent("bufferingEnd");
  };

  const playAudio = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        emitPlayerEvent("startPlaying", {
          trackId: currentTrack?.id,
          artistId: currentTrack?.artistId,
          deviceInfo: getDeviceInfo(),
          duration: currentTrack?.duration,
        });
      } catch (error: any) {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.warn("Play request was interrupted, retrying...");
          // Retry playback after a short delay
          setTimeout(() => playAudio(), 100);
        } else {
          console.error("Playback error:", error);
          setIsPlaying(false);
          emitPlayerEvent("playback_error", { error: error.message });
        }
      }
    }
  };

  // Update audio source when current track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();

      emitPlayerEvent("track_changed", { trackId: currentTrack.id });

      if (isPlaying) {
        playAudio();
      }
    }
  }, [currentTrack, isPlaying]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      emitPlayerEvent("volume_changed", { volume });
    }
  }, [volume, emitPlayerEvent]);

  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        playAudio();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const updateProgress = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);

      // Emit progress update every 5 seconds
      if (Math.floor(audioRef.current.currentTime) % 5 === 0) {
        emitPlayerEvent("updatePosition", {
          currentTime: audioRef.current.currentTime,
          duration: audioRef.current.duration,
          percentage:
            (audioRef.current.currentTime / audioRef.current.duration) * 100,
        });
      }
    }
  };

  const updateDuration = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnd = () => {
    emitPlayerEvent("stopPlaying");

    if (playlist && playlist.length > 0) {
      nextTrack();
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handleAudioError = (e: Event) => {
    console.error("Audio error:", e);
    setIsPlaying(false);
    emitPlayerEvent("error", { error: (e as ErrorEvent).message });
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setPlaylist([track]);
    setCurrentIndex(0);
    setIsPlaying(true);
    emitPlayerEvent("startPlaying", {
      trackId: track.id,
      artistId: track?.artistId,
      deviceInfo: getDeviceInfo(),
      duration: track?.duration,
    });
  };

  const playPlaylist = (tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;

    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    setIsPlaying(true);
    emitPlayerEvent("play_playlist", {
      playlistLength: tracks.length,
      startTrackId: tracks[startIndex].id,
    });
  };

  const togglePlay = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
      emitPlayerEvent(isPlaying ? "pausePlaying" : "resumePlaying");
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
      emitPlayerEvent("seek", { position: time });
    }
  };

  const nextTrack = () => {
    if (playlist && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
      setIsPlaying(true);
      emitPlayerEvent("next_track");
    } else if (
      playlist &&
      currentIndex === playlist.length - 1 &&
      playlist.length > 1
    ) {
      // Loop back to the first track
      setCurrentIndex(0);
      setCurrentTrack(playlist[0]);
      setIsPlaying(true);
      emitPlayerEvent("playlist_loop");
    }
  };

  const previousTrack = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If current track has played for more than 3 seconds, restart it
      seek(0);
      emitPlayerEvent("restart_track");
    } else if (playlist && currentIndex > 0) {
      // Go to previous track
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
      setIsPlaying(true);
      emitPlayerEvent("previous_track");
    } else if (playlist && playlist.length > 1) {
      // Loop to the last track
      const lastIndex = playlist.length - 1;
      setCurrentIndex(lastIndex);
      setCurrentTrack(playlist[lastIndex]);
      setIsPlaying(true);
      emitPlayerEvent("go_to_last_track");
    }
  };

  const value = {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    playlist,
    currentIndex,
    buffering,
    networkStrength,
    playTrack,
    playPlaylist,
    togglePlay,
    setVolume,
    seek,
    nextTrack,
    previousTrack,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
