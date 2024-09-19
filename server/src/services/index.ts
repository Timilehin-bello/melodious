import * as userService from "./user.service";
import * as authService from "./auth.service";
import * as tokenService from "./token.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export { prisma, userService, authService, tokenService };
