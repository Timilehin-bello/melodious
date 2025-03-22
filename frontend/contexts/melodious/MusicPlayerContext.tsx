"use client";

import type React from "react";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import type ReactPlayer from "react-player";
import { io, type Socket } from "socket.io-client";

// Define types for our music track
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  createdAt: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
}

// Define the context state
interface MusicContextState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  volume: number;
  progress: number;
  duration: number;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  addToQueue: (track: Track) => void;
  playerRef: React.RefObject<ReactPlayer>;
  handleProgress: (state: { played: number; playedSeconds: number }) => void;
  handleDuration: (duration: number) => void;
  stopAllAudio: () => void;
}

// Create the context with default values
const MusicContext = createContext<MusicContextState>({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  volume: 0.8,
  progress: 0,
  duration: 0,
  playTrack: () => {},
  pauseTrack: () => {},
  resumeTrack: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
  setVolume: () => {},
  seekTo: () => {},
  addToQueue: () => {},
  playerRef: { current: null },
  handleProgress: () => {},
  handleDuration: () => {},
  stopAllAudio: () => {},
});

// Socket instance
const socket: Socket | null = null;

// Keep track of active audio contexts
const activeAudioContexts: AudioContext[] = [];

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef<ReactPlayer>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // In a real app, you would connect to your actual socket server
    // For this example, we'll simulate the connection
    // socket = io('your-socket-server-audioUrl')
    let data = localStorage.getItem("xx-mu") as any;
    data = JSON.parse(data) ?? null;
    setUser(data?.user);

    const token = data ? data["tokens"]["token"].access.token : null;
    if (token) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
        path: "/v1/socket.io",
        auth: { token },
      });
      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }

    // // Cleanup on unmount
    // return () => {
    //   if (socket) {
    //     socket.disconnect();
    //   }
    // };
  }, []);

  // Enhanced audio control on page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Optionally pause when user leaves the page
        // pauseTrack();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Send tracking data to socket
  useEffect(() => {
    if (currentTrack && socket) {
      socket.emit("track-progress", {
        trackId: currentTrack.id,
        progress,
        timestamp: new Date().toISOString(),
      });
    }
  }, [progress, currentTrack]);

  // Clean up function for audio contexts
  useEffect(() => {
    return () => {
      // Clean up any active audio contexts when component unmounts
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          console.log("Error closing AudioContext:", e);
        }
      }

      // Clean up all tracked audio contexts
      activeAudioContexts.forEach((ctx) => {
        try {
          if (ctx.state !== "closed") {
            ctx.close();
          }
        } catch (e) {
          console.log("Error closing tracked AudioContext:", e);
        }
      });
    };
  }, []);

  const stopAllAudio = () => {
    // Stop all HTML5 audio/video elements
    document.querySelectorAll("audio, video").forEach((el) => {
      if (el instanceof HTMLMediaElement) {
        try {
          el.pause();
          el.currentTime = 0;

          // Optional: remove the src attribute to completely unload the audio
          if (el.src) {
            const currentSrc = el.src;
            el.src = "";
            el.load(); // Force the browser to unload the resource

            // For ReactPlayer in our application, we don't want to remove our current track
            if (currentTrack?.audioUrl !== currentSrc) {
              // only remove external sources
              el.removeAttribute("src");
            }
          }
        } catch (e) {
          console.log("Error stopping media element:", e);
        }
      }
    });

    // Stop all iframes (e.g., YouTube embeds)
    document.querySelectorAll("iframe").forEach((iframe) => {
      try {
        // YouTube specific
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"stopVideo","args":""}',
          "*"
        );

        // Vimeo specific
        iframe.contentWindow?.postMessage('{"method":"pause"}', "*");

        // SoundCloud specific
        iframe.contentWindow?.postMessage('{"method":"pause"}', "*");
      } catch (e) {
        console.log("Error stopping iframe playback:", e);
      }
    });

    // Suspend any existing AudioContext (Web Audio API)
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "running"
    ) {
      try {
        audioContextRef.current.suspend();
      } catch (e) {
        console.log("Error suspending AudioContext:", e);
      }
    }

    // Suspend all tracked audio contexts
    activeAudioContexts.forEach((ctx) => {
      try {
        if (ctx.state === "running") {
          ctx.suspend();
        }
      } catch (e) {
        console.log("Error suspending tracked AudioContext:", e);
      }
    });

    // Create a new AudioContext if needed for our player
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      try {
        const newContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        audioContextRef.current = newContext;
        activeAudioContexts.push(newContext);
      } catch (e) {
        console.log("Error creating new AudioContext:", e);
      }
    } else if (audioContextRef.current.state === "suspended") {
      try {
        // Resume our audio context when needed
        audioContextRef.current.resume();
      } catch (e) {
        console.log("Error resuming AudioContext:", e);
      }
    }
  };

  // Play a track
  const playTrack = (track: Track) => {
    stopAllAudio();
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    // Ensure the ReactPlayer starts playing
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  // Pause the current track
  const pauseTrack = () => {
    setIsPlaying(false);
  };

  // Resume the current track
  const resumeTrack = () => {
    stopAllAudio();
    setIsPlaying(true);
  };

  // Play the next track in queue
  const nextTrack = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      const newQueue = queue.slice(1);
      setQueue(newQueue);
      playTrack(nextTrack);
    }
  };

  // Play the previous track
  const prevTrack = () => {
    // In a real app, you would maintain a history of played tracks
    // For this example, we'll just reset the current track
    if (currentTrack) {
      setProgress(0);
      playTrack(currentTrack);
    }
  };

  // Seek to a specific time
  const seekTo = (time: number) => {
    setProgress(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
  };

  // Add a track to the queue
  const addToQueue = (track: Track) => {
    setQueue([...queue, track]);
  };

  // Update volume
  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
  };

  // Handle progress updates
  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setProgress(state.playedSeconds);
  };

  // Handle duration updates
  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        volume,
        progress,
        duration,
        playTrack,
        pauseTrack,
        resumeTrack,
        nextTrack,
        prevTrack,
        setVolume: updateVolume,
        seekTo,
        addToQueue,
        playerRef,
        handleProgress,
        handleDuration,
        stopAllAudio,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

// Custom hook to use the music context
export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
