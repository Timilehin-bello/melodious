import { User, Prisma } from "@prisma/client";

declare namespace Express {
  interface Request {
    user?: Prisma.UserGetPayload<{
      include: {
        artist: true;
        listener: true;
        tokens: true;
        userMetrics: true;
      };
    }>;
  }
}
