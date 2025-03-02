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
// import { Track, useMusic } from "@/contexts/melodious/MusicPlayerContext";

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
//   //       console.error("Error playing song:", error);
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
import { Play, Pause } from "lucide-react";
import Image from "next/image";
import { Track, useMusicPlayer } from "@/contexts/melodious/MusicProvider";

interface SongListProps {
  songList: Track[];
  onPlayPause: (track: Track, index: number) => void;
  isLoading: boolean;
}

const SongList: React.FC<SongListProps> = ({
  songList,
  onPlayPause,
  isLoading,
}) => {
  const { currentTrack, isPlaying, playTrack, playPlaylist, togglePlay } =
    useMusicPlayer();

  const handlePlayPauseClick = (track: Track, index: number) => {
    // e.preventDefault(); // Prevent default browser behavior
    onPlayPause(track, index);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-2 rounded-md mb-2">
            <div className="w-10 h-10 bg-zinc-700 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-zinc-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-zinc-700 rounded w-1/4"></div>
            </div>
            <div className="w-10 h-4 bg-zinc-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <table className="w-full text-white">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left pb-2">#</th>
            <th className="text-left pb-2">Title</th>
            <th className="text-left pb-2">Artist</th>
            <th className="text-left pb-2">Album</th>
            <th className="text-right pb-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {songList.map((song, index) => (
            <tr key={song.id} className="hover:bg-[#950944]">
              <td className="py-2">{index + 1}</td>
              <td className="py-2">
                <div className="flex items-center">
                  <div className="relative w-10 h-10 mr-3">
                    <Image
                      src={
                        song.imageUrl || "/placeholder.svg?height=40&width=40"
                      }
                      alt={song.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded"
                    />
                    <button
                      onClick={() =>
                        handlePlayPauseClick(song, Number(song.id))
                      }
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {currentTrack?.id === song.id && isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                  <span>{song.title}</span>
                </div>
              </td>
              <td className="py-2">{song.artist}</td>
              <td className="py-2">{song.album}</td>
              <td className="py-2 text-right">{song.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SongList;
