import { config } from "@configs/config";
import { createThirdwebClient } from "thirdweb";

const secretKey = config.thirdweb.secretKey!;

export const thirdwebClient = createThirdwebClient({ secretKey });
