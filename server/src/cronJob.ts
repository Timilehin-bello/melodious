import * as cron from "node-cron";
import logger from "./configs/logger";
// schedule tasks to be run on the server
export const scheduleCronJobs = () => {
  cron.schedule("* * * * *", () => {
    logger.info("Cron job in every min");
  });
};
