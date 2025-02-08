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
    console.error("Error fetching artist listening stats:", error);
    throw error;
  }
};

export const updateArtistListeningTimeForReward = async () => {
  const payload = await getArtistsListeningStats();

  const userPayload = {
    method: "update_artist_listening_time",
    args: {
      artistsTotalTrackListenTime: payload,
    },
  };

  console.log("userPayload", JSON.stringify(userPayload));

  const txhash = await transactionService.signMessages(userPayload);

  console.log("txhas", txhash);

  return txhash;
};

export const distributeRewardToArtistsBasedOnTotalTrackListens = async () => {
  const payload = await getArtistsListeningStats();

  const userPayload = {
    method: "distribute_reward_to_artists",
    args: {
      artistsTotalTrackListenTime: payload,
    },
  };

  console.log("userPayload", JSON.stringify(userPayload));

  const txhash = await transactionService.signMessages(userPayload);

  console.log("txhas", txhash);

  return txhash;
};
