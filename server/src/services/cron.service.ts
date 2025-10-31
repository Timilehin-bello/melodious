import { prisma, transactionService } from ".";
import { ArtistListeningStats } from "../interfaces";

export const getArtistsListeningStats = async (): Promise<
  ArtistListeningStats[]
> => {
  try {
    // Get aggregated listening times per artist
    const artistListeningStats = await prisma.listeningTime.groupBy({
      by: ["artistId"],
      _sum: {
        totalListeningTime: true,
      },
      where: {
        artist: {
          user: {
            isNot: null,
          },
        },
      },
      orderBy: {
        _sum: {
          totalListeningTime: "desc",
        },
      },
    });

    // Get corresponding wallet addresses
    const artistWallets = await prisma.artist.findMany({
      where: {
        id: {
          in: artistListeningStats.map((stat) => stat.artistId),
        },
      },
      select: {
        id: true,
        user: {
          select: {
            walletAddress: true,
          },
        },
      },
    });

    // Create a map for quick wallet address lookup
    const walletMap = new Map(
      artistWallets.map((artist) => [artist.id, artist.user?.walletAddress])
    );

    // Combine the data
    const formattedStats = artistListeningStats
      .map((stat) => ({
        walletAddress: walletMap.get(stat.artistId) || "",
        totalListeningTime: stat._sum.totalListeningTime || 0,
      }))
      .filter((stat) => stat.walletAddress !== "");

    console.log("formattedStats", JSON.stringify(formattedStats));

    return formattedStats;
  } catch (error) {
    console.log("Error fetching artist listening stats:", error);
    throw error;
  }
};

export const updateArtistListeningTimeForReward = async () => {
  let payload = await getArtistsListeningStats();

  // Filter out artists with zero listening time
  payload = payload.filter((artist) => artist.totalListeningTime > 0);

  // Only proceed if there are artists with non-zero listening time
  if (payload.length === 0) {
    console.log(
      "No artists with listening time > 0 found. Skipping transaction."
    );
    return {
      success: false,
      message:
        "No artists with listening time > 0 found. Skipping transaction.",
      artists: payload.length,
    };
  }

  // Check if we have at least 4 artists with non-zero listening time
  // const MIN_REQUIRED_ARTISTS = 4;
  // if (payload.length < MIN_REQUIRED_ARTISTS) {
  //   const message = `Insufficient artists with listening time (${payload.length}/${MIN_REQUIRED_ARTISTS}). Skipping reward distribution.`;
  //   console.log(message);
  //   return {
  //     success: false,
  //     message,
  //     artists: payload.length,
  //   };
  // }

  const userPayload = {
    method: "update_artist_listening_time",
    args: {
      artistsTotalTrackListenTime: payload,
    },
  };

  console.log("userPayload", JSON.stringify(userPayload));

  const txhash = await transactionService.signMessages(userPayload);

  console.log("txhash", txhash);

  // if (txhash !== false) {
  //   const clearResult = await clearAllListeningTimeRecords();
  //   console.log("Listening time records cleared:", clearResult);

  //   return {
  //     ...txhash,
  //     clearingResult: clearResult,
  //   };
  // }

  return {
    success: true,
    message: "Transaction successful",
    artists: payload.length,
    txhash: txhash,
  };
};

export const clearAllListeningTimeRecords = async () => {
  try {
    console.log("Starting to clear all listening time records...");

    // Delete all records from the ListeningTime table
    const deletedRecords = await prisma.listeningTime.deleteMany({});

    console.log(
      `Successfully cleared ${deletedRecords.count} listening time records`
    );

    return {
      success: true,
      message: `Successfully cleared ${deletedRecords.count} listening time records`,
      count: deletedRecords.count,
    };
  } catch (error) {
    console.log("Error clearing listening time records:", error);

    return {
      success: false,
      message: `Failed to clear listening time records: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error: error,
    };
  }
};

export const distributeRewardToArtistsBasedOnTotalTrackListens = async () => {
  let payload = await getArtistsListeningStats();

  // Filter out artists with zero listening time
  payload = payload.filter((artist) => artist.totalListeningTime > 0);

  // Check if we have at least 4 artists with non-zero listening time
  const MIN_REQUIRED_ARTISTS = 1;
  if (payload.length < MIN_REQUIRED_ARTISTS) {
    const message = `Insufficient artists with listening time (${payload.length}/${MIN_REQUIRED_ARTISTS}). Skipping reward distribution.`;
    console.log(message);
    return {
      success: false,
      message,
      artists: payload.length,
    };
  }

  const vaultPaylod = {
    method: "vault_deposit",
    args: {
      amount: 100000,
    },
  };

  const userPayload = {
    method: "distribute_reward_to_artists",
    args: {
      artistsTotalTrackListenTime: payload,
    },
  };

  console.log("userPayload", JSON.stringify(userPayload));

  const vaultTxhash = await transactionService.signMessages(vaultPaylod);

  console.log("vaultTxhash 1", vaultTxhash);

  const txhash = await transactionService.signMessages(userPayload);

  console.log("txhash", txhash);

  const vaultTxhash2 = await transactionService.signMessages(vaultPaylod);

  console.log("vaultTxhash 2", vaultTxhash2);

  return {
    success: true,
    txhash,
    artists: payload.length,
  };
};

export const runRewardUpdateCycle = async () => {
  try {
    // Step 1: Update artist listening time for reward
    console.log("Starting updateArtistListeningTimeForReward...");
    const updateResult = await updateArtistListeningTimeForReward();

    if (!updateResult.success) {
      console.log("Artist listening time update failed:", updateResult.message);
      return {
        success: false,
        message: "Artist listening time update failed.",
        updateResult,
      };
    }

    // Add a delay between operations to ensure the first transaction is fully processed
    console.log("Waiting for first transaction to settle...");
    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10-second delay

    // Step 2: Distribute rewards only if step 1 succeeded
    console.log(
      "Starting distributeRewardToArtistsBasedOnTotalTrackListens..."
    );
    const rewardResult =
      await distributeRewardToArtistsBasedOnTotalTrackListens();

    if (!rewardResult.success) {
      console.log("Reward distribution failed:", rewardResult.message);
      return {
        success: false,
        message: "Reward distribution failed.",
        updateResult,
        rewardResult,
      };
    }

    // Step 3: Clear listening time records only if both steps succeeded
    console.log(
      "Both operations successful, clearing listening time records..."
    );
    const clearResult = await clearAllListeningTimeRecords();
    console.log("Listening time records cleared:", clearResult);

    return {
      success: true,
      message: "Both operations successful and listening times cleared.",
      updateResult,
      rewardResult,
      clearResult,
    };
  } catch (error) {
    console.log("Error running reward update cycle:", error);
    return {
      success: false,
      message: `Error running reward update cycle: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error,
    };
  }
};
