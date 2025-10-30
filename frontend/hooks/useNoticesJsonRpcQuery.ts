import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useMemo } from "react";
import { DAPP_ADDRESS } from "@/lib/constants";

// JSON-RPC Types based on Cartesi API documentation
interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params: Record<string, any>;
  id: number;
}

interface JsonRpcResponse<T = any> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

// Epoch response type
interface EpochIndexResponse {
  data: string; // hex encoded epoch index
}

// Output types
interface OutputNode {
  index: string; // hex encoded
  input: {
    index: string; // hex encoded
  };
  payload: string; // hex encoded
}

// JSON-RPC Response Types
interface OutputItem {
  epoch_index: string;
  input_index: string;
  index: string;
  raw_data: string;
  decoded_data: {
    type: string;
    payload: string;
  };
  hash: string;
  output_hashes_siblings: string[];
  execution_transaction_hash: string;
  created_at: string;
  updated_at: string;
}

interface OutputsResponse {
  data: OutputItem[];
  pagination: {
    total_count: number;
    limit: number;
    offset: number;
  };
}

// Notice type definition (compatible with existing Notice type)
export type JsonRpcNotice = {
  id: string;
  index: number;
  input: {
    index: number;
    payload: string;
  };
  payload: string;
};

// JSON-RPC client function
const makeJsonRpcCall = async <T>(
  method: string,
  params: Record<string, any>
): Promise<T> => {
  const jsonRpcUri = process.env.NEXT_PUBLIC_CARTESI_JSON_RPC_URL;

  if (!jsonRpcUri) {
    throw new Error("Cartesi JSON-RPC URI not configured");
  }

  const request: JsonRpcRequest = {
    jsonrpc: "2.0",
    method,
    params,
    id: Date.now(),
  };

  console.log(` jsonrpc 🔍 Making JSON-RPC call to ${method}:`, request);

  const response = await fetch(jsonRpcUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const jsonResponse: JsonRpcResponse<T> = await response.json();

  if (jsonResponse.error) {
    throw new Error(`JSON-RPC error: ${jsonResponse.error.message}`);
  }

  if (!jsonResponse.result) {
    throw new Error("No result in JSON-RPC response");
  }

  return jsonResponse.result;
};

// Function to get the last accepted epoch index
const fetchLastAcceptedEpochIndex = async (): Promise<string> => {
  if (!DAPP_ADDRESS) {
    throw new Error("DAPP_ADDRESS not configured");
  }

  console.log(
    " jsonrpc 🔍 Fetching last accepted epoch index for app:",
    DAPP_ADDRESS
  );

  const result = await makeJsonRpcCall<EpochIndexResponse>(
    "cartesi_getLastAcceptedEpochIndex",
    {
      application: DAPP_ADDRESS,
    }
  );

  console.log(" jsonrpc 📋 Last accepted epoch index:", result.data);
  return result.data;
};

// Function to fetch notices using JSON-RPC
const fetchNoticesJsonRpc = async (): Promise<JsonRpcNotice[]> => {
  if (!DAPP_ADDRESS) {
    throw new Error("DAPP_ADDRESS not configured");
  }

  console.log(
    " jsonrpc 🔍 Fetching notices via JSON-RPC for app:",
    DAPP_ADDRESS
  );

  // First, get the last accepted epoch index
  const epochIndex = await fetchLastAcceptedEpochIndex();

  // Then, fetch outputs (notices) for that epoch
  const result = await makeJsonRpcCall<OutputsResponse>("cartesi_listOutputs", {
    application: DAPP_ADDRESS,
    epoch_index: epochIndex,
    output_type: "0xc258d6e5", // Filter for notices only Notice
    limit: 50, // Reasonable limit
    offset: 0,
  });

  console.log(" jsonrpc 📋 Total notices found via JSON-RPC:", result.data);

  if (!result.data || result.data.length === 0) {
    console.log(" jsonrpc 📋 No notices found via JSON-RPC");
    return [];
  }

  console.log(" jsonrpc 📋 Raw JSON-RPC notices data:", result.data);

  // Transform and process notices (using decoded_data.payload directly)
  const processedNotices: JsonRpcNotice[] = result.data
    .map((output) => {
      // Use decoded_data.payload directly instead of manual decoding
      let payload = output.decoded_data?.payload;

      console.log(" jsonrpc Raw decoded output payload --", output);

      if (!payload) {
        payload = "(empty)";
      } else {
        payload = ethers.utils.toUtf8String(payload);
        console.log(" jsonrpc 📄 Manually decoded payload:", payload);
      }

      // Convert hex indices to numbers
      const inputIndex = parseInt(output.input_index, 16);
      const noticeIndex = parseInt(output.index, 16);

      return {
        id: `jsonrpc-notice-${inputIndex}-${noticeIndex}`,
        index: noticeIndex,
        payload: payload,
        input: {
          index: inputIndex,
          payload: "(processed)", // Placeholder for input payload
        },
      };
    })
    .sort((a, b) => {
      // Sort by input index first, then by notice index (both descending)
      if (a.input.index === b.input.index) {
        return b.index - a.index;
      }
      return b.input.index - a.input.index;
    });

  console.log(" jsonrpc finally processed notices:", processedNotices);
  return processedNotices;
};

// Query keys for JSON-RPC notices
export const jsonRpcNoticesKeys = {
  all: ["notices-jsonrpc"] as const,
  lists: () => [...jsonRpcNoticesKeys.all, "list"] as const,
  epochIndex: () => [...jsonRpcNoticesKeys.all, "epoch-index"] as const,
};

// TanStack Query hook for fetching last accepted epoch index
export const useLastAcceptedEpochQuery = () => {
  return useQuery({
    queryKey: jsonRpcNoticesKeys.epochIndex(),
    queryFn: fetchLastAcceptedEpochIndex,
    staleTime: 30000, // Consider epoch index fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// TanStack Query hook for fetching notices via JSON-RPC
export const useNoticesJsonRpcQuery = () => {
  return useQuery({
    queryKey: jsonRpcNoticesKeys.lists(),
    queryFn: fetchNoticesJsonRpc,
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Repository notice types (same as existing implementation)
interface RepositoryNotice {
  type: "repository_update";
  content: {
    changeType: string;
    changedData: any;
    repository: {
      users: any[];
      albums: any[];
      genres: any[];
      tracks: any[];
      artists: any[];
      listeners: any[];
      playlists: any[];
      config: any;
      stats: {
        usersCount: number;
        albumsCount: number;
        tracksCount: number;
        artistsCount: number;
        listenersCount: number;
        playlistsCount: number;
        hasConfig: boolean;
      };
      timestamp: string;
    };
  };
}

// Enhanced hook with repository data extraction (JSON-RPC version)
export const useRepositoryDataJsonRpc = () => {
  const { data: notices, ...queryResult } = useNoticesJsonRpcQuery();

  const repositoryData = useMemo(() => {
    if (!notices || notices.length === 0) return null;

    // Find the latest repository update notice
    const repositoryNotices = notices.filter((notice: any) => {
      try {
        // Notice payload is already decoded by useNoticesJsonRpcQuery
        const parsed = JSON.parse(notice.payload);

        console.log(" useNoticesJsonRpcQuery:", parsed);
        return parsed.type === "repository_update";
      } catch {
        return false;
      }
    });

    if (repositoryNotices.length === 0) return null;

    // Get the most recent repository snapshot
    const latestNotice = repositoryNotices[0];
    const parsed = JSON.parse(latestNotice.payload);
    console.log(
      " jsonrpc JSON-RPC parsed.content.repository",
      parsed.content.repository
    );
    return parsed.content.repository;
  }, [notices]);

  return {
    ...queryResult,
    repositoryData,
    users: repositoryData?.users || [],
    albums: repositoryData?.albums || [],
    tracks: repositoryData?.tracks || [],
    playlists: repositoryData?.playlists || [],
    artists: repositoryData?.artists || [],
    listeners: repositoryData?.listeners || [],
    genres: repositoryData?.genres || [],
    subscriptions: repositoryData?.subscriptions || [],
    config: repositoryData?.config,
    stats: repositoryData?.stats,
  };
};

// Export the fetch functions for manual use
export { fetchNoticesJsonRpc, fetchLastAcceptedEpochIndex };
