"use client";

import GenreItem from "@/components/GenreItem";
import { PopularArtistCarousel } from "@/components/PopularArtistCarousel";
import RecentItem from "@/components/RecentItem";
import TrendingSoundItem from "@/components/TrendingSoundItem";
import Image from "next/image";
import Link from "next/link";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { useConnectModal } from "thirdweb/react";
import { client } from "@/lib/client";
import { twMerge } from "tailwind-merge";
import { useCallback, useEffect, useState } from "react";
import fetchMethod from "@/lib/readState";
import { initializeSocket } from "@/lib/testSocket";
import { useMelodiousContext } from "@/contexts/melodious";
import { Track, useMusic } from "@/contexts/melodious/MusicPlayerContext";
import { useMusicPlayer } from "@/contexts/melodious/MusicProvider";
// import { usePlayer } from "@/contexts/melodious/PlayerContext";

export default function Page() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTrack, isPlaying, playTrack, playPlaylist, togglePlay } =
    useMusicPlayer();

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const trackList = await await fetchMethod("get_tracks");
        console.log("tracklist", trackList);
        setTracks(trackList);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, []);

  const handlePlayTrack = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playPlaylist(tracks, index);
    }
  };

  const { connect } = useConnectModal();
  // const onPlay = useOnPlay(tracks);
  const status = useActiveWalletConnectionStatus();
  const { setConditionFulfilled } = useMelodiousContext();

  // const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } =
  //   useMusic();

  // const handlePlayPause = (track: Track) => {
  //   if (currentTrack?.id === track.id) {
  //     if (isPlaying) {
  //       pauseTrack();
  //     } else {
  //       resumeTrack();
  //     }
  //   } else {
  //     playTrack(track);
  //   }
  // };

  // const data = [
  //   {
  //     id: 1,
  //     title: "Song Title 1",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/artist.svg",
  //     audioUrl: "/audio/song1.mp3",
  //   },
  //   {
  //     id: 2,
  //     title: "Song Title 2",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/artist.svg",
  //     audioUrl: "/audio/song2.mp3",
  //   },
  //   {
  //     id: 3,
  //     title: "Song Title 3",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/woman-with-headphone-front.png",
  //     audioUrl: "/audio/song1.mp3",
  //   },
  //   {
  //     id: 4,
  //     title: "Song Title 4",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/artist.svg",
  //     audioUrl: "/audio/song3.mp3",
  //   },
  //   {
  //     id: 5,
  //     title: "Song Title 4",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/woman-with-headphone-front.png",
  //     audioUrl: "/audio/song1.mp3",
  //   },
  // ];

  // const transformedData = tracks.map((track) => {
  //   return {
  //     id: track.id,
  //     title: track.title,
  //     artist: track.artist,
  //     album: track.album,
  //     duration: track.duration,
  //     cover: track.image_path,
  //     url: track.song_path,
  //   };
  // });

  const genres = [
    {
      name: "Rock",
      songs: [
        {
          title: "Song 1",
          totalListen: "19,900,000",
          duration: "3:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 2",
          totalListen: "19,900,000",
          duration: "4:20",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 3",
          totalListen: "19,900,000",
          duration: "5:10",
          imageUrl: "/images/artist.svg",
        },
      ],
    },

    {
      name: "Jazz",
      songs: [
        {
          title: "Song 7",
          totalListen: "19,900,000",
          duration: "6:15",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 8",
          totalListen: "19,900,000",
          duration: "5:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 9",
          totalListen: "19,900,000",
          duration: "7:00",
          imageUrl: "/images/artist.svg",
        },
      ],
    },

    {
      name: "Raggae",
      songs: [
        {
          title: "Song 13",
          totalListen: "19,900,000",
          duration: "6:15",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 14",
          totalListen: "19,900,000",
          duration: "5:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 15",
          totalListen: "19,900,000",
          duration: "7:00",
          imageUrl: "/images/artist.svg",
        },
      ],
    },
    {
      name: "Hip Hop",
      songs: [
        {
          title: "Song 16",
          totalListen: "19,900,000",
          duration: "6:15",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 17",
          totalListen: "19,900,000",
          duration: "5:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 18",
          totalListen: "19,900,000",
          duration: "7:00",
          imageUrl: "/images/artist.svg",
        },
      ],
    },
    {
      name: "Blues",
      songs: [
        {
          title: "Song 19",
          totalListen: "19,900,000",
          duration: "6:15",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 20",
          totalListen: "19,900,000",
          duration: "5:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 21",
          totalListen: "19,900,000",
          duration: "7:00",
          imageUrl: "/images/artist.svg",
        },
      ],
    },
  ];

  const recentlyPlayed = [
    {
      title: "Perfect",
      artistName: "Ed Sheran",
      duration: "2 mins",
    },
    {
      title: "Title Deluxe",
      artistName: "Taini Song",
      duration: "6 mins",
    },
    {
      title: "Shape of You",
      artistName: "Ed Sheran",
      duration: "4 mins",
    },
    {
      title: "Feel Something",
      artistName: "Jaymes Young",
      duration: "2 mins",
    },
    {
      title: "Bad Habits",
      artistName: "Ed Sheran",
      duration: "3 mins",
    },
    {
      title: "Feel Something",
      artistName: "Jaymes Young",
      duration: "2 mins",
    },
    {
      title: "Feel Something",
      artistName: "Jaymes Young",
      duration: "2 mins",
    },
  ];

  // const playSong = useCallback(
  //   async (song: any) => {
  //     try {
  //       if (status === "disconnected") {
  //         await connect({ client, size: "compact" });
  //       }

  //       if (typeof song === "object") {
  //         // Stop current playback first
  //         setIsPlaying(false);

  //         // Short delay to ensure clean state
  //         await new Promise((resolve) => setTimeout(resolve, 100));

  //         // Play new track
  //         await playTrack(song);
  //       }
  //     } catch (error) {
  //       console.error("Error playing song:", error);
  //     }
  //   },
  //   [status, connect, playTrack, setIsPlaying]
  // );

  const likeSong = async () => {
    if (status === "disconnected") {
      await connect({ client, size: "compact" }); // opens the connect modal
    }

    alert("Like Song ");
  };

  const [isConnected, setIsConnected] = useState(false);

  // useEffect(() => {
  //   let data = localStorage.getItem("xx-mu") as any;
  //   //     console.log("token gotten", JSON.parse(data));

  //   data = JSON.parse(data) ?? null;

  //   const token = data ? data["tokens"]["token"].access.token : null;

  //   const socket = initializeSocket(token);

  //   if (socket) {
  //     setConditionFulfilled(true);
  //     setIsConnected(true);

  //     socket.on("startPlaying", () => {
  //       console.log("Playing music");
  //     });
  //   }

  //   // if (setConditionFulfilled) {

  //   socket.on("startPlaying", () => {
  //     console.log("Playing music");
  //   });
  //   // }
  //   socket.on("connect", () => setIsConnected(true));
  //   socket.on("disconnect", () => setIsConnected(false));

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, [isConnected]);

  return (
    <div
      className={twMerge(
        `relative grid gap-0 md:grid-cols-4 mt-[-65px] w-full h-full`,
        currentTrack && "h-[calc(100%-40px)] pb-[90px]"
      )}
    >
      {/* First column (75% width on medium screens and above)  */}
      <div className="md:col-span-3 px-4 pt-[80px] h-full">
        <h2 className="text-white font-bold text-3xl mb-4">
          Good Morning Guest!
        </h2>
        <p className="text-white">
          Status: {isConnected ? "Connected" : "Disconnected"}
        </p>
        {/* Banner */}
        <div className="rounded-lg bg-cover bg-center bg-no-repeat bg-[url('/images/icons/banner.svg')] h-25  w-full">
          <div className="flex justify-between items-center">
            <div className="px-8 z-10">
              <Image
                src="/images/melodious_text.svg"
                height={37}
                width={149}
                alt="melodious text"
              />

              <h2 className="lg:text-5xl md:text-base font-bold mt-4 text-white">
                New Released Sounds
              </h2>
            </div>
            <div className="">
              <Image
                src="/images/woman-with-headphone-front.png"
                width={410}
                height={357}
                alt="woman with headpone"
                className=""
              />
            </div>
          </div>
        </div>
        {/* End of Banner */}

        {/* Trending Sound */}
        <div className="mt-16">
          <div className="flex justify-between text-white px-2">
            <h2 className="font-bold text-2xl">Trending Songs</h2>
            <p className="hover:text-white text-gray-300 transition-all">
              See All
            </p>
          </div>
          <div className="grid auto-rows-min gap-4 md:grid-cols-4 mt-5">
            {tracks.slice(0, 4).map((track, index) => (
              <TrendingSoundItem
                key={index}
                imageUrl={track.imageUrl}
                songTitle={track.title}
                songDetails={String(track.duration)}
                playSong={() => handlePlayTrack(track, index)}
                likeSong={likeSong}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
        {/* End of Trending Sound */}

        {/* Genre */}
        <div className="mt-10">
          <div className="flex justify-between text-white mb-4 px-2">
            <h2 className="font-bold text-2xl">Genre</h2>
            <Link
              href={`/listener/genres`}
              className="hover:text-white text-gray-300 transition-all"
            >
              See All
            </Link>
          </div>
          <div className="pt-2">
            <GenreItem genres={genres} />
          </div>
        </div>
        {/* End of Genre */}
      </div>
      {/* Second column (25% width on medium screens and above) */}
      <div
        className={`md:col-span-1 px-2 pt-[120px] bg-right-sidebar-gradient bg-cover bg-center h-full pb-[20px]`}
      >
        {/* <p>Content for the second column</p> */}
        <div>
          <div className="flex justify-between mb-3 px-2">
            <h3 className="text-white text-lg">Popular Artist</h3>
            <p className="text-[#910a43] cursor-pointer hover:text-gray-300">
              See All
            </p>
          </div>
          <PopularArtistCarousel />
        </div>

        <div className="mt-12 p-2">
          <div className="flex justify-between items-center flex-wrap text-white mb-6">
            <h3 className="text-lg">Recently Played</h3>
            <p className="hover:text-gray-300 transition-all font-semibold text-[#950944] cursor-pointer">
              See All
            </p>
          </div>
          {/* <ScrollArea className="h-[550px] pr-2"> */}
          <div className="flex flex-col gap-3">
            {recentlyPlayed.map((item, index) => (
              <RecentItem
                key={index}
                title={item.title}
                artistName={item.artistName}
                duration={item.duration}
              />
            ))}
          </div>
          {/* </ScrollArea> */}
        </div>
      </div>
    </div>
  );
}
