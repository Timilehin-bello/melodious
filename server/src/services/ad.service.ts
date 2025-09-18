import httpStatus from "http-status";
import { Ad, AdPlay, Prisma } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { prisma } from ".";

const getNextAd = async (listenerId: number): Promise<Ad | null> => {
  try {
    // Get active ads
    const activeAds = await prisma.ad.findMany({
      where: {
        isActive: true,
      },
    });

    if (activeAds.length === 0) {
      return null;
    }

    // Simple random selection
    const randomIndex = Math.floor(Math.random() * activeAds.length);
    return activeAds[randomIndex];
  } catch (error) {
    throw error;
  }
};

const trackAdPlay = async (
  adId: number,
  listenerId: number,
  completed: boolean
): Promise<AdPlay> => {
  try {
    const adPlay = await prisma.adPlay.create({
      data: {
        adId,
        listenerId,
        completed,
      },
    });
    return adPlay;
  } catch (error) {
    throw error;
  }
};

const getAllAds = async (): Promise<Ad[]> => {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return ads;
  } catch (error) {
    throw error;
  }
};


const createAd = async (adBody: Prisma.AdCreateInput): Promise<Ad> => {
  try {
    const ad = await prisma.ad.create({
      data: adBody,
    });
    return ad;
  } catch (error) {
    throw error;
  }
};

const getAdById = async (adId: number): Promise<Ad | null> => {
  return await prisma.ad.findUnique({
    where: { id: adId },
  });
};

const updateAdById = async (
  adId: number,
  updateBody: Prisma.AdUpdateInput
): Promise<Ad> => {
  try {
    const ad = await getAdById(adId);
    if (!ad) {
      throw new ApiError(httpStatus.NOT_FOUND, "Ad not found");
    }
    return await prisma.ad.update({
      where: { id: adId },
      data: updateBody,
    });
  } catch (error) {
    throw error;
  }
};

const deleteAdById = async (adId: number): Promise<Ad> => {
  const ad = await getAdById(adId);
  if (!ad) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ad not found");
  }
  await prisma.ad.delete({ where: { id: adId } });
  return ad;
};

const getAdStats = async (adId: number) => {
  const totalPlays = await prisma.adPlay.count({
    where: { adId },
  });

  const completedPlays = await prisma.adPlay.count({
    where: {
      adId,
      completed: true,
    },
  });

  const uniqueListeners = await prisma.adPlay.groupBy({
    by: ["listenerId"],
    where: { adId },
    _count: true,
  });

  return {
    totalPlays,
    completedPlays,
    completionRate: totalPlays > 0 ? (completedPlays / totalPlays) * 100 : 0,
    uniqueListeners: uniqueListeners.length,
  };
};

export {
  getNextAd,
  trackAdPlay,
  createAd,
  getAdById,
  updateAdById,
  deleteAdById,
  getAdStats,
  getAllAds
};