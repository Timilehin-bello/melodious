import { User } from "@prisma/client";

declare namespace Express {
  interface Request {
    user?: User;
  }
}
