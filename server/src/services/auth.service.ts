import httpStatus from "http-status";
import { User } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { userService, tokenService, prisma } from ".";
import { tokenTypes } from "../configs/enums";

// const loginUserWithEmailAndPassword = async (
//   email: string,
//   password: string
// ): Promise<any> => {
//   const isEmailTaken = await userService.isEmailTaken(email);

//   if (!isEmailTaken) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "User not found with this email, please register"
//     );
//   }

//   const user = await userService.getUserByEmail(
//     { email },
//     {
//       role: true,
//       clientProfile: true,
//       designerProfile: true,
//     }
//   );

//   if (!user.isEmailVerified) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, "Please verify your email");
//   }

//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
//   }
//   await userService.updateLastLogin(user.id);

//   return user;
// };

const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenDoc = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    },
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
};

const refreshAuth = async (refreshToken: string): Promise<Object> => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );
    const user = await userService.getUserByUniqueValue({
      id: refreshTokenDoc.userId,
    });
    if (!user) {
      throw new Error();
    }
    await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

export {
  //  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
};
