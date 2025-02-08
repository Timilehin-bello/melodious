import { CustomAreaChart } from "@/components/CustomAreaChart";
import {
  Banknote,
  ChartNoAxesColumn,
  Music2,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="px-4 mt-6 mb-4">
      <h1 className="text-white text-2xl">Dashboard Overview</h1>

      <div className="flex flex-1 flex-col gap-4  pt-0 mt-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4 sm:grid-cols-2">
          {/* <div className="aspect-video rounded-xl bg-muted/50" /> */}
          <div
            className="bg-gradient-to-br from-[rgba(230,230,248,0.35)] via-[#2A1A4B]/35 to-[rgba(199,198,216,0.35)] 
      shadow-[0px_51px_69px_0px_rgba(23,18,43,0.58)] px-4 py-8 rounded-xl"
          >
            <div className="flex justify-between flex-wrap items-start">
              <div>
                <p className="text-white text-sm mb-3">Songs Uploaded</p>
                <h4 className="text-white font-semibold text-2xl">40589</h4>
              </div>

              <div className="rounded-lg w-10 h-10 bg-[#8280FF] py-1 px-2">
                <Music2 size={26} className="text-white text-center" />
              </div>
            </div>

            <div className="flex items-center mt-3">
              <TrendingUp size={24} className="text-green-700" />
              <p className="text-white">
                <span className="text-green-700">8.5% Up</span> from yesterday
              </p>
            </div>
          </div>
          {/* <div className="aspect-video rounded-xl bg-muted/50" /> */}
          <div
            className="bg-gradient-to-br from-[rgba(230,230,248,0.35)] via-[#2A1A4B]/35 to-[rgba(199,198,216,0.35)] 
      shadow-[0px_51px_69px_0px_rgba(23,18,43,0.58)] px-4 py-8 rounded-xl"
          >
            <div className="flex justify-between flex-wrap items-start">
              <div>
                <p className="text-white text-sm mb-3">Listening Time</p>
                <h4 className="text-white font-semibold text-2xl">40589</h4>
              </div>

              <div className="rounded-lg w-10 h-10 bg-[#FEC53D] py-1 px-2">
                <ChartNoAxesColumn
                  size={26}
                  className="text-white text-center"
                />
              </div>
            </div>

            <div className="flex items-center mt-3">
              <TrendingUp size={24} className="text-green-700" />
              <p className="text-white">
                <span className="text-green-700">8.5% Up</span> from yesterday
              </p>
            </div>
          </div>
          <div
            className="bg-gradient-to-br from-[rgba(230,230,248,0.35)] via-[#2A1A4B]/35 to-[rgba(199,198,216,0.35)] 
      shadow-[0px_51px_69px_0px_rgba(23,18,43,0.58)] px-4 py-8 rounded-xl"
          >
            <div className="flex justify-between flex-wrap items-start">
              <div>
                <Link href="/artist/wallet">
                  <p className="text-white text-sm mb-3">
                    Total Amount <br /> earned
                  </p>
                  <h4 className="text-white font-semibold text-2xl">40589</h4>
                </Link>
              </div>

              <div className="rounded-lg w-10 h-10 bg-[#950944] py-1 px-2">
                <Banknote size={26} className="text-white text-center" />
              </div>
            </div>

            <div className="flex items-center mt-3">
              <TrendingUp size={24} className="text-green-700" />
              <p className="text-white">
                <span className="text-green-700">8.5% Up</span> from yesterday
              </p>
            </div>
          </div>
          <div
            className="bg-gradient-to-br from-[rgba(230,230,248,0.35)] via-[#2A1A4B]/35 to-[rgba(199,198,216,0.35)] 
      shadow-[0px_51px_69px_0px_rgba(23,18,43,0.58)] px-4 py-8 rounded-xl"
          >
            <div className="flex justify-between flex-wrap items-start">
              <div>
                <p className="text-white text-sm mb-3">Total Followers</p>
                <h4 className="text-white font-semibold text-2xl">40589</h4>
              </div>

              <div className="rounded-lg w-10 h-10 bg-[#FF9066] py-1 px-2">
                <UserRoundCheck size={26} className="text-white text-center" />
              </div>
            </div>

            <div className="flex items-center mt-3">
              <TrendingUp size={24} className="text-green-700" />
              <p className="text-white">
                <span className="text-green-700">8.5% Up</span> from yesterday
              </p>
            </div>
          </div>

          {/* <div className="aspect-video rounded-xl bg-muted/50" /> */}
          {/* <div className="aspect-video rounded-xl bg-muted/50" /> */}
        </div>
        {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
      </div>

      <div className="flex  items-start gap-2 w-full mt-8 text-white">
        <div className="w-3/4 md:w-3/4 sm:w-full">
          <CustomAreaChart />
        </div>
        <div className="mx-auto w-1/4 md:w-1/4 sm:w-full bg-[#2A1A4B] rounded-lg">
          <div
            className="text-center w-full h-[212px] bg-gradient-to-br from-[rgba(230,230,248,0.35)] via-[#2A1A4B]/35 to-[rgba(199,198,216,0.35)] 
      shadow-[0px_51px_69px_0px_rgba(23,18,43,0.58)] rounded-tl-[10px]"
          >
            <Image
              src="/images/musicnote.svg"
              alt="music note icon"
              width={215}
              height={204}
            />
          </div>
          <div className="text-sm text-gray-400 px-4">
            <h3>DISTRIBUTION</h3>
            <p>Create a release</p>
            <p className="text-white">
              Release music to over 150 digital storefronts around the world and
              keep up to 100% of the sales royalties.
            </p>
            <div className="mx-auto text-center mt-4 mb-4">
              <button className="bg-[#8D184E] px-6 py-2 rounded-lg text-center text-white">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 mt-8 bg-[#181425] rounded-lg">
        <div className="flex justify-between text-white">
          <h2 className="text-xl font-semibold">Song Analyics</h2>
          <p className="text-gray-500 font-semibold">See All</p>
        </div>

        <div className="flex gap-14 px-2 py-3 mt-4 mb-2 bg-[#323D4E] rounded-lg text-white text-sm font-semibold">
          <p className="w-36 space-x-2">Song Name</p>
          <p className="w-36 space-x-2">Streams</p>
          <p className="w-36 space-x-2">Date Uploaded</p>
          <p className="w-36 space-x-2">Views</p>
          <p className="w-36 space-x-2">Repost</p>
        </div>
        <div className="mb-2">
          <div className="flex items-center gap-14  px-2 py-2 mt-3 text-sm text-white">
            <div className="w-36 space-x-2 flex items-center gap-2">
              <Image
                src="/images/woman-with-headphone-front.png"
                alt=""
                width={36}
                height={36}
                className="rounded-full"
              />
              <p>Apple Watch</p>
            </div>
            <p className="w-36 space-x-2">384</p>
            <p className="w-36 space-x-2">12.09.2019 - 12.53 PM</p>
            <p className="w-36 space-x-2">423</p>
            <p className="w-36 space-x-2">
              <Link
                href="/artist/song-analytics"
                className="bg-[#950944] text-white py-3 px-4 rounded-lg"
              >
                Song Analytics
              </Link>
            </p>
          </div>
          <hr className="border-t border-[#979797] my-3" />
        </div>
        <div className="mb-2">
          <div className="flex items-center gap-14  px-2 py-2 mt-3 text-sm text-white">
            <div className="w-36 space-x-2 flex items-center gap-2">
              <Image
                src="/images/woman-with-headphone-front.png"
                alt=""
                width={36}
                height={36}
                className="rounded-full"
              />
              <p>Apple Watch</p>
            </div>
            <p className="w-36 space-x-2">384</p>
            <p className="w-36 space-x-2">12.09.2019 - 12.53 PM</p>
            <p className="w-36 space-x-2">423</p>
            <p className="w-36 space-x-2">
              <Link
                href="/artist/song-analytics"
                className="bg-[#950944] text-white py-3 px-4 rounded-lg"
              >
                Song Analytics
              </Link>
            </p>
          </div>
          <hr className="border-t border-[#979797] my-3" />
        </div>
        <div className="mb-2">
          <div className="flex items-center gap-14  px-2 py-2 mt-3 text-sm text-white">
            <div className="w-36 space-x-2 flex items-center gap-2">
              <Image
                src="/images/woman-with-headphone-front.png"
                alt=""
                width={36}
                height={36}
                className="rounded-full"
              />
              <p>Apple Watch</p>
            </div>
            <p className="w-36 space-x-2">384</p>
            <p className="w-36 space-x-2">12.09.2019 - 12.53 PM</p>
            <p className="w-36 space-x-2">423</p>
            <p className="w-36 space-x-2">
              <Link
                href="/artist/song-analytics"
                className="bg-[#950944] text-white py-3 px-4 rounded-lg"
              >
                Song Analytics
              </Link>
            </p>
          </div>
          <hr className="border-t border-[#979797] my-3" />
        </div>
      </div>
    </div>
  );
}
