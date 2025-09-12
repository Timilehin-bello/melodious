"use client";

import React, { useEffect } from "react";
import { useNoticesQuery } from "@/hooks/useNoticesQuery";
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  Bell,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NoticesQueryTest: React.FC = () => {
  const {
    data: notices,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isSuccess,
  } = useNoticesQuery();

  // Console log the notices data whenever it changes
  useEffect(() => {
    if (notices) {
      console.log("🔔 TanStack Query - Notices Data:", notices);
      console.log("📊 TanStack Query - Total Notices Count:", notices.length);

      // Log each notice individually for better visibility
      notices.forEach((notice, index) => {
        console.log(`📋 Notice ${index + 1}:`, {
          id: notice.id,
          index: notice.index,
          inputIndex: notice.input.index,
          payload: notice.payload,
        });
      });
    }
  }, [notices]);

  // Log loading states
  useEffect(() => {
    if (isLoading) {
      console.log("⏳ TanStack Query - Loading notices...");
    }
    if (isFetching) {
      console.log("🔄 TanStack Query - Fetching notices...");
    }
    if (isSuccess) {
      console.log("✅ TanStack Query - Successfully fetched notices");
    }
    if (isError) {
      console.error("❌ TanStack Query - Error fetching notices:", error);
    }
  }, [isLoading, isFetching, isSuccess, isError, error]);

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    refetch();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-zinc-900 rounded-lg border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">
            TanStack Query Notices Test
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            "bg-blue-600 hover:bg-blue-700",
            "text-white",
            "transition-all duration-200",
            "flex items-center gap-2",
            isFetching && "opacity-50 cursor-not-allowed"
          )}
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
          ) : isSuccess ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : isError ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : null}
          <span className="text-zinc-300">
            Status:{" "}
            {isLoading
              ? "Loading"
              : isSuccess
              ? "Success"
              : isError
              ? "Error"
              : "Idle"}
          </span>
        </div>
        {notices && (
          <div className="text-zinc-400">Count: {notices.length} notices</div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading notices...</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-8 text-red-400">
            <AlertCircle className="w-6 h-6 mr-2" />
            <div>
              <div className="font-medium">Error loading notices</div>
              <div className="text-sm text-red-300 mt-1">
                {error?.message || "Unknown error occurred"}
              </div>
            </div>
          </div>
        )}

        {isSuccess && notices && (
          <div>
            <div className="mb-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                📊 Query Results Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-zinc-300">
                  <span className="font-medium">Total Notices:</span>{" "}
                  {notices.length}
                </div>
                <div className="text-zinc-300">
                  <span className="font-medium">Query Status:</span> Success
                </div>
                <div className="text-zinc-300">
                  <span className="font-medium">Data Source:</span> TanStack
                  Query
                </div>
              </div>
            </div>

            {notices.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div>No notices found</div>
                <div className="text-sm mt-1">
                  Check the console for detailed logs
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  📋 Notices List (Check Console for Details)
                </h3>
                {notices.slice(0, 5).map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm text-zinc-400">
                        Notice #{notice.index} (Input #{notice.input.index})
                      </div>
                      <div className="text-xs text-zinc-500">
                        ID: {notice.id}
                      </div>
                    </div>
                    <div className="text-white font-mono text-sm break-all">
                      {notice.payload}
                    </div>
                  </div>
                ))}
                {notices.length > 5 && (
                  <div className="text-center py-2 text-zinc-500 text-sm">
                    ... and {notices.length - 5} more notices (check console for
                    full list)
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <h4 className="text-sm font-medium text-zinc-300 mb-2">
          🔍 Console Logging Instructions:
        </h4>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Open browser DevTools (F12)</li>
          <li>• Go to Console tab</li>
          <li>• Look for messages starting with 🔔, 📊, 📋</li>
          <li>• Click "Refresh" to trigger a new query</li>
          <li>• All notices data is logged to console for inspection</li>
        </ul>
      </div>
    </div>
  );
};

export default NoticesQueryTest;
