"use client";

import { useState, useRef, useEffect, SetStateAction } from "react";
import ReactPlayer from "react-player";
import {
  BsPauseFill,
  BsPlayFill,
  BsRepeat,
  BsRepeat1,
  BsShuffle,
  BsArrowRight,
} from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";

// import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

// import PlayerModal from "./modals/PlayerModal";
import usePlayerModal from "@/hooks/usePlayerModal";
import Slider from "./Slider";
import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Seekbar from "./Seekbar";
import { useMelodiousContext } from "@/contexts/melodious";
import { DeviceInfo, getDeviceInfo } from "@/lib/getDeviceInfo";

export interface Song {
  id: string;
  user_id: string;
  artist: string;
  title: string;
  song_path: string;
  image_path: string;
}

interface PlayerContentProps {
  volume: number;
  setVolume: (vol: number) => void;
  oldVolume: number;
  setOldVolume: (vol: number) => void;
  isLoop: boolean;
  setIsLoop: (val: boolean) => void;
  isShuffle: boolean;
  setIsShuffle: (val: boolean) => void;
  song: Song;
  songUrl: string;
}

type StartPlayingPayload = {
  trackId: number;
  artistId: number;
  deviceInfo: DeviceInfo;
  duration: number;
};

type NetworkQualityPayload = "good" | "poor" | "unstable";

const MusicPlayerContent = ({
  volume,
  setVolume,
  oldVolume,
  setOldVolume,
  isLoop,
  setIsLoop,
  isShuffle,
  setIsShuffle,
  song,
  songUrl,
}: PlayerContentProps) => {
  const player = usePlayer();
  const playerRef = useRef<ReactPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [songDuration, setSongDuration] = useState("");
  const [playedDuration, setPlayedDuration] = useState("");
  const { playing, setPlaying } = useMelodiousContext();
  // const { sendEvent } = useMelodiousContext();
  const [position, setPosition] = useState(0);
  const [bufferSize, setBufferSize] = useState(0);
  const [networkQuality, setNetworkQuality] =
    useState<NetworkQualityPayload>("good");

  const { socket, isConnected, connect, setConditionFulfilled } =
    useMelodiousContext();

  // Set up socket event listeners
  // useEffect(() => {
  //   // Example: Only allow socket in chat route
  //   setConditionFulfilled(true);

  //   let data = localStorage.getItem("xx-mu") as any;
  //   //     console.log("token gotten", JSON.parse(data));

  //   data = JSON.parse(data) ?? null;
  //   const url = "http://localhost:8088";

  //   // console.log("error", data);
  //   const token = data ? data["tokens"]["token"].access.token : null;
  //   // Example: Connect with token from storage
  //   // const token = localStorage.getItem("authToken");
  //   if (token) {
  //     connect(token);
  //   }

  //   if (!socket) return;

  //   // Handle incoming messages
  //   const handleStartPlaying = () => {
  //     const payload: StartPlayingPayload = {
  //       trackId: 1,
  //       artistId: 1,
  //       deviceInfo: getDeviceInfo(),
  //       duration: 180000,
  //     };

  //     // sendEvent({ event: "startPlaying", payload });
  //   };

  //   // Subscribe to events
  //   socket.on("startPlaying", handlePlay);

  //   // Cleanup subscriptions
  //   return () => {
  //     socket.off("startPlaying", handlePlay);

  //     setConditionFulfilled(false);
  //   };
  // }, [socket]);

  const { onOpen } = usePlayerModal();

  const handlePlay = () => {
    console.log("playing", playing);
    if (!isPlaying) {
      setIsPlaying(true);

      setPlaying(true);

      if (playing) {
        console.log("is playing", playing);
      }
    } else {
      setIsPlaying(false);
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    if (volume !== 0) {
      setOldVolume(volume);
      setVolume(0);
    } else {
      setVolume(oldVolume);
    }
  };

  // Play Previous Song
  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(previousSong);
  };

  // Play Next Song
  const onPlayNext = (clicked = false) => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    let nextSong: string;

    if (isLoop && !clicked) {
      nextSong = player.ids[currentIndex];
      playerRef.current?.seekTo(0);
      setIsPlaying(true);
    } else {
      nextSong = player.ids[currentIndex + 1];
    }

    if (!nextSong) {
      return player.setId(player.ids[0]);
    }

    return player.setId(nextSong);
  };

  // Toggle Loop
  const onLoop = () => {
    if (isLoop) {
      setIsLoop(false);
    } else {
      setIsLoop(true);
    }
  };

  // Toggle Shuffle
  const onShuffle = () => {
    if (isShuffle) {
      setIsShuffle(false);
    } else {
      setIsShuffle(true);
    }
  };

  // Update PlayedDuration
  const onProgress = (played: number, playedSeconds: number) => {
    const minutes = Math.floor(playedSeconds / 60);
    const seconds = Math.round(playedSeconds - minutes * 60);
    setPlayedDuration(
      `${minutes}:${seconds.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`
    );
    setSeek(played);
  };

  // Update Song Duration
  const onDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration - minutes * 60);
    setSongDuration(
      `${minutes}:${seconds.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`
    );
  };

  useEffect(() => {
    setIsPlaying(true);

    return () => {
      setIsPlaying(false);
    };
  }, []);

  // Player Icons
  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  return (
    <>
      <div className="flex justify-between h-full w-full md:hidden">
        <div className="flex w-full justify-start" onClick={onOpen}>
          <div className="flex items-center w-[230px]">
            <MediaItem data={song} />
            <LikeButton songId={song.id} />
          </div>
        </div>

        <div className="flex gap-x-4 items-center">
          <VolumeIcon
            onClick={toggleMute}
            className="cursor-pointer"
            size={25}
          />
          <div
            onClick={handlePlay}
            className="h-10 w-10 flex items-center justify-center rounded-full 
            bg-white p-1 cursor-pointer"
          >
            <Icon size={30} className="text-black" />
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:flex-row h-full w-full">
        <div className="flex w-full justify-start">
          <div className="flex items-center justify-start w-[230px]">
            <MediaItem data={song} />
            <LikeButton songId={song.id} />
          </div>
        </div>

        <div className="flex flex-col justify-between items-center h-full w-full">
          <div className="flex justify-center items-center w-full max-w-[722px] gap-x-4">
            {!isShuffle ? (
              <BsArrowRight
                size={23}
                onClick={onShuffle}
                className="text-neutral-400 cursor-pointer hover:text-white transition"
              />
            ) : (
              <BsShuffle
                size={23}
                onClick={onShuffle}
                className="text-neutral-400 cursor-pointer hover:text-white transition"
              />
            )}

            <AiFillStepBackward
              onClick={onPlayPrevious}
              size={30}
              className="text-neutral-400 cursor-pointer hover:text-white transition"
            />
            <div
              onClick={handlePlay}
              className="flex items-center justify-center h-10 w-10 rounded-full 
          bg-white p-1 cursor-pointer hover:scale-110"
            >
              <Icon size={30} className="text-black" />
            </div>
            <AiFillStepForward
              onClick={() => {
                onPlayNext(true);
              }}
              size={30}
              className="text-neutral-400 cursor-pointer hover:text-white transition"
            />
            {isLoop ? (
              <BsRepeat1
                onClick={onLoop}
                size={23}
                className="text-white cursor-pointer hover:text-white transition"
              />
            ) : (
              <BsRepeat
                onClick={onLoop}
                size={23}
                className="text-neutral-400 cursor-pointer hover:text-white transition"
              />
            )}
          </div>
          <div className="w-full flex flex-row justify-center">
            <p className="text-xs text-neutral-400 leading-[0.85rem] pr-2">
              {playedDuration}
            </p>
            <div className="flex w-[80%]">
              <Seekbar
                value={seek}
                onChange={(value: SetStateAction<any>) => {
                  playerRef.current?.seekTo(value);
                  setSeek(value);
                }}
              />
            </div>
            <p className="text-xs text-neutral-400 leading-[0.85rem] pl-2">
              {songDuration}
            </p>
          </div>
        </div>

        <div className="flex items-center w-full justify-end pr-2">
          <div className="flex items-center gap-x-2 w-[120px]">
            <VolumeIcon
              onClick={toggleMute}
              className="cursor-pointer"
              size={30}
            />
            <Slider
              value={volume}
              onChange={(value: number) => setVolume(value)}
            />
          </div>
        </div>
      </div>

      {/* <PlayerModal
        key={songUrl}
        data={song}
        volume={volume}
        setVolume={setVolume}
        toggleMute={toggleMute}
        seek={seek}
        setSeek={setSeek}
        isPlaying={isPlaying}
        isShuffle={isShuffle}
        isLoop={isLoop}
        onShuffle={onShuffle}
        onLoop={onLoop}
        onPlayPrevious={onPlayPrevious}
        onPlayNext={onPlayNext}
        handlePlay={handlePlay}
        playerRef={playerRef}
        playedDuration={playedDuration}
        songDuration={songDuration}
      /> */}

      <div className="hidden">
        <ReactPlayer
          ref={playerRef}
          url={songUrl}
          playing={isPlaying}
          playbackRate={playbackRate}
          volume={volume}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onEnded={() => {
            onPlayNext();
          }}
          onProgress={({ played, playedSeconds }) =>
            onProgress(played, playedSeconds)
          }
          onDuration={(duration) => onDuration(duration)}
        />
      </div>
    </>
  );
};

export default MusicPlayerContent;
