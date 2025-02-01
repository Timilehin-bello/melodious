"use client";
import { usePlayer } from "@/contexts/melodious/PlayerContext";
import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import MediaItem from "../MediaItem";
import Image from "next/image";
import LikeButton from "../LikeButton";
import { VolumeIcon } from "lucide-react";
import {
  BsArrowRight,
  BsPauseFill,
  BsPlayFill,
  BsRepeat,
  BsRepeat1,
  BsShuffle,
} from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import Slider from "../Slider";

const MyPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    togglePlayPause,
    nextTrack,
    prevTrack,
    setVolume,
    toggleRepeat,
    toggleLoop,
    loop,
    repeat,
    seekTo,
    // progress,
    addToFavorites,
    isFavorite,
    emitBufferingStart,
    emitBufferingEnd,
    handlePlaybackState,
    setIsPlaying,
  } = usePlayer();

  const playerRef = useRef<ReactPlayer>(null);

  //   const handleProgress = (state: { playedSeconds: number }) => {
  //     seekTo(state.playedSeconds);
  //   };

  const handleBufferStart = () => {
    emitBufferingStart();
  };

  const handleBufferEnd = () => {
    emitBufferingEnd();
  };

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [oldVolume, setOldVolume] = useState<number>(0);
  const [playing, setPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [songDuration, setSongDuration] = useState("");
  const [playedDuration, setPlayedDuration] = useState("");

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    setCurrentTime(state.playedSeconds);
    setDuration(state.loadedSeconds);
    setProgress((state.playedSeconds / state.loadedSeconds) * 100);
    // Your custom logic here, for example:
    // console.log(`Played: ${state.played * 100}%`);
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const progressBarRect = progressBarRef.current?.getBoundingClientRect();
    if (progressBarRect) {
      const seekPosition = event.clientX - progressBarRect.left;
      const seekPercentage = seekPosition / progressBarRect.width;
      const seekTime = seekPercentage * duration;
      playerRef.current?.seekTo(seekTime);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${minutes}:${secondsRemaining.toString().padStart(2, "0")}`;
  };

  const toggleMute = () => {
    if (volume !== 0) {
      setOldVolume(volume);
      setVolume(0);
    } else {
      setVolume(oldVolume);
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

  const handlePlay = () => {
    //  console.log("playing", playing);
    if (!isPlaying) {
      setIsPlaying(true);
      setPlaying(true);
      if (playing) {
        console.log("is playing", playing);
        console.log("duration", duration);
      }
    } else {
      setIsPlaying(false);
      setPlaying(false);
    }
  };
  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  // Toggle Loop
  const onLoop = () => {
    if (isLoop) {
      setIsLoop(false);
    } else {
      setIsLoop(true);
    }
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

  return (
    <>
      {currentTrack && (
        <div className="fixed bottom-0 bg-[#121212AA] w-full py-3 h-[90px] z-auto">
          <div
            className="w-full h-1 -mt-3 bg-gray-200 rounded-full "
            ref={progressBarRef}
            // onClick={handleSeek}
          >
            <div
              className="h-full bg-[#950944] rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="w-full flex flex-row justify-between px-2 py-2">
            <p className="text-xs text-neutral-400 leading-[0.85rem] pr-2">
              {formatTime(currentTime)}
            </p>
            {/* <div className="flex w-[80%]">
              <Seekbar
                value={seek}
                onChange={(value: SetStateAction<any>) => {
                  playerRef.current?.seekTo(value);
                  setSeek(value);
                }}
              />
            </div> */}
            <p className="text-xs text-neutral-400 leading-[0.85rem] pl-2">
              {/* {songDuration} */}
              {formatTime(duration)}
            </p>
          </div>
          <div className="flex justify-between h-full w-full md:hidden ">
            <div
              className="flex w-full justify-start"
              // onClick={onOpen}
            >
              <div className="flex items-center w-[230px]">
                <div
                  className="flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 
                 w-full p-2 rounded-md"
                  //  onClick={handleClick}
                >
                  <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden">
                    <Image
                      className="object-cover"
                      fill
                      src={
                        currentTrack
                          ? currentTrack.imageUrl
                          : "/images/icons/liked.png"
                      }
                      alt="Image"
                    />
                  </div>
                  <div className="flex flex-col gap-y-1 overflow-hidden">
                    <p className="text-white truncate">{currentTrack?.title}</p>
                    <p className="text-neutral-400 text-sm truncate">
                      {currentTrack?.artist}
                    </p>
                  </div>
                </div>

                <LikeButton songId={currentTrack?.id?.toString()} />
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

          <div className="hidden md:flex md:flex-row h-full w-full -mt-2">
            <div className="flex w-full justify-start">
              <div className="flex items-center w-[230px]">
                <div
                  className="flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 
                 w-full p-2 rounded-md"
                  //  onClick={handleClick}
                >
                  <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden">
                    <Image
                      className="object-cover"
                      fill
                      src={currentTrack?.imageUrl || "/images/icons/liked.png"}
                      alt="Image"
                    />
                  </div>
                  <div className="flex flex-col gap-y-1 overflow-hidden">
                    <p className="text-white truncate">{currentTrack?.title}</p>
                    <p className="text-neutral-400 text-sm truncate">
                      {currentTrack?.artist}
                    </p>
                  </div>
                </div>

                <LikeButton songId={currentTrack?.id?.toString()} />
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
                  onClick={() => prevTrack}
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
                    nextTrack();
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
              url={currentTrack?.audioUrl}
              playing={isPlaying}
              // playbackRate={playbackRate}
              volume={volume}
              onPause={() => {
                handlePlaybackState("pause");
                setIsPlaying(false);
              }}
              onPlay={() => {
                handlePlaybackState("start");
                setIsPlaying(true);
              }}
              onEnded={() => {
                nextTrack();
                if (!repeat) {
                  // && currentIndex === playlist.length - 1) {
                  handlePlaybackState("stop");
                  togglePlayPause(); // Notify backend if it's the last track
                }
              }}
              onProgress={
                handleProgress
                //   ({ played, playedSeconds }) => {
                //   // handleProgress;
                //   onProgress(played, playedSeconds);
                // }
              }
              onDuration={(duration) => onDuration(duration)}
            />
          </div>
        </div>
      )}
    </>
    // <div className="fixed bottom-0 bg-[#121212AA] w-full py-2 h-[80px]">
    //   {currentTrack ? (
    //     <>
    //       <div
    //         className="w-full h-2 -mt-2 bg-gray-200 rounded-full"
    //         ref={progressBarRef}
    //         onClick={handleSeek}
    //       >
    //         <div
    //           className="h-full bg-blue-500 rounded-full"
    //           style={{ width: `${progress}%` }}
    //         />
    //       </div>
    //       <div className="flex items-center space-x-4">
    //         <img
    //           src={currentTrack.imageUrl}
    //           alt="Cover"
    //           className="w-12 h-12 rounded"
    //         />
    //         <div>
    //           <h3 className="text-white font-semibold">{currentTrack.title}</h3>
    //           <p className="text-gray-400 text-sm">{currentTrack.artist}</p>
    //         </div>
    //       </div>

    //       <div className="flex flex-col items-center">
    //         <div className="flex items-center space-x-4">
    //           <button onClick={prevTrack} className="text-white">
    //             ⏮️
    //           </button>
    //           <button onClick={togglePlayPause} className="text-white">
    //             {isPlaying ? "⏸️" : "▶️"}
    //           </button>
    //           <button onClick={nextTrack} className="text-white">
    //             ⏭️
    //           </button>
    //           <button
    //             onClick={toggleLoop}
    //             className={`text-white ${loop && "text-blue-500"}`}
    //           >
    //             🔁
    //           </button>
    //           <button
    //             onClick={toggleRepeat}
    //             className={`text-white ${repeat && "text-blue-500"}`}
    //           >
    //             🔂
    //           </button>
    //           <button
    //             onClick={() => addToFavorites(currentTrack)}
    //             className={`text-white ${
    //               isFavorite(currentTrack) && "text-yellow-500"
    //             }`}
    //           >
    //             ⭐
    //           </button>
    //         </div>

    //         <input
    //           type="range"
    //           min="0"
    //           max="100"
    //           value={(progress / (currentTrack?.duration || 1)) * 100}
    //           onChange={(e) => {
    //             const newTime =
    //               (Number(e.target.value) / 100) *
    //               (currentTrack?.duration || 1);
    //             seekTo(newTime);
    //             playerRef.current?.seekTo(newTime);
    //           }}
    //           className="w-full mt-2"
    //         />
    //       </div>

    //       <div className="flex items-center">
    //         <input
    //           type="range"
    //           min="0"
    //           max="1"
    //           step="0.01"
    //           value={volume}
    //           onChange={(e) => setVolume(Number(e.target.value))}
    //           className="w-24"
    //         />
    //       </div>

    //       <div className="hidden">
    //         <ReactPlayer
    //           ref={playerRef}
    //           url={currentTrack.audioUrl}
    //           playing={isPlaying}
    //           volume={volume}
    //           loop={loop}
    //           onEnded={() => {
    //             nextTrack();
    //             if (!repeat) {
    //               // && currentIndex === playlist.length - 1) {
    //               handlePlaybackState("stop");
    //               togglePlayPause(); // Notify backend if it's the last track
    //             }
    //           }}
    //           onProgress={handleProgress}
    //           onBuffer={handleBufferStart}
    //           onBufferEnd={handleBufferEnd}
    //           progressInterval={1000}
    //         />
    //       </div>
    //     </>
    //   ) : (
    //     <p className="text-white">No track playing</p>
    //   )}
    // </div>
  );
};

export default MyPlayer;
