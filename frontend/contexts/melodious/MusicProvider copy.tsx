"use client";

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
  networkStrength: "good" | "poor" | "medium" | "unstable" | "offline"; // Updated network strength types
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
    "good" | "poor" | "unstable" | "offline"
  >("good"); // Updated network strength types

  const [deviceInfo, setDeviceInfo] = useState({
    type: "desktop",
    browser: "unknown",
    os: "unknown",
    networkType: "unknown",
  });

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

  // Detect device info
  useEffect(() => {
    const detectDeviceInfo = () => {
      const ua = navigator.userAgent;
      const browserInfo = detectBrowser(ua);
      const osInfo = detectOS(ua);
      const deviceType = detectDeviceType(ua);
      const networkType = (navigator as any).connection?.type || "unknown";

      setDeviceInfo({
        type: deviceType,
        browser: browserInfo,
        os: osInfo,
        networkType: networkType,
      });
    };

    detectDeviceInfo();
  }, []);

  const emitSocketEvent = useCallback((eventName: string, payload: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(eventName, payload);
    }
  }, []);

  const playAudio = useCallback(async () => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        emitSocketEvent("startPlaying", {
          trackId: currentTrack.id,
          artistId: currentTrack.artistId,
          deviceInfo: deviceInfo,
          duration: currentTrack.duration,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.warn("Play request was interrupted, retrying...");
          setTimeout(() => playAudio(), 100);
        } else {
          console.error("Playback error:", error);
          setIsPlaying(false);
          emitSocketEvent("playbackError", { error: (error as any).message });
        }
      }
    }
  }, [currentTrack, deviceInfo, emitSocketEvent]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      emitSocketEvent("pausePlaying", {});
    }
  }, [emitSocketEvent]);

  const resumeAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      emitSocketEvent("resumePlaying", {});
    }
  }, [emitSocketEvent]);

  const nextTrack = useCallback(() => {
    if (playlist && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
      setIsPlaying(true);
      emitSocketEvent("skipTrack", {});
    } else if (
      playlist &&
      currentIndex === playlist.length - 1 &&
      playlist.length > 1
    ) {
      setCurrentIndex(0);
      setCurrentTrack(playlist[0]);
      setIsPlaying(true);
      emitSocketEvent("skipTrack", {});
    }
  }, [playlist, currentIndex, emitSocketEvent]);
  // Update audio source when current track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      emitSocketEvent("trackChanged", { trackId: currentTrack.id });
      if (isPlaying) {
        playAudio();
      }
    }
  }, [currentTrack, isPlaying, playAudio, emitSocketEvent]);

  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        playAudio();
      } else {
        pauseAudio();
      }
    }
  }, [isPlaying, playAudio, pauseAudio]);

  // Set up audio event listeners
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const onTimeUpdate = () => {
        setProgress(audio.currentTime);
        emitSocketEvent("updatePosition", Math.round(audio.currentTime * 1000));
      };

      const onDurationChange = () => setDuration(audio.duration);

      const onEnded = () => {
        emitSocketEvent("stopPlaying", {});
        if (playlist && currentIndex < playlist.length - 1) {
          nextTrack();
        } else {
          setIsPlaying(false);
          setProgress(0);
        }
      };

      const onPlay = () => emitSocketEvent("resumePlaying", {});
      const onPause = () => emitSocketEvent("pausePlaying", {});

      const onWaiting = () => {
        setBuffering(true);
        emitSocketEvent("bufferingStart", {});
      };

      const onCanPlay = () => {
        setBuffering(false);
        emitSocketEvent("bufferingEnd", {});
      };

      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("durationchange", onDurationChange);
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("waiting", onWaiting);
      audio.addEventListener("canplay", onCanPlay);

      return () => {
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("durationchange", onDurationChange);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
        audio.removeEventListener("waiting", onWaiting);
        audio.removeEventListener("canplay", onCanPlay);
      };
    }
  }, [emitSocketEvent, nextTrack, playlist, currentIndex]);

  // Monitor network quality
  useEffect(() => {
    const updateNetworkQuality = () => {
      let quality: "good" | "poor" | "unstable" = "good";

      if (!navigator.onLine) {
        quality = "unstable";
      } else if ((navigator as any).connection) {
        const connection = (navigator as any).connection;
        if (connection.downlink < 1 || connection.rtt > 500) {
          quality = "poor";
        } else if (connection.downlink < 5 || connection.rtt > 100) {
          quality = "unstable";
        }
      }

      setNetworkStrength(quality);
      emitSocketEvent("networkQualityUpdate", quality);
    };

    updateNetworkQuality();
    window.addEventListener("online", updateNetworkQuality);
    window.addEventListener("offline", updateNetworkQuality);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateNetworkQuality);
    }

    return () => {
      window.removeEventListener("online", updateNetworkQuality);
      window.removeEventListener("offline", updateNetworkQuality);
      if (connection) {
        connection.removeEventListener("change", updateNetworkQuality);
      }
    };
  }, [emitSocketEvent]);

  const togglePlay = useCallback(() => {
    if (currentTrack) {
      if (isPlaying) {
        pauseAudio();
      } else {
        resumeAudio();
      }
    }
  }, [currentTrack, isPlaying, pauseAudio, resumeAudio]);

  const seek = useCallback(
    (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setProgress(time);
        emitSocketEvent("updatePosition", Math.round(time * 1000));
      }
    },
    [emitSocketEvent]
  );

  const previousTrack = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      seek(0);
    } else if (playlist && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
      setIsPlaying(true);
      emitSocketEvent("skipTrack", {});
    } else if (playlist && playlist.length > 1) {
      const lastIndex = playlist.length - 1;
      setCurrentIndex(lastIndex);
      setCurrentTrack(playlist[lastIndex]);
      setIsPlaying(true);
      emitSocketEvent("skipTrack", {});
    }
  }, [playlist, currentIndex, seek, emitSocketEvent]);

  const handleBufferingStart = () => {
    setBuffering(true);
    emitSocketEvent("bufferingStart", {});
  };

  const handleBufferingEnd = () => {
    setBuffering(false);
    emitSocketEvent("bufferingEnd", {});
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setPlaylist([track]);
    setCurrentIndex(0);
    setIsPlaying(true);
    emitSocketEvent("play_track", { trackId: track.id });
  };

  const playPlaylist = (tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;

    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    setIsPlaying(true);
    emitSocketEvent("play_playlist", {
      playlistLength: tracks.length,
      startTrackId: tracks[startIndex].id,
    });
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

// Helper functions for device detection
function detectBrowser(ua: string): string {
  if (ua.includes("Chrome")) return "chrome";
  if (ua.includes("Firefox")) return "firefox";
  if (ua.includes("Safari")) return "safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "opera";
  if (ua.includes("Edge")) return "edge";
  if (ua.includes("MSIE") || ua.includes("Trident/")) return "ie";
  return "unknown";
}

function detectOS(ua: string): string {
  if (ua.includes("Win")) return "windows";
  if (ua.includes("Mac")) return "macos";
  if (ua.includes("Linux")) return "linux";
  if (ua.includes("Android")) return "android";
  if (ua.includes("iOS")) return "ios";
  return "unknown";
}

function detectDeviceType(ua: string): string {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }
  return "desktop";
}
