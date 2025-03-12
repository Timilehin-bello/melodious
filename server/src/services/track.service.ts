import httpStatus from "http-status";
import { Prisma, Track, User } from "@prisma/client";
import ApiError from "../utils/ApiError";
import moment from "moment";
import { prisma } from ".";

const createTrack = async (trackBody: Prisma.TrackCreateInput) => {
  try {
    const track = await prisma.track.create({
      data: trackBody,
    });
    return track;
  } catch (error) {
    throw error;
  }
};

const queryTracks = async (filter: any, options: any): Promise<any> => {
  let orderBy: any = {};
  if (options.sortBy) {
    const [field, direction] = options.sortBy.split(":");
    orderBy[field] = direction === "desc" ? "desc" : "asc";
  }

  const limit =
    options.limit && parseInt(options.limit, 10) > 0
      ? parseInt(options.limit, 10)
      : 10;
  const page =
    options.page && parseInt(options.page, 10) > 0
      ? parseInt(options.page, 10)
      : 1;
  const skip = (page - 1) * limit;

  // Count total users matching the filter to calculate total pages
  const totalResults = await prisma.track.count({
    where: filter,
  });

  const users = await prisma.track.findMany({
    where: filter,
    include: {
      listeningTimes: true,
      artist: true,
    },
    orderBy: orderBy,
    take: limit,
    skip: skip,
  });

  const totalPages = Math.ceil(totalResults / limit);

  const result = {
    users,
    page,
    limit,
    totalPages,
    totalResults,
  };

  return result;
};

const getTrackByUniqueValue = async (
  where: Prisma.TrackWhereUniqueInput,
  include?: Prisma.TrackInclude
) => {
  return await prisma.track.findUnique({ where, include });
};

const getTrackInfo = async (
  where: Prisma.TrackFindFirstOrThrowArgs["where"],
  include?: Prisma.TrackInclude
): Promise<any | null> => {
  return prisma.track.findFirst({ where, include });
};

const updateLastLogin = async (trackId: number) => {
  return prisma.user.update({
    where: { id: trackId },
    data: { lastLogin: moment().toISOString() },
  });
};

const updateTrackById = async (
  trackId: number,
  updateBody: Prisma.TrackCreateInput
): Promise<any> => {
  try {
    const user = await getTrackByUniqueValue({ id: trackId });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    const { listenTime, listeningTimes, streamingHistory, artist, ...rest } =
      updateBody;

    return prisma.track.update({ where: { id: trackId }, data: { ...rest } });
  } catch (error) {
    throw error;
  }
};

const deleteTrackById = async (trackId: number): Promise<Track> => {
  const user = await getTrackByUniqueValue({ id: trackId });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await prisma.user.delete({ where: { id: trackId } });
  return user;
};

export {
  createTrack,
  queryTracks,
  getTrackByUniqueValue,
  updateLastLogin,
  updateTrackById,
  deleteTrackById,
  getTrackInfo,
};
