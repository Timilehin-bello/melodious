import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { HeartIcon, PlayCircle } from "lucide-react";
import PlayButton from "./PlayButton";
import { Track } from "@/contexts/melodious/MusicProvider";

interface TrendingSoundProps {
  imageUrl: string;
  songTitle: string;
  songDetails: string;
  likeSong?: () => void;
  playSong: (song: Track, id: string) => void;
  isLoading?: boolean;
}

const TrendingSoundItem: React.FC<TrendingSoundProps> = ({
  imageUrl,
  songTitle,
  songDetails,
  likeSong,
  playSong,
  isLoading,
}) => {
  const song = {
    id: "1",
    user_id: "string",
    artist: "string",
    title: "string",
    song_path: "/audio/song1.mp3",
    image_path: "/images/artist.svg",
    duration: 0,
    audioUrl: "/audio/song1.mp3",
    imageUrl: "/images/artist.svg",
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
    <div className="p-1 group cursor-pointer">
      <Card>
        <CardContent className="flex aspect-square p-0 items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={songTitle}
              fill
              objectFit="cover"
              objectPosition="center"
              className="object-cover p-0 rounded-lg md:rounded-md"
            />

            <HeartIcon
              size={34}
              onClick={likeSong}
              className="absolute left-1 top-2 border-1 hover:text-gray-200 text-[#950944] hidden group-hover:block "
            />

            <div className="absolute bottom-0 flex justify-between gap-1 items-center align-middle backdrop-blur-0 bg-black/45 p-2 w-full text-gray-200 py-2">
              <div className="flex flex-col ">
                <h3 className="font-bold">{songTitle}</h3>
                <p className="text-sm">{songDetails}</p>
              </div>
              <div>
                <PlayButton
                  onClick={() => playSong(song, song.id)}
                  data={song}

                  // className="hidden group-hover:block"
                />
              </div>
            </div>
            {/* </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingSoundItem;
