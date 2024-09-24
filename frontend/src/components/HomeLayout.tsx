"use client";

import Image from "next/image";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Carousel from "./Carousel";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const slides = [
    "/images/artist.svg",
    "/images/woman-with-headphone-front.png",
  ];

  return (
    <div className="flex h-screen relative">
      {/* Left Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col relative bg-cover bg-center bg-[url('/images/main_background.svg')] w-full h-full">
        {/* Navbar */}
        <Header />
        <div className="flex w-full h-full overflow-hidden relative ">
          {/* Main content area */}

          {/* Overlay for better text visibility */}
          {/* <div
                className="absolute inset-0 bg-gradient-to-b from-[#20123C] to-black/20 opacity-30"
                aria-hidden="true"
              ></div> */}

          {/* Main content */}
          <main className="flex flex-col text-white p-4 flex-1 h-full mt-16 overflow-y-auto no-scrollbar">
            {children}
          </main>

          {/* Right Sidebar */}
          <aside className=" w-64 bg-gradient-to-b from-[#20123C] via-black to-[#20123C]  text-white px-6  min-h-screen overflow-y-auto no-scrollbar">
            {/* Popular Artist */}
            <div className="flex justify-between flex-wrap mt-[108px]">
              <h2 className="text-md font-semibold mb-[20px]">
                Popular Artist
              </h2>
              <p className="text-md text-[#950944] font-semibold cursor-pointer">
                See All
              </p>
            </div>
            {/* End of popular artist */}

            <div className="flex flex-col rounded-md bg-gradient-to-t from-[#20123C] via-transparent to-white/80 h-[200px]">
              <Carousel autoSlide={true} autoSlideInterval={3000}>
                {[
                  ...slides.map((imgUrl, index) => (
                    <Image
                      key={index}
                      src={imgUrl}
                      height={245}
                      width={252}
                      alt="artist"
                    />
                  )),
                ]}
              </Carousel>
            </div>
            {/* End of popular artist */}

            {/* Recently Played */}
            <div className="flex justify-between flex-wrap mt-10">
              <h2 className="text-md font-semibold mb-[20px]">
                Recently Played
              </h2>
              <p className="text-md text-[#950944] font-semibold cursor-pointer">
                See All
              </p>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex justify-between items-center">
                <div className="flex justify-between gap-x-2 flex-wrap">
                  <Image
                    src="/images/album_cover1.svg"
                    width={44}
                    height={44}
                    alt="album cover"
                  />
                  <div>
                    <h2 className="text-md font-bold">Perfect</h2>
                    <p className="text-sm">Ed Sheran</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">2 min</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex justify-between gap-x-2 flex-wrap">
                  <Image
                    src="/images/album_cover2.svg"
                    width={44}
                    height={44}
                    alt="album cover"
                  />
                  <div>
                    <h2 className="text-md font-bold">Perfect</h2>
                    <p className="text-sm">Ed Sheran</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">2 min</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex justify-between gap-x-2 flex-wrap">
                  <Image
                    src="/images/album_cover1.svg"
                    width={44}
                    height={44}
                    alt="album cover"
                  />
                  <div>
                    <h2 className="text-md font-bold">Perfect</h2>
                    <p className="text-sm">Ed Sheran</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">2 min</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
