import { useMemo } from "react";
import { useRepositoryDataJsonRpc } from "./useNoticesJsonRpcQuery";

// User type definition based on the backend model
export interface User {
  id: number;
  name: string;
  displayName: string;
  cartesiTokenBalance: number;
  walletAddress: string;
  role: "LISTENER" | "ARTIST";
  username: string;
  profileImage: string | null;
  country: string | null;
  artist: any | null;
  listener: any | null;
  createdAt: string;
  updatedAt: string;
}

// Hook to get user details by wallet address using repository notices
export const useUserByWallet = (walletAddress?: string) => {
  const { users, isLoading, isError, error, refetch, isFetching, isSuccess } =
    useRepositoryDataJsonRpc();

  const userDetails = useMemo(() => {
    if (!walletAddress || !users || users.length === 0) {
      return null;
    }

    // Find user by wallet address (case-insensitive)
    const user = users.find(
      (u: User) => u.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );

    return user || null;
  }, [users, walletAddress]);

  const userExists = useMemo(() => {
    return userDetails !== null;
  }, [userDetails]);

  return {
    user: userDetails,
    userExists,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isSuccess,
    // Additional computed properties for convenience
    isArtist: userDetails?.role === "ARTIST",
    isListener: userDetails?.role === "LISTENER",
    hasArtistProfile: userDetails?.artist !== null,
    hasListenerProfile: userDetails?.listener !== null,
  };
};

// Hook to get multiple users by wallet addresses
export const useUsersByWallets = (walletAddresses: string[] = []) => {
  const { users, isLoading, isError, error, refetch, isFetching, isSuccess } =
    useRepositoryDataJsonRpc();

  const usersDetails = useMemo(() => {
    if (!walletAddresses.length || !users || users.length === 0) {
      return [];
    }

    // Find users by wallet addresses (case-insensitive)
    const foundUsers = walletAddresses
      .map((walletAddress) => {
        return (
          users.find(
            (u: User) =>
              u.walletAddress.toLowerCase() === walletAddress.toLowerCase()
          ) || null
        );
      })
      .filter(Boolean);

    return foundUsers;
  }, [users, walletAddresses]);

  return {
    users: usersDetails,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isSuccess,
    foundCount: usersDetails.length,
    requestedCount: walletAddresses.length,
  };
};

// Hook to check if a wallet address has a user account
export const useCheckUserExists = (walletAddress?: string) => {
  const { userExists, isLoading, isError, error } =
    useUserByWallet(walletAddress);

  return {
    exists: userExists,
    isLoading,
    isError,
    error,
  };
};

// User type is already exported above as an interface
