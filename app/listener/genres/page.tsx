import GenreItem from "@/components/GenreItem";
import { Clock } from "lucide-react";

const Genres = () => {
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
          totalListen: "Confetti",
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
    {
      name: "Karaoke",
      songs: [
        {
          title: "Song 22",
          totalListen: "19,900,000",
          duration: "6:15",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 23",
          totalListen: "19,900,000",
          duration: "5:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 24",
          totalListen: "19,900,000",
          duration: "7:00",
          imageUrl: "/images/artist.svg",
        },
      ],
    },
  ];

  return (
    <div className="mt-9 px-6">
      <h1 className="text-white font-bold text-4xl">Genres</h1>
      <div className="mt-6 w-[85%]">
        <GenreItem genres={genres} showHeader={true} />
      </div>
    </div>
  );
};

export default Genres;
