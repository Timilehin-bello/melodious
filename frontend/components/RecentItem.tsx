import Image from "next/image";
import React from "react";

interface RecentItemProps {
  title: string;
  artistName: string;
  duration: string;
}

const RecentItem: React.FC<RecentItemProps> = ({
  title,
  artistName,
  duration,
}) => {
  return (
    <div className="flex justify-between flex-wrap align-middle items-center">
      <div className="flex gap-2">
        <Image
          src="/images/artist.svg"
          alt="song image"
          width={34}
          height={34}
          className="rounded-lg"
        />
        <div className="flex flex-col">
          <h3 className="text-sm text-white">{title}</h3>
          <p className="text-sm text-gray-300">{artistName}</p>
        </div>
      </div>
      <p className="text-gray-300 text-md">{duration}</p>
    </div>
  );
};

export default RecentItem;
