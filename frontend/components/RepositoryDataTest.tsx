"use client";

import React, { useEffect } from "react";
import { useRepositoryDataJsonRpc } from "@/hooks/useNoticesJsonRpcQuery";
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  Database,
  Users,
  Music,
  Disc,
  List,
  Mic,
  Headphones,
  Tag,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RepositoryDataTest: React.FC = () => {
  const {
    repositoryData,
    users,
    albums,
    tracks,
    playlists,
    artists,
    listeners,
    genres,
    config,
    stats,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isSuccess,
  } = useRepositoryDataJsonRpc();

  // Console log the repository data whenever it changes
  useEffect(() => {
    if (repositoryData) {
      console.log("🗄️ Repository Data:", repositoryData);
      console.log("📊 Repository Stats:", stats);
      console.log("👥 Users:", users);
      console.log("💿 Albums:", albums);
      console.log("🎵 Tracks:", tracks);
      console.log("📋 Playlists:", playlists);
      console.log("🎤 Artists:", artists);
      console.log("🎧 Listeners:", listeners);
      console.log("🏷️ Genres:", genres);
      console.log("⚙️ Config:", config);
    }
  }, [
    repositoryData,
    stats,
    users,
    albums,
    tracks,
    playlists,
    artists,
    listeners,
    genres,
    config,
  ]);

  // Log loading states
  useEffect(() => {
    if (isLoading) {
      console.log("⏳ Repository Data - Loading...");
    }
    if (isFetching) {
      console.log("🔄 Repository Data - Fetching...");
    }
    if (isSuccess) {
      console.log("✅ Repository Data - Successfully loaded");
    }
    if (isError) {
      console.error("❌ Repository Data - Error:", error);
    }
  }, [isLoading, isFetching, isSuccess, isError, error]);

  const handleRefresh = () => {
    console.log("🔄 Manually refreshing repository data...");
    refetch();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-zinc-900 rounded-lg border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">
            Repository Data Test
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            "bg-blue-600 hover:bg-blue-700 text-white font-medium",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading repository data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <span>Error loading repository data: {error?.message}</span>
          </div>
        </div>
      )}

      {/* Success State */}
      {isSuccess && (
        <div className="space-y-6">
          {/* Repository Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-zinc-400">Users</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.usersCount}
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-zinc-400">Tracks</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.tracksCount}
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <Disc className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-zinc-400">Albums</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.albumsCount}
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <List className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-zinc-400">Playlists</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.playlistsCount}
                </div>
              </div>
            </div>
          )}

          {/* Repository Data Status */}
          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              Repository Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="text-zinc-300">
                <span className="font-medium">Repository Data:</span>{" "}
                {repositoryData ? "Available" : "Not Available"}
              </div>
              <div className="text-zinc-300">
                <span className="font-medium">Last Updated:</span>{" "}
                {repositoryData?.timestamp || "N/A"}
              </div>
              <div className="text-zinc-300">
                <span className="font-medium">Artists:</span>{" "}
                {stats?.artistsCount || 0}
              </div>
              <div className="text-zinc-300">
                <span className="font-medium">Listeners:</span>{" "}
                {stats?.listenersCount || 0}
              </div>
              <div className="text-zinc-300">
                <span className="font-medium">Genres:</span>{" "}
                {stats?.genresCount || 0}
              </div>
              <div className="text-zinc-300">
                <span className="font-medium">Config:</span>{" "}
                {stats?.hasConfig ? "Available" : "Not Set"}
              </div>
            </div>
          </div>

          {/* Data Preview */}
          {repositoryData ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                📋 Data Preview (Check Console for Full Details)
              </h3>

              {/* Users Preview */}
              {users.length > 0 && (
                <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-white">
                      Users ({users.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {users.slice(0, 3).map((user: any, index: number) => (
                      <div key={index} className="text-sm text-zinc-300">
                        • {user.name || user.id} ({user.role || "Unknown Role"})
                      </div>
                    ))}
                    {users.length > 3 && (
                      <div className="text-xs text-zinc-500">
                        ... and {users.length - 3} more users
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tracks Preview */}
              {tracks.length > 0 && (
                <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Music className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-white">
                      Tracks ({tracks.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tracks.slice(0, 3).map((track: any, index: number) => (
                      <div key={index} className="text-sm text-zinc-300">
                        • {track.title || track.id} by{" "}
                        {track.artistName || "Unknown Artist"}
                      </div>
                    ))}
                    {tracks.length > 3 && (
                      <div className="text-xs text-zinc-500">
                        ... and {tracks.length - 3} more tracks
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Playlists Preview */}
              {playlists.length > 0 && (
                <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center gap-2 mb-3">
                    <List className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-white">
                      Playlists ({playlists.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {playlists
                      .slice(0, 3)
                      .map((playlist: any, index: number) => (
                        <div key={index} className="text-sm text-zinc-300">
                          • {playlist.title || playlist.id} (
                          {playlist.tracks?.length || 0} tracks)
                        </div>
                      ))}
                    {playlists.length > 3 && (
                      <div className="text-xs text-zinc-500">
                        ... and {playlists.length - 3} more playlists
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <div>No repository data found</div>
              <div className="text-sm mt-1">
                Repository notices may not have been emitted yet
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <h4 className="text-sm font-medium text-zinc-300 mb-2">
          🔍 Console Logging Instructions:
        </h4>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Open browser DevTools (F12)</li>
          <li>• Go to Console tab</li>
          <li>• Look for messages starting with 🗄️, 📊, 👥, 💿, etc.</li>
          <li>• Click "Refresh" to trigger a new query</li>
          <li>• All repository data is logged to console for inspection</li>
          <li>• Create/update data in the backend to see repository notices</li>
        </ul>
      </div>
    </div>
  );
};

export default RepositoryDataTest;
