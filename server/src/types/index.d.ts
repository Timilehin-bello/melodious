import { Prisma } from "@prisma/client";
import { Server } from "socket.io";

declare global {
  var io: Server;
}

declare module "socket.io" {
  interface Socket {
    user: Prisma.UserGetPayload<{
      include: {
        artist: true;
        listener: true;
        tokens: true;
      };
    }>;
  }
}
