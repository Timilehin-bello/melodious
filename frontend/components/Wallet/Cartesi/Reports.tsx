"use client";

import React, { useEffect, useState } from "react";
import { useReports } from "@/cartesi/hooks/useReports";
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Reports: React.FC = () => {
  const { loading, error, data, reports, refetch } = useReports();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refetch({ requestPolicy: "network-only" });
  }, [refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch({ requestPolicy: "network-only" });
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-red-400">
        <XCircle className="w-6 h-6 mr-2" />
        <span>Error: {error.message}</span>
      </div>
    );
  }

  if (!data || !data.reports) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>No reports available</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-white">Reports</h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium",
              "bg-zinc-800 hover:bg-zinc-700",
              "text-zinc-300 hover:text-white",
              "transition-all duration-200",
              "flex items-center gap-2",
              isRefreshing && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn("w-4 h-4", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Reports List */}
        <div className="divide-y divide-zinc-800/50">
          <AnimatePresence>
            {reports && reports.length === 0 ? (
              <div className="px-6 py-8 text-center text-zinc-500">
                No reports to display
              </div>
            ) : (
              reports.map((report: any, index: number) => (
                <motion.div
                  key={`${report.input.index}-${report.index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "px-6 py-4",
                    "hover:bg-zinc-800/30 transition-colors duration-200"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-zinc-300 break-words">
                        {report.payload}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        Input Index: {report.input.index} • Report Index:{" "}
                        {report.index}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Reports;
