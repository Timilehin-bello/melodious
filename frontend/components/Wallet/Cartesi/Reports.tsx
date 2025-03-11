"use client";

import { ethers } from "ethers";
import React, { useEffect } from "react";
import { useReports } from "@/cartesi/hooks/useReports";
import toast from "react-hot-toast";

const Reports: React.FC = () => {
  const { loading, error, data, reports, refetch } = useReports();

  useEffect(() => {
    refetch({ requestPolicy: "network-only" });
  }, [refetch]);

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-gray-400">Oh no... {error.message}</p>;
  if (!data || !data.reports)
    return <p className="text-gray-400">No reports</p>;
  // toast.error(`Reports ${reports[reports.length - 1]?.payload}`);
  return (
    <div className="w-[1000px] overflow-x-hidden border border-gray-300 p-4 rounded-lg">
      <table className="w-full border-collapse text-white border border-gray-200">
        <thead>
          <tr className="">
            <th className="text-left p-2">Reports</th>
            <th className="p-2">
              <button
                className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                onClick={() => refetch({ requestPolicy: "network-only" })}
              >
                🔃
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {reports && reports.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center p-4">
                -
              </td>
            </tr>
          )}
          {reports &&
            reports.map((n: any) => (
              <tr key={`${n.input.index}-${n.index}`} className="border-b">
                <td className="p-2 text-white  text-wrap">{n.payload}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
