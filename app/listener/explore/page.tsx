import { EllipsisVertical, Play } from "lucide-react";
import Image from "next/image";

const page = () => {
  return (
    <div className="bg-black/15 mt-[-60px] pt-[65px] pb-[60px]">
      <div className="m-4 px-6">
        <div className="flex justify-between flex-wrap text-white px-2">
          <h2 className="font-bold text-2xl">
            Music <span className="text-[#910a43]">Genres</span>
          </h2>
          <p className="hover:text-white text-gray-300 transition-all cursor-pointer">
            See All
          </p>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5  gap-6">
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
        </div>
        <div className="flex justify-between flex-wrap text-white px-2 mt-12">
          <h2 className="font-bold text-2xl">
            Trending <span className="text-[#910a43] font-bold">Sounds</span>
          </h2>
          <p className="hover:text-white text-gray-300 transition-all cursor-pointer">
            See All
          </p>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/album.svg"
                alt="music genre"
                width={180}
                height={180}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex justify-between flex-wrap text-white px-2 ">
            <h2 className="font-bold text-2xl">
              Popular <span className="text-[#910a43] font-bold">Artist</span>
            </h2>
            <p className="hover:text-white text-gray-300 transition-all cursor-pointer">
              See All
            </p>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-7 gap-6">
            <div className="flex flex-col items-center cursor-pointer">
              <Image
                src="/images/artist_popular.svg"
                width={130}
                height={130}
                alt="artist name"
                className="rounded-full"
              />
              <h2 className="font-bold mt-2 text-white">Eminem</h2>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <Image
                src="/images/artist_popular.svg"
                width={130}
                height={130}
                alt="artist name"
                className="rounded-full"
              />
              <h2 className="font-bold mt-2 text-white">Eminem</h2>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <Image
                src="/images/artist_popular.svg"
                width={130}
                height={130}
                alt="artist name"
                className="rounded-full"
              />
              <h2 className="font-bold mt-2 text-white">Eminem</h2>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <Image
                src="/images/artist_popular.svg"
                width={130}
                height={130}
                alt="artist name"
                className="rounded-full"
              />
              <h2 className="font-bold mt-2 text-white">Eminem</h2>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <Image
                src="/images/artist_popular.svg"
                width={130}
                height={130}
                alt="artist name"
                className="rounded-full"
              />
              <h2 className="font-bold mt-2 text-white">Eminem</h2>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <Image
                src="/images/artist_popular.svg"
                width={130}
                height={130}
                alt="artist name"
                className="rounded-full"
              />
              <h2 className="font-bold mt-2 text-white">Eminem</h2>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <Image
                src="/images/popular_artist_billie.svg"
                width={130}
                height={130}
                alt="artist name"
                className="rounded-full"
              />
              <h2 className="font-bold mt-2 text-white">Billie Bierish</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
