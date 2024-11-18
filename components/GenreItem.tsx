import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Ellipsis, HeadphonesIcon, Heart, Play } from "lucide-react";
import Image from "next/image";
import React from "react";

interface GenreProps {
  genres: any;
  playSong?: () => void;
}

const GenreItem: React.FC<GenreProps> = ({ genres, playSong }) => {
  return (
    <Tabs defaultValue={genres[0].name} className="w-full">
      <TabsList className="flex space-x-6">
        {genres.slice(0, 6).map((genre: any) => (
          <TabsTrigger key={genre.name} value={genre.name}>
            {genre.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {genres.map((genre: any) => (
        <TabsContent key={genre.name} value={genre.name}>
          <div className="p-4 ">
            <div className="flex flex-col w-full">
              {genre.songs.slice(0, 6).map((song: any, index: any) => (
                <div key={index} className="w-full">
                  <div className="flex justify-between items-center align-middle w-full py-1 px-2 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer">
                    <div className="flex gap-6 py-2 items-center">
                      <p className="ml-2 font-semibold group-hover:hidden">
                        {index + 1}
                      </p>
                      <Play
                        className="h-4 w-4 hidden group-hover:block"
                        onClick={playSong}
                      />
                      <div className="flex gap-2 items-center">
                        <Image
                          src={song.imageUrl}
                          alt={song.title}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <p className="hover:text-[#950944]">{song.title}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <HeadphonesIcon size={24} className="text-white" />
                      <p>{song.totalListen}</p>
                    </div>
                    <p className="flex gap-2 items-center">
                      <Clock size={24} className="text-gray-500" />
                      {song.duration}
                    </p>
                    <p>
                      <Heart size={26} />
                    </p>
                    <div className="flex">
                      <Ellipsis size={24} />
                    </div>
                  </div>
                  <hr className="border-t border-gray-700 my-2" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default GenreItem;
