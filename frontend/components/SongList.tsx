// "use client";
// import { Timer } from "lucide-react";

// import { client } from "@/lib/client";

// import {
//   useActiveWalletConnectionStatus,
//   useConnectModal,
// } from "thirdweb/react";
// import { useMelodiousContext } from "@/contexts/melodious";
// import { usePlayer } from "@/contexts/melodious/PlayerContext";

// import SongListItem from "./SongListItem";
// import { useCallback } from "react";
// import { useMusic } from "@/contexts/melodious/MusicPlayerContext";
import { Track } from "@/contexts/melodious/MusicProvider";

// const SongList = ({ songList }: any) => {
//   const { connect } = useConnectModal();
//   // const onPlay = useOnPlay(tracks);
//   const status = useActiveWalletConnectionStatus();
//   const { setConditionFulfilled } = useMelodiousContext();

//   // const playSong = useCallback(
//   //   async (song: any) => {
//   //     try {
//   //       if (status === "disconnected") {
//   //         await connect({ client, size: "compact" });
//   //       }

//   //       if (typeof song === "object") {
//   //         // Stop current playback first
//   //         setIsPlaying(false);

//   //         // Short delay to ensure clean state
//   //         await new Promise((resolve) => setTimeout(resolve, 100));

//   //         // Play new track
//   //         await playTrack(song);
//   //       }
//   //     } catch (error) {
//   //       console.log("Error playing song:", error);
//   //     }
//   //   },
//   //   [status, connect, playTrack, setIsPlaying]
//   // );

//   const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } =
//     useMusic();

//   const handlePlayPause = (track: Track) => {
//     if (currentTrack?.id === track.id) {
//       if (isPlaying) {
//         pauseTrack();
//       } else {
//         resumeTrack();
//       }
//     } else {
//       playTrack(track);
//     }
//   };

//   return (
//     <div>
//       <div>
//         <table className="table-auto w-full mb-24">
//           <thead className="bg-[#1C1C32]/[0.5] text-left rounded text-gray-200 uppercase font-normal text-sm">
//             <tr>
//               <th>
//                 <span className="p-4">{"#"}</span>
//               </th>
//               <th>
//                 <span className="p-2">{"Title"}</span>
//               </th>
//               <th>
//                 <span className="p-2">{"Album"}</span>
//               </th>
//               <th>
//                 <span className="p-2 ">
//                   <Timer />
//                 </span>
//               </th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {songList.map((song: any, index: number) => {
//               return (
//                 <SongListItem
//                   key={index}
//                   index={index}
//                   song={song}
//                   playSong={() => handlePlayPause(song)}
//                 />
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default SongList;
// function setIsPlaying(arg0: boolean) {
//   throw new Error("Function not implemented.");
// }

import type React from "react";
import { Play, Pause, Trash2, Music } from "lucide-react";
import Image from "next/image";
import { useMusicPlayer } from "@/contexts/melodious/MusicProvider";
import { useMusic } from "@/contexts/melodious/MusicPlayerContext";

interface SongListProps {
  songList: Track[];
  onPlayPause: (track: Track, index: number) => void;
  isLoading: boolean;
  onRemove?: (track: Track) => void;
  showRemoveButton?: boolean;
}

const SongList: React.FC<SongListProps> = ({
  songList,
  onPlayPause,
  isLoading,
  onRemove,
  showRemoveButton = false,
}) => {
  const { currentTrack, isPlaying } = useMusicPlayer();

  const handlePlayPauseClick = (track: Track, index: number) => {
    // e.preventDefault(); // Prevent default browser behavior
    onPlayPause(track, index);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50"
          >
            <div className="w-12 h-12 bg-zinc-700 rounded-md"></div>
            <div className="flex-1">
              <div className="h-4 bg-zinc-700 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-zinc-700 rounded w-1/4"></div>
            </div>
            <div className="w-16 h-4 bg-zinc-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl bg-zinc-900/40 p-4">
      <table className="w-full text-white">
        <thead>
          <tr className="border-b border-zinc-700/50 text-zinc-400 text-sm">
            <th className="text-left pb-4 pl-4">S/N</th>
            <th className="text-left pb-4">Title</th>
            <th className="text-left pb-4">Date</th>
            <th className="text-right pb-4 pr-4">Duration</th>
            {showRemoveButton && (
              <th className="text-right pb-4 pr-4">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {!Array.isArray(songList) || songList.length === 0 ? (
            <tr>
              <td
                colSpan={showRemoveButton ? 5 : 4}
                className="text-center py-16"
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
                    <Music className="w-8 h-8 text-zinc-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-zinc-300 mb-1">
                      No tracks available
                    </h3>
                    <p className="text-sm text-zinc-500">
                      This playlist is empty. Add some tracks to get started!
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            songList.map((song, index) => (
              // <tr
              //   key={song.id}
              //   className={`
              //     group hover:bg-zinc-800/50 transition-colors duration-200 cursor-pointer
              //     ${currentTrack?.id === song.id ? "bg-zinc-800/80" : ""}
              //   `}
              //   onClick={() => handlePlayPauseClick(song, index)}
              // >

              <tr
                key={song.id}
                className={`
                  group hover:bg-[#950944]/50 transition-colors duration-200 cursor-pointer
                  ${currentTrack?.id === song.id ? "bg-[#950944]/80" : ""}
                `}
                onClick={() => handlePlayPauseClick(song, index)}
              >
                <td className="py-3 pl-4 text-sm text-zinc-400">{index + 1}</td>
                <td className="py-3">
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 mr-4">
                      <Image
                        src={
                          song.imageUrl || "/placeholder.svg?height=40&width=40"
                        }
                        alt={song.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                      <button
                        onClick={() => handlePlayPauseClick(song, index)}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-md"
                      >
                        {currentTrack?.id === song.id && isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{song.title}</span>
                      <span className="text-sm text-zinc-400">
                        {song.artist}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-sm text-zinc-400">Recently added</td>
                <td className="py-3 pr-4 text-right text-sm text-zinc-400">
                  {song.duration} mins
                </td>
                {showRemoveButton && onRemove && (
                  <td className="py-3 pr-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(song);
                      }}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all duration-200 "
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SongList;
