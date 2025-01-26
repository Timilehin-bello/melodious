"use client";
import { Timer } from "lucide-react";
import React from "react";

import SongListItem from "./SongListItem";

const SongList = ({ songList }: any) => {
  return (
    <div>
      <div>
        {/* <div className="p-4 flex items-center gap-4">
              <button
                className="bg-mygrey-600 rounded-[50%] text-6xl"
                onClick={() => {
                  console.log("hello");
                  setPlay(!play);
                }}
              >
                {play ? (
                  <BsPauseFill className="text-mygreen" />
                ) : (
                  <BsFillPlayCircleFill className="text-mygreen" />
                )}
              </button>
              <button
                title="Like"
                className="song-player-button mygreen text-4xl"
                onClick={handleLikeClick}
              >
                {liked ? (
                  <BsChatRightHeartFill className="text-mygreen" />
                ) : (
                  <HeartIcon />
                )}
              </button>
              <button
                title="Like"
                className="song-player-button mygreen text-4xl"
                onClick={() => setShowSongMenu(!showSongMenu)}
              >
                <AiOutlineEllipsis />
                <div className="w-12"></div>
              </button>
            </div> */}

        <table className="table-auto w-full mb-24">
          {/* <thead className="flex gap-4 text-left rounded p-2 text-mygrey-200 uppercase font-normal text-sm"> */}
          <thead className="bg-[#1C1C32]/[0.5] text-left rounded text-gray-200 uppercase font-normal text-sm">
            <tr>
              <th>
                <span className="p-4">{"#"}</span>
              </th>
              <th>
                <span className="p-2">{"Title"}</span>
              </th>
              <th>
                <span className="p-2">{"Album"}</span>
              </th>
              <th>
                <span className="p-2">
                  <Timer />
                </span>
              </th>
              <th>{"Duration"}</th>
            </tr>
          </thead>
          <tbody>
            {songList.map((song: any, index: number) => {
              return <SongListItem index={index} song={song} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SongList;
