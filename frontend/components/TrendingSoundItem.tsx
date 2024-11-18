import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { HeartIcon, PlayCircle } from "lucide-react";

interface TrendingSoundProps {
  imageUrl: string;
  songTitle: string;
  songDetails: string;
  likeSong?: () => void;
  playSong?: () => void;
}

const TrendingSoundItem: React.FC<TrendingSoundProps> = ({
  imageUrl,
  songTitle,
  songDetails,
  likeSong,
  playSong,
}) => {
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
                <PlayCircle
                  size={34}
                  onClick={playSong}
                  className="hidden group-hover:block"
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
