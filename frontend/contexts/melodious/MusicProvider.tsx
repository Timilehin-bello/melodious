"use client";

import { timeStringToSeconds } from "@/lib/extractDuration";
import type React from "react";
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { io, type Socket } from "socket.io-client";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  imageUrl: string;
  artistId?: string;
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
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
    networkType: string;
  };
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

// Helper function to get device info
const getDeviceInfo = () => {
  if (typeof window === "undefined") {
    return {
      type: "unknown",
      browser: "unknown",
      os: "unknown",
      networkType: "unknown",
    };
  }

  const ua = window.navigator.userAgent;

  // Detect browser
  let browser = "unknown";
  if (ua.includes("Chrome")) browser = "chrome";
  else if (ua.includes("Firefox")) browser = "firefox";
  else if (ua.includes("Safari")) browser = "safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "opera";
  else if (ua.includes("Edge")) browser = "edge";
  else if (ua.includes("MSIE") || ua.includes("Trident/")) browser = "ie";

  // Detect OS
  let os = "unknown";
  if (ua.includes("Win")) os = "windows";
  else if (ua.includes("Mac")) os = "macos";
  else if (ua.includes("Linux")) os = "linux";
  else if (ua.includes("Android")) os = "android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "ios";

  // Detect device type
  let type = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    type = "tablet";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    type = "mobile";
  }

  // Get network info if available
  const networkType = (navigator as any).connection?.effectiveType || "unknown";

  return { type, browser, os, networkType };
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
  const [deviceInfo, setDeviceInfo] = useState({
    type: "unknown",
    browser: "unknown",
    os: "unknown",
    networkType: "unknown",
  });

  // Update device info after mount
  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Initialize socket connection
  useEffect(() => {
    try {
      const data = localStorage.getItem("xx-mu");
      if (!data) return;

      const parsedData = JSON.parse(data);
      if (!parsedData) return;

      const token = parsedData.tokens?.token?.access?.token;
      if (!token) return;

      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
        path: "/v1/socket.io",
        auth: { token },
        autoConnect: false,
      });

      if (currentTrack) {
        socketRef.current.connect();
      }

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error("Failed to initialize socket:", error);
    }
  }, [currentTrack]);

  // Emit socket event helper
  const emitSocketEvent = useCallback(
    (eventName: string, data?: any) => {
      console.log(
        `Before condition ${eventName} event emitted with data:`,
        data
      );
      if (socketRef.current) {
        console.log(`${eventName} event emitted with data:`, data);
        socketRef.current.emit(eventName, {
          trackId: currentTrack?.id,
          artistId: currentTrack?.artistId,
          duration: timeStringToSeconds(String(currentTrack?.duration)),
          timestamp: new Date().toISOString(),
          deviceInfo: deviceInfo,
          ...data,
        });
      }
    },
    [currentTrack, deviceInfo]
  );

  // Monitor network conditions
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkNetworkCondition = () => {
      if (!window.navigator.onLine) {
        setNetworkStrength("offline");
        return;
      }

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

  // Handle playing audio with proper promise handling
  // const playAudio = useCallback(async () => {
  //   if (!audioRef.current || !currentTrack) return;

  //   try {
  //     // Cancel any existing play promise to avoid conflicts
  //     if (playPromiseRef.current) {
  //       await playPromiseRef.current.catch(() => {});
  //     }

  //     // Start a new play attempt and store the promise
  //     playPromiseRef.current = audioRef.current.play();
  //     await playPromiseRef.current;

  //     setIsPlaying(true);
  //     emitSocketEvent("startPlaying", {
  //       trackId: currentTrack.id,
  //       artistId: currentTrack.artistId,
  //       duration: currentTrack.duration,
  //       deviceInfo: deviceInfo,
  //     });
  //   } catch (error) {
  //     if (error instanceof DOMException && error.name === "AbortError") {
  //       console.warn("Play request was interrupted");
  //       // Don't retry automatically to avoid loop
  //     } else if (
  //       error instanceof DOMException &&
  //       error.name === "NotAllowedError"
  //     ) {
  //       console.warn("Playback not allowed without user interaction");
  //       setIsPlaying(false);
  //     } else {
  //       console.error("Playback error:", error);
  //       setIsPlaying(false);
  //       emitSocketEvent("playbackError", { error: (error as any).message });
  //     }
  //   } finally {
  //     playPromiseRef.current = null;
  //   }
  // }, [currentTrack, emitSocketEvent]);

  // Update the playAudio function to distinguish between initial play and resume
  const playAudio = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);

        // Check if this is a resume (progress > 0) or a new start
        if (audioRef.current.currentTime > 1) {
          emitSocketEvent("resumePlaying", {
            trackId: currentTrack?.id,
            position: audioRef.current.currentTime,
            deviceInfo: getDeviceInfo(),
          });
        } else {
          emitSocketEvent("startPlaying", {
            trackId: currentTrack?.id,
            artistId: currentTrack?.artistId,
            deviceInfo: getDeviceInfo(),
            duration: timeStringToSeconds(String(currentTrack?.duration)),
          });
        }
      } catch (error: any) {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.warn("Play request was interrupted, retrying...");
          // Retry playback after a short delay
          setTimeout(() => playAudio(), 100);
        } else {
          console.error("Playback error:", error);
          setIsPlaying(false);
          emitSocketEvent("playback_error", { error: error.message });
        }
      }
    }
  }, [currentTrack, emitSocketEvent]);

  // Pause audio safely
  const pauseAudio = useCallback(() => {
    if (!audioRef.current) return;

    // Make sure any pending play promise is resolved first
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          audioRef.current?.pause();
          setIsPlaying(false);
          emitSocketEvent("pausePlaying");
        })
        .catch(() => {
          // If the play promise was rejected, we can still try to pause
          audioRef.current?.pause();
          setIsPlaying(false);
        });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
      emitSocketEvent("pausePlaying");
    }
  }, [emitSocketEvent]);

  // Update audio source ONLY when current track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const shouldLoad =
        currentTrack.id !== audioRef.current.dataset.currentTrackId;

      if (shouldLoad) {
        audioRef.current.src = currentTrack.audioUrl;
        audioRef.current.load();
        audioRef.current.dataset.currentTrackId = currentTrack.id;
        emitSocketEvent("track_changed", { trackId: currentTrack.id });
        // When a new track is loaded, we should also reset the progress
        setProgress(0);
      }

      if (isPlaying) {
        playAudio();
      }
    }
  }, [currentTrack, emitSocketEvent, setProgress]);

  // Handle play/pause state changes separately
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        playAudio();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, playAudio]);

  // Play next track
  const nextTrack = useCallback(() => {
    if (!playlist || playlist.length === 0) return;

    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
      setIsPlaying(true);
      emitSocketEvent("skipTrack");
    } else if (playlist.length > 1) {
      // Loop back to first track
      setCurrentIndex(0);
      setCurrentTrack(playlist[0]);
      setIsPlaying(true);
      emitSocketEvent("playlistLoop");
    }
  }, [playlist, currentIndex, emitSocketEvent]);

  // Set up audio event listeners
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);

      // Only emit position updates at sensible intervals (e.g., every 5 seconds)
      // if (Math.floor(audio.currentTime) % 5 === 0) {
      //   emitSocketEvent("updatePosition", {
      //     currentTime: audio.currentTime,
      //     duration: audio.duration,
      //     percentage: (audio.currentTime / audio.duration) * 100,
      //   });
      // }
    };

    const onDurationChange = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      emitSocketEvent("stopPlaying");

      if (playlist && currentIndex < playlist.length - 1) {
        nextTrack();
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    const onWaiting = () => {
      setBuffering(true);
      // emitSocketEvent("bufferingStart");
    };

    const onCanPlay = () => {
      setBuffering(false);
      // emitSocketEvent("bufferingEnd");
    };

    const onError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
      emitSocketEvent("playbackError", { error: "Audio playback error" });
    };

    // Add all event listeners
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("playing", onCanPlay);
    audio.addEventListener("error", onError as any);

    return () => {
      // Remove all event listeners
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("playing", onCanPlay);
      audio.removeEventListener("error", onError as any);
    };
  }, [emitSocketEvent, nextTrack, playlist, currentIndex]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      emitSocketEvent("volumeChanged", { volume });
    }
  }, [volume, emitSocketEvent]);

  // // Handle play/pause state changes
  // useEffect(() => {
  //   if (!audioRef.current) return;

  //   if (isPlaying) {
  //     playAudio();
  //   } else {
  //     pauseAudio();
  //   }
  // }, [isPlaying, playAudio, pauseAudio]);

  // Toggle play/pause
  // const togglePlay = useCallback(() => {
  //   if (!currentTrack) return;

  //   if (isPlaying) {
  //     pauseAudio();
  //   } else {
  //     playAudio();
  //   }
  // }, [isPlaying, pauseAudio, playAudio, currentTrack]);

  // Update the togglePlay function
  const togglePlay = () => {
    if (currentTrack) {
      if (isPlaying) {
        // Pause the playback
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        emitSocketEvent("pausePlaying");
      } else {
        // Resume or start the playback
        playAudio();
      }
    }
  };

  // Seek to position
  const seek = useCallback(
    (time: number) => {
      if (!audioRef.current) return;

      audioRef.current.currentTime = time;
      setProgress(time);
      emitSocketEvent("seek", { position: time });
    },
    [emitSocketEvent]
  );

  // Play previous track
  const previousTrack = useCallback(() => {
    if (!audioRef.current || !playlist || playlist.length === 0) return;

    if (audioRef.current.currentTime > 3) {
      // If current track has played for more than 3 seconds, restart it
      seek(0);
      emitSocketEvent("restartTrack");
    } else if (currentIndex > 0) {
      // Go to previous track
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
      setIsPlaying(true);
      emitSocketEvent("previousTrack");
    } else if (playlist.length > 1) {
      // Loop to last track
      const lastIndex = playlist.length - 1;
      setCurrentIndex(lastIndex);
      setCurrentTrack(playlist[lastIndex]);
      setIsPlaying(true);
      emitSocketEvent("goToLastTrack");
    }
  }, [playlist, currentIndex, seek, emitSocketEvent]);

  // Play a single track
  const playTrack = useCallback(
    (track: Track) => {
      // Only update if it's a different track
      if (track.id !== currentTrack?.id) {
        setCurrentTrack(track);
        setPlaylist([track]);
        setCurrentIndex(0);
        // Reset the audio currentTime when playing a new track
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      }
      setIsPlaying(true);
    },
    [currentTrack]
  );

  // Play a playlist
  const playPlaylist = useCallback(
    (tracks: Track[], startIndex = 0) => {
      console.log("Playing playlist:", tracks, startIndex);
      if (tracks.length === 0) return;
      setPlaylist(tracks);
      setCurrentIndex(startIndex);
      setCurrentTrack(tracks[startIndex]);
      setIsPlaying(true);
      emitSocketEvent("playPlaylist", {
        playlistLength: tracks.length,
        startTrackId: tracks[startIndex].id,
        startTrackTitle: tracks[startIndex].title,
      });
    },
    [emitSocketEvent]
  );

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
    deviceInfo,
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
