import { Play } from "lucide-react";
import React, { useState } from "react";
import { AiOutlineEllipsis } from "react-icons/ai";

const SongListItem = ({ index, song }: any) => {
  const [showSongMenu, setShowSongMenu] = useState(false);

  return (
    <tr className="rounded hover:bg-[#950944] hover:rounded-md hover:cursor-pointer text-gray-200 group">
      <td>
        <span className="font-semibold group-hover:hidden p-4">
          {index + 1}
        </span>

        <Play className="h-4 w-4 hidden group-hover:block ml-4" />
      </td>
      <td className="flex items-center">
        <span className="p-2">
          <img className="h-10 w-10" src={song.imageUrl} alt={song.title} />
        </span>
        <span className="p-2">
          <span className="block">{song.title}</span>
          {/* <span className="block text-xs text-mygrey-200">{song.artist}</span> */}
        </span>
      </td>
      <td className="w-80">
        <span>{song.audio_src}</span>
      </td>
      <td>
        <button
          title="Like"
          className="song-player-button mygreen text-4xl rounded"
          onClick={() => setShowSongMenu(!showSongMenu)}
        >
          <AiOutlineEllipsis />
        </button>
        {showSongMenu && (
          <div className="flex flex-col absolute text-sm bg-mygrey-800 p-2 items-start rounded">
            <button
              className="py-2 px-4 hover:bg-mygrey-400 w-full rounded"
              //   onClick={() => {
              //     setShowSongMenu(!showSongMenu);
              //     let q = queue;
              //     q.push(song);
              //     console.log(q);
              //     updateQueue(q);
              //   }}
            >
              Add to Queue
            </button>
            <button
              className="py-2 px-4 hover:bg-mygrey-400 w-full rounded"
              onClick={() => {
                setShowSongMenu(!showSongMenu);
              }}
            >
              Add to Queue
            </button>
            <button
              className="py-2 px-4 hover:bg-mygrey-400 w-full rounded"
              onClick={() => {
                setShowSongMenu(!showSongMenu);
              }}
            >
              Add to Queue
            </button>
          </div>
        )}
      </td>
      <td className="w-80">
        <span>{song.duration}</span>
      </td>
    </tr>
  );
};

export default SongListItem;
