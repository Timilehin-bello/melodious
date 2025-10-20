import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useMemo } from "react";

// GraphQL query for notices
const NOTICES_QUERY = `
  query notices {
    notices {
      edges {
        node {
          index
          input {
            index
          }
          payload
        }
      }
    }
  }
`;

// Notice type definition
export type Notice = {
  id: string;
  index: number;
  input: {
    index: number;
    payload: string;
  };
  payload: string;
};

// GraphQL response type
type NoticesResponse = {
  data: {
    notices: {
      edges: Array<{
        node: {
          index: number;
          input: {
            index: number;
          };
          payload: string;
        };
      }>;
    };
  };
};

// Function to fetch notices from GraphQL endpoint
const fetchNotices = async (): Promise<Notice[]> => {
  const graphqlUri = process.env.NEXT_PUBLIC_GRAPHQL_URI;

  if (!graphqlUri) {
    throw new Error("GraphQL URI not configured");
  }

  console.log("🔍 Fetching notices from GraphQL endpoint:", graphqlUri);

  const response = await fetch(graphqlUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: NOTICES_QUERY,
      variables: {},
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const responseData: NoticesResponse = await response.json();

  if (!responseData.data?.notices?.edges) {
    console.log("📋 No notices found");
    return [];
  }

  const notices = responseData.data.notices.edges;
  console.log("📋 Raw notices data:", notices);

  // Transform and process notices
  const processedNotices: Notice[] = notices
    .map((edge) => {
      const node = edge.node;

      // Process input payload
      let inputPayload = "";
      try {
        // Note: input payload processing would go here if needed
        inputPayload = "(processed)";
      } catch (e) {
        inputPayload = "(empty)";
      }

      // Process notice payload
      let payload = node.payload;
      if (payload) {
        try {
          payload = ethers.utils.toUtf8String(payload);
          console.log("📄 Decoded payload:", payload);
        } catch (e) {
          payload = payload + " (hex)";
          console.log("⚠️ Could not decode payload, keeping as hex:", payload);
        }
      } else {
        payload = "(empty)";
      }

      return {
        id: `notice-${node.input.index}-${node.index}`,
        index: parseInt(node.index.toString()),
        payload: payload,
        input: {
          index: parseInt(node.input.index.toString()),
          payload: inputPayload,
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

  console.log("✅ Processed notices:", processedNotices);
  return processedNotices;
};

// Query keys for notices
export const noticesKeys = {
  all: ["notices"] as const,
  lists: () => [...noticesKeys.all, "list"] as const,
};

// TanStack Query hook for fetching notices
export const useNoticesQuery = () => {
  return useQuery({
    queryKey: noticesKeys.lists(),
    queryFn: fetchNotices,
    staleTime: 5000, // Consider data fresh for 5 seconds (reduced from 30s)
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Repository notice types
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

// Enhanced hook with repository data extraction
export const useRepositoryData = () => {
  const { data: notices, ...queryResult } = useNoticesQuery();

  const repositoryData = useMemo(() => {
    if (!notices || notices.length === 0) return null;

    // Find the latest repository update notice
    const repositoryNotices = notices.filter((notice: any) => {
      try {
        // Notice payload is already decoded by useNoticesQuery (ethers.utils.toUtf8String)
        const parsed = JSON.parse(notice.payload);
        return parsed.type === "repository_update";
      } catch {
        return false;
      }
    });

    if (repositoryNotices.length === 0) return null;

    // Get the most recent repository snapshot
    const latestNotice = repositoryNotices[0];
    const parsed = JSON.parse(latestNotice.payload);
    console.log("parsed.content.repository", parsed.content.repository);
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

// Export the fetch function for manual use
export { fetchNotices };
