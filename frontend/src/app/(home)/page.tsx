import GenreItem from "@/components/GenreItem";
import HomeLayout from "@/components/HomeLayout";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Home | Melodious Music Platform",
  description: "Home Page of Melodious Music Application",
};

const Home = () => {
  return (
    <HomeLayout>
      <div className="text-white mt-8">
        {/* Banner */}
        <div className="rounded-lg  bg-cover bg-center bg-no-repeat bg-[url('/images/icons/banner.svg')]  w-full">
          {/* Background overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-[#101010] to-black/20 opacity-30"></div> */}
          {/* End of Background overlay */}

          <div className="flex justify-between items-center">
            <div className="px-8 z-10">
              <Image
                src="/images/melodious_text.svg"
                height={37}
                width={149}
                alt="melodious text"
              />

              <h2 className="text-6xl font-bold mt-4">New Released Sounds</h2>
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

        {/* Trending Music */}
        <div className="mt-10">
          <div className="flex justify-between z-10">
            <h2 className="text-xl font-semibold">Trending Music</h2>
            <p className="text-sm text-[#9B9B9B] font-semibold cursor-pointer hover:text-white">
              See All
            </p>
          </div>

          {/* music list - to be converted to a component */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 items-center mt-6 overflow-auto">
            <div className="flex flex-col align-middle rounded-[25px] border-2">
              <Image
                src="/images/woman-with-headphone-front.png"
                height={216}
                width={205}
                alt="Music"
              />
              <div className="flex justify-between items-end p-2">
                <div className="text-sm ">
                  <h2>Alternative Music</h2>
                  <p>51 Songs, 2h 50 min</p>
                </div>
                <Image
                  src="/images/icons/play.svg"
                  height={34.29}
                  width={34.29}
                  alt="Play button"
                />
              </div>
            </div>
            <div className="flex flex-col align-middle rounded-[25px] border-2 ">
              <Image
                src="/images/woman-with-headphone-front.png"
                height={216}
                width={205}
                alt="Music"
              />
              <div className="flex justify-between items-end p-2">
                <div className="text-sm ">
                  <h2>Alternative Music</h2>
                  <p>51 Songs, 2h 50 min</p>
                </div>
                <Image
                  src="/images/icons/play.svg"
                  height={34.29}
                  width={34.29}
                  alt="Play button"
                />
              </div>
            </div>
            <div className="flex flex-col align-middle rounded-[25px] border-2 ">
              <Image
                src="/images/woman-with-headphone-front.png"
                height={216}
                width={205}
                alt="Music"
              />
              <div className="flex justify-between items-end p-2">
                <div className="text-sm ">
                  <h2>Alternative Music</h2>
                  <p>51 Songs, 2h 50 min</p>
                </div>
                <Image
                  src="/images/icons/play.svg"
                  height={34.29}
                  width={34.29}
                  alt="Play button"
                />
              </div>
            </div>
            <div className="flex flex-col align-middle rounded-[25px] border-2 ">
              <Image
                src="/images/woman-with-headphone-front.png"
                height={216}
                width={205}
                alt="Music"
              />
              <div className="flex justify-between items-end p-2">
                <div className="text-sm ">
                  <h2>Alternative Music</h2>
                  <p>51 Songs, 2h 50 min</p>
                </div>
                <Image
                  src="/images/icons/play.svg"
                  height={34.29}
                  width={34.29}
                  alt="Play button"
                />
              </div>
            </div>
          </div>
        </div>
        {/* End of Trending Music */}

        {/* Genre - to be converted to a component */}
        <div className="mt-8">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Music Genre</h2>
            <p className="text-sm text-[#9B9B9B] font-semibold cursor-pointer hover:text-white">
              See All
            </p>
          </div>

          {/* <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 items-center  mt-6">
          <div className="flex flex-col rounded-lg border-2 border-black">
            <Image
              src="/images/woman-with-headphone-front.png"
              height={216}
              width={205}
              alt="Music"
            />
            <div className="flex justify-between items-end p-2">
              <div className="text-sm ">
                <h2>Alternative Music</h2>
                <p>51 Songs, 2h 50 min</p>
              </div>
              <Image
                src="/images/icons/play.svg"
                height={34.29}
                width={34.29}
                alt="Play button"
              />
            </div>
          </div>
          <div className="flex flex-col rounded-lg border-2 border-black">
            <Image
              src="/images/woman-with-headphone-front.png"
              height={216}
              width={205}
              alt="Music"
            />
            <div className="flex gap-x-2 justify-between items-end p-2">
              <div className="text-sm ">
                <h2>Alternative Music</h2>
                <p>51 Songs, 2h 50 min</p>
              </div>
              <Image
                src="/images/icons/play.svg"
                height={34.29}
                width={34.29}
                alt="Play button"
              />
            </div>
          </div>
          <div className="flex flex-col rounded-lg border-2 border-black">
            <Image
              src="/images/woman-with-headphone-front.png"
              height={216}
              width={205}
              alt="Music"
            />
            <div className="flex gap-x-2 justify-between items-end p-2">
              <div className="text-sm ">
                <h2>Alternative Music</h2>
                <p>51 Songs, 2h 50 min</p>
              </div>
              <Image
                src="/images/icons/play.svg"
                height={34.29}
                width={34.29}
                alt="Play button"
              />
            </div>
          </div>
          <div className="flex flex-col rounded-lg border-2 border-black">
            <Image
              src="/images/woman-with-headphone-front.png"
              height={216}
              width={205}
              alt="Music"
            />
            <div className="flex gap-x-2 justify-between items-end p-2">
              <div className="text-sm ">
                <h2>Alternative Music</h2>
                <p>51 Songs, 2h 50 min</p>
              </div>
              <Image
                src="/images/icons/play.svg"
                height={34.29}
                width={34.29}
                alt="Play button"
              />
            </div>
          </div>
        </div> */}
          <div>
            <GenreItem />
          </div>
        </div>
        {/* End of Genre */}
      </div>
    </HomeLayout>
  );
};

export default Home;
