import httpStatus from "http-status";
import { Prisma, User } from "@prisma/client";
import ApiError from "../utils/ApiError";
import moment from "moment";
import { prisma } from ".";

const createUser = async (
  userBody: Omit<Prisma.UserCreateInput, "userType"> & {
    userType: string;
  }
): Promise<any> => {
  try {
    const { walletAddress, userType, ...rest } = userBody;

    if (await getUserByUniqueValue({ walletAddress })) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User with wallet address already taken"
      );
    }

    // Create the user transactionally
    return await prisma.$transaction(async (tx) => {
      console.log("userBody", userBody);

      if (userType === "LISTENER") {
        console.log("test---");

        // Create the user with the given data
        const userInfo = await tx.user.create({
          data: {
            walletAddress,
          },
        });
        console.log("userInfo", userInfo);
        // Create the client associated with the  user
        await tx.listener.create({
          data: {
            userId: userInfo.id,
          },
        });

        return userInfo;
      } else if (userType === "ARTIST") {
        // Create the user with the given data
        const userInfo = await tx.user.create({
          data: {
            walletAddress,
          },
        });

        await tx.artist.create({
          data: {
            userId: userInfo.id,
          },
        });

        return userInfo;
      }
    });
  } catch (error) {
    // Rethrow the error
    throw error;
  }
};

const queryUsers = async (filter: any, options: any): Promise<any> => {
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
  const totalResults = await prisma.user.count({
    where: filter,
  });

  const users = await prisma.user.findMany({
    where: filter,
    include: {
      listener: true,
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

const getUserByUniqueValue = async (
  where: Prisma.UserWhereUniqueInput,
  include?: Prisma.UserInclude
) => {
  return await prisma.user.findUnique({ where, include });
};

const getUserInfo = async (
  where: Prisma.UserFindFirstOrThrowArgs["where"],
  include?: Prisma.UserInclude
): Promise<any | null> => {
  return prisma.user.findFirst({ where, include });
};

const updateLastLogin = async (userId: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLogin: moment().toISOString() },
  });
};

const updateUserById = async (
  userId: number,
  updateBody: Prisma.UserCreateInput
): Promise<any> => {
  try {
    const user = await getUserByUniqueValue({ id: userId });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    const { walletAddress, ...rest } = updateBody;

    return prisma.user.update({ where: { id: userId }, data: { ...rest } });
  } catch (error) {
    throw error;
  }
};

const deleteUserById = async (userId: number): Promise<User> => {
  const user = await getUserByUniqueValue({ id: userId });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await prisma.user.delete({ where: { id: userId } });
  return user;
};

export {
  createUser,
  queryUsers,
  getUserByUniqueValue,
  updateLastLogin,
  updateUserById,
  deleteUserById,
  getUserInfo,
};
