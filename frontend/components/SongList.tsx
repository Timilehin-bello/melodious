"use client";
import { Timer } from "lucide-react";

import { client } from "@/lib/client";

import {
  useActiveWalletConnectionStatus,
  useConnectModal,
} from "thirdweb/react";
import { useMelodiousContext } from "@/contexts/melodious";
import { usePlayer } from "@/contexts/melodious/PlayerContext";

import SongListItem from "./SongListItem";

const SongList = ({ songList }: any) => {
  const { connect } = useConnectModal();
  // const onPlay = useOnPlay(tracks);
  const status = useActiveWalletConnectionStatus();
  const { setConditionFulfilled } = useMelodiousContext();
  const { playTrack, playPlaylist } = usePlayer();

  const playSong = async (song: any) => {
    // console.log("id", id);
    if (status === "disconnected") {
      await connect({ client, size: "compact" }); // opens the connect modal
    }
    // alert("Play Song ");
    // onPlay(id)

    if (typeof song === "object") {
      playTrack(song);
    }
    // playPlaylist(song);
  };
  return (
    <div>
      <div>
        <table className="table-auto w-full mb-24">
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
                <span className="p-2 ">
                  <Timer />
                </span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {songList.map((song: any, index: number) => {
              return (
                <SongListItem
                  index={index}
                  song={song}
                  playSong={() => playSong(song)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SongList;
