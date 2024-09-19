"use client";
import Image from "next/image";
import { useState } from "react";
import { BiHeart } from "react-icons/bi";
import { BsThreeDots } from "react-icons/bs";

const GenreItem = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    "All",
    "Rock",
    "Country",
    "Gospel",
    "Hip Hop",
    "R & B",
    "Blues",
  ];

  const contents = [
    [
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
    ],
    [
      {
        image: "/images/album_cover1.svg",
        title: "Rock 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Rock 2",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
    ],
    [
      {
        image: "/images/album_cover1.svg",
        title: "Country 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Country 2",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
    ],
    [
      {
        image: "/images/album_cover1.svg",
        title: "Gospel 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Gospel 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
    ],
    [
      {
        image: "/images/album_cover1.svg",
        title: "Hip Hop 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Hip Hop 2",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
    ],
    [
      {
        image: "/images/album_cover1.svg",
        title: "R & B 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "R & B 2",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
    ],
    [
      {
        image: "/images/album_cover1.svg",
        title: "Blues 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Blues 2",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
      {
        image: "/images/album_cover1.svg",
        title: "Music 1",
        totalListen: "1,952,015,881",
        duration: "3:27",
      },
    ],
  ];

  return (
    <div className="mt-5">
      <div className="flex gap-2 justify-between items-center">
        {tabs.map((tab, index) => (
          <button
            onClick={() => setActiveTab(index)}
            key={`tab_${index}`}
            className={`w-[95px] text-sm text-wrap px-4 rounded-md ${
              activeTab === index ? "bg-[#950944] text-white" : "bg-[#5C5C5C]"
            } hover:bg-[#950944] py-2`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col  mx-auto">
        {contents &&
          contents.map((content, index) => {
            if (activeTab === index) {
              return (
                <div key={`content_${index}`}>
                  {content.map((item, i) => (
                    <div
                      key={`content_${i}`}
                      className="flex justify-between items-center w-[650px] pr-4 hover:border-t-[1.5px] hover:border-b-[1.5px] hover:border-l-neutral-600 hover:pr-4 hover:cursor-pointer"
                    >
                      <div className="flex gap-6 py-6 items-center">
                        <p className="ml-2 font-semibold">{i + 1}</p>
                        <div className="flex gap-2 items-center">
                          <Image
                            src={item.image}
                            width={34}
                            height={34}
                            alt={item.title}
                          />
                          <p className="hover:text-[#950944]">{item.title}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Image
                          src="images/icons/headphone.svg"
                          width={24}
                          height={24}
                          alt="head phone"
                        />
                        <p>{item.totalListen}</p>
                      </div>
                      <p className="flex gap-2 items-center">
                        <Image
                          src="images/icons/duration_icon.svg"
                          width={24}
                          height={24}
                          alt="Duration Icon"
                        />
                        {item.duration}
                      </p>

                      <p>
                        <BiHeart size={26} />
                      </p>

                      <p>
                        <BsThreeDots size={26} />
                      </p>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
      </div>
    </div>
  );
};

export default GenreItem;
