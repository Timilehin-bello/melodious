"use client";

import React, { useState } from "react";
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
  Play,
  Plus,
  TestTube,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RepositoryNoticesDemo: React.FC = () => {
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

  const [testLoading, setTestLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Helper function to make requests to Cartesi backend
  const sendInput = async (payload: any) => {
    try {
      const response = await fetch("http://localhost:8080/inspect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: Buffer.from(JSON.stringify(payload)).toString("hex"),
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error sending input:", error);
      throw error;
    }
  };

  const createTestUser = async () => {
    const userPayload = {
      method: "create_user",
      data: {
        name: `Test Artist ${Date.now()}`,
        role: "ARTIST",
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      },
    };

    return await sendInput(userPayload);
  };

  const createTestTrack = async () => {
    const trackPayload = {
      method: "create_track",
      data: {
        title: `Test Song ${Date.now()}`,
        artistName: "Test Artist",
        duration: Math.floor(Math.random() * 300) + 60,
        genre: "Pop",
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      },
    };

    return await sendInput(trackPayload);
  };

  const createTestPlaylist = async () => {
    const playlistPayload = {
      method: "create_playlist",
      data: {
        title: `Test Playlist ${Date.now()}`,
        description: "A test playlist for repository notices",
        isPublic: true,
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      },
    };

    return await sendInput(playlistPayload);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTestLoading(true);
    try {
      const result = await testFn();
      const message = `✅ ${testName} created successfully`;
      setTestResults((prev) => [...prev, message]);
      console.log(message, result);

      // Refresh repository data after a short delay
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error) {
      const message = `❌ ${testName} failed: ${error}`;
      setTestResults((prev) => [...prev, message]);
      console.error(message, error);
    } finally {
      setTestLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-zinc-900 rounded-lg border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TestTube className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">
            Repository Notices Demo
          </h2>
        </div>
        <button
          onClick={() => refetch()}
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
          {isFetching ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Test Controls */}
      <div className="mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          🧪 Test Repository Notices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button
            onClick={() => runTest("User", createTestUser)}
            disabled={testLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
              "bg-green-600 hover:bg-green-700 text-white font-medium",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Users className="w-4 h-4" />
            Create Test User
          </button>
          <button
            onClick={() => runTest("Track", createTestTrack)}
            disabled={testLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
              "bg-purple-600 hover:bg-purple-700 text-white font-medium",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Music className="w-4 h-4" />
            Create Test Track
          </button>
          <button
            onClick={() => runTest("Playlist", createTestPlaylist)}
            disabled={testLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
              "bg-yellow-600 hover:bg-yellow-700 text-white font-medium",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <List className="w-4 h-4" />
            Create Test Playlist
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-zinc-300">
                Test Results:
              </h4>
              <button
                onClick={clearResults}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm text-zinc-300 font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
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
                {repositoryData ? "✅ Available" : "❌ Not Available"}
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
                {stats?.hasConfig ? "✅ Available" : "❌ Not Set"}
              </div>
            </div>
          </div>

          {/* Data Preview */}
          {repositoryData ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                📋 Live Repository Data
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
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {users.map((user: any, index: number) => (
                      <div key={index} className="text-sm text-zinc-300">
                        • {user.name || user.id} ({user.role || "Unknown Role"})
                      </div>
                    ))}
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
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {tracks.map((track: any, index: number) => (
                      <div key={index} className="text-sm text-zinc-300">
                        • {track.title || track.id} by{" "}
                        {track.artistName || "Unknown Artist"}
                      </div>
                    ))}
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
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {playlists.map((playlist: any, index: number) => (
                      <div key={index} className="text-sm text-zinc-300">
                        • {playlist.title || playlist.id} (
                        {playlist.tracks?.length || 0} tracks)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <div>No repository data found</div>
              <div className="text-sm mt-1">
                Click the test buttons above to create sample data
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <h4 className="text-sm font-medium text-zinc-300 mb-2">
          🔍 How to Test Repository Notices:
        </h4>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>1. Open browser DevTools (F12) and go to Console tab</li>
          <li>2. Click the test buttons above to create sample data</li>
          <li>3. Watch the console for repository notice logs</li>
          <li>4. See the repository data update in real-time below</li>
          <li>5. Click "Refresh Data" to manually fetch latest notices</li>
          <li>
            6. All repository changes are automatically captured in notices
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RepositoryNoticesDemo;
