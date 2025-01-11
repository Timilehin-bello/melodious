import { Socket } from "socket.io";
import passport from "passport";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import { roleRights } from "../configs/roles";

const verifyCallback =
  (socket: Socket, resolve: any, reject: any, requiredRights: string[]) =>
  async (err: any, user: any, info: any) => {
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    }

    socket.data.user = user;

    if (requiredRights.length) {
      const userRights: any = roleRights.get(user.role);
      const hasRequiredRights = requiredRights.every((requiredRight: any) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }

    resolve();
  };

const socketAuth =
  (...requiredRights: string[]) =>
  async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate"));
    }

    // Create mock request object for passport
    const mockReq: any = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(socket, resolve, reject, requiredRights)
      )(mockReq);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export default socketAuth;
