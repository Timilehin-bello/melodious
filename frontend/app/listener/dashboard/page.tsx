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
import useOnPlay from "@/hooks/useOnPlay";
import { twMerge } from "tailwind-merge";
import usePlayer from "@/hooks/usePlayer";
import { useEffect, useState } from "react";
import fetchMethod from "@/lib/readState";

export default function Page() {
  const [tracks, setTracks] = useState<any[]>([]);
  // const songs = [
  //   {
  //     id: "1",
  //     user_id: "string",
  //     artist: "string",
  //     title: "string",
  //     song_path: "/audio/song1.mp3",
  //     image_path: "/images/artist.svg",
  //   },
  // ];

  const fetchTracks = async () => {
    try {
      const trackList: any[] = await fetchMethod("get_tracks");
      if (Array.isArray(trackList)) {
        const transformed = trackList.map((track) => {
          return {
            id: track.id,
            user_id: "string",
            artist: "Artist",
            title: track.title,
            song_path: track.audioUrl,
            image_path: track.imageUrl,
          };
        });
        setTimeout(() => {
          setTracks(transformed);
          // setLoading(false);
        }, 3000);
      } else {
        console.log("Fetched data is not an array");
        // setLoading(false);
      }
    } catch (error) {
      console.log(error);
      // setLoading(false);
    }
  };
  useEffect(() => {
    fetchTracks();
  }, []);

  const { connect } = useConnectModal();
  const onPlay = useOnPlay(tracks);
  const status = useActiveWalletConnectionStatus();
  // const data = [
  //   {
  //     songTitle: "Song Title 1",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/artist.svg",
  //   },
  //   {
  //     songTitle: "Song Title 2",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/artist.svg",
  //   },
  //   {
  //     songTitle: "Song Title 3",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/woman-with-headphone-front.png",
  //   },
  //   {
  //     songTitle: "Song Title 4",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/artist.svg",
  //   },
  //   {
  //     songTitle: "Song Title 1",
  //     songDetails: "189 songs, 2hr 40min",
  //     imageUrl: "/images/woman-with-headphone-front.png",
  //   },
  // ];

  const transoformedData = tracks.map((track) => {
    return {
      id: track.id,
      songTitle: track.title,
      imageUrl: track.image_path,
      songDetails: "289 songs, 5hr 10 min",
    };
  });

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
      name: "Pop",
      songs: [
        {
          title: "Song 4",
          totalListen: "19,900,000",
          duration: "3:30",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 5",
          totalListen: "19,900,000",
          duration: "4:00",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 6",
          totalListen: "19,900,000",
          duration: "3:50",
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
      name: "Country",
      songs: [
        {
          title: "Song 10",
          totalListen: "19,900,000",
          duration: "6:15",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 11",
          totalListen: "19,900,000",
          duration: "5:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 12",
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
      title: "Bad Habits",
      artistName: "Ed Sheran",
      duration: "3 mins",
    },
    {
      title: "Bad Habits",
      artistName: "Ed Sheran",
      duration: "3 mins",
    },
    {
      title: "Bad Habits",
      artistName: "Ed Sheran",
      duration: "3 mins",
    },
    {
      title: "Bad Habits",
      artistName: "Ed Sheran",
      duration: "3 mins",
    },
  ];

  const playSong = async (id: string) => {
    console.log("id", id);
    if (status === "disconnected") {
      await connect({ client, size: "compact" }); // opens the connect modal
    }
    // alert("Play Song ");
    onPlay(id);
  };

  const likeSong = async () => {
    if (status === "disconnected") {
      await connect({ client, size: "compact" }); // opens the connect modal
    }

    alert("Like Song ");
  };
  const player = usePlayer();
  return (
    <div
      className={twMerge(
        `grid md:grid-cols-4 mt-[-65px] w-full h-full`,
        player.activeId && "h-[calc(100%-85px)] pb-[75px]"
      )}
    >
      {/* First column (75% width on medium screens and above)  */}
      <div className="md:col-span-3  px-4 pt-[80px] ">
        <h2 className="text-white font-bold text-3xl mb-4">
          Good Morning Guest!
        </h2>
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
            {transoformedData.slice(0, 4).map((album, index) => (
              <TrendingSoundItem
                key={index}
                imageUrl={album.imageUrl}
                songTitle={album.songTitle}
                songDetails={album.songDetails}
                playSong={(id: string) => playSong(album.id)}
                likeSong={likeSong}
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
          <div className=" pt-2">
            <GenreItem genres={genres} />
          </div>
        </div>
        {/* End of Genre */}
      </div>
      {/* Second column (25% width on medium screens and above) */}
      <div className="relative md:col-span-1  px-4 pt-[120px] bg-right-sidebar-gradient bg-cover bg-center ">
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
