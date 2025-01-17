"use client";
import { usePlayer } from "@/contexts/melodious/PlayerContext";
import { useFetch } from "../../hooks/useFetch";
import { Track } from "@/types";
import { useState } from "react";

const AlbumPage: React.FC = () => {
  //   const { data: album, loading, error } = useFetch<Track>(`/api/album/1`);
  const [data, setData] = useState({
    id: 1,
    title: "Michael Song",
    imageUrl: "/images/artist.svg",
    audioUrl: "/audio/song1.mp3",
    genreId: 1,
    isrcCode: "222222",
    isPublished: "true",
    artist: "Michael Ola",
  });
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const { playPlaylist, playTrack } = usePlayer();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{data?.title}</h1>
      <button
        onClick={() => playTrack(data)}
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        Play Album
      </button>
    </div>
  );
};

export default AlbumPage;
