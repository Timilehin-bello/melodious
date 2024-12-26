import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { HeartIcon, PlayCircle } from "lucide-react";
import PlayButton from "./PlayButton";

interface TrendingSoundProps {
  imageUrl: string;
  songTitle: string;
  songDetails: string;
  likeSong?: () => void;
  playSong: (id: string) => void;
}

const TrendingSoundItem: React.FC<TrendingSoundProps> = ({
  imageUrl,
  songTitle,
  songDetails,
  likeSong,
  playSong,
}) => {
  const song = {
    id: "1",
    user_id: "string",
    artist: "string",
    title: "string",
    song_path: "/audio/song1.mp3",
    image_path: "/images/artist.svg",
  };
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
                  onClick={playSong}
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
