import {
  Tabs2,
  TabsContent,
  TabsList2,
  TabsTrigger2,
} from "@/components/ui/tabs2";
import {
  Clock,
  Ellipsis,
  HeadphonesIcon,
  Heart,
  ListMusic,
  Play,
} from "lucide-react";
import Image from "next/image";
import React from "react";

interface GenreProps {
  genres: any;
  playSong?: () => void;
}

const ArtistTabs: React.FC<GenreProps> = ({ genres, playSong }) => {
  return (
    <Tabs2 defaultValue={genres[0].name} className="w-full">
      <div className="flex justify-between items-center">
        <TabsList2 className="flex space-x-2 text-gray-500 text-sm">
          {genres.map((genre: any) => (
            <TabsTrigger2 key={genre.name} value={genre.name}>
              {genre.name}
            </TabsTrigger2>
          ))}
        </TabsList2>

        <button className="hover:text-gray-400 text-sm">See More</button>
      </div>
      <div className="flex justify-between w-50 text-white px-4 mt-2 mb-2">
        <div className="flex gap-10">
          <p>#</p>
          <p>Title</p>
        </div>
        <p>Time</p>
      </div>
      {genres.map((genre: any) => (
        <TabsContent key={genre.name} value={genre.name}>
          <div className="">
            <div className="flex flex-col w-full">
              {genre.songs.map((song: any, index: any) => (
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
                      <p>{song.duration}</p>
                      <p>
                        <ListMusic size={22} />
                      </p>
                      <div className="flex">
                        <Ellipsis size={22} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs2>
  );
};

export default ArtistTabs;
