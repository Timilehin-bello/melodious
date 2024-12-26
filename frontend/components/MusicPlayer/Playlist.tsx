import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

const Playlist = () => {
  const { playlist, playTrack } = useMusicPlayer();

  return (
    <div className="mt-6 w-full">
      <h3 className="text-lg font-semibold">Playlist</h3>
      <ul className="mt-2 space-y-2">
        {playlist.map((track) => (
          <li
            key={track.id}
            className="p-2 rounded-lg hover:bg-gray-700 cursor-pointer flex items-center"
            onClick={() => playTrack(track)}
          >
            <img
              src={track.coverImage}
              alt={track.title}
              className="w-10 h-10 rounded-lg mr-4"
            />
            <div>
              <p className="text-sm font-medium">{track.title}</p>
              <p className="text-xs text-gray-400">{track.artist}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;
