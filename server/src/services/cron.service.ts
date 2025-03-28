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

  return txhash;
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

  const userPayload = {
    method: "distribute_reward_to_artists",
    args: {
      artistsTotalTrackListenTime: payload,
    },
  };

  console.log("userPayload", JSON.stringify(userPayload));

  const txhash = await transactionService.signMessages(userPayload);

  console.log("txhash", txhash);

  return {
    success: true,
    txhash,
    artists: payload.length,
  };
};
