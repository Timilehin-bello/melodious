import * as cron from "node-cron";
import logger from "./configs/logger";
import { cronService } from "./services";
// schedule tasks to be run on the server

// Schedule configurations
const CRON_SCHEDULES = {
  EVERY_MINUTE: "* * * * *",
  EVERY_5_MINUTES: "*/5 * * * *",
  EVERY_HOUR: "0 * * * *",
  EVERY_DAY: "0 0 * * *",
  EVERY_WEEK: "0 0 * * 0",
  EVERY_MONTH: "0 0 1 * *",
};

// export const scheduleCronJobs = () => {
//   cron.schedule("* * * * *", () => {
//     logger.info("Cron job in every min");
//     // cronService.updateArtistListeningTimeForReward();
//   });
// };

export const updateArtistListeningTimeOnCartesi = (
  schedule = CRON_SCHEDULES.EVERY_MINUTE
) => {
  logger.info("Initializing artist listening stats cron job", { schedule });
  // Validate cron schedule
  if (!cron.validate(schedule)) {
    logger.error("Invalid cron schedule provided", { schedule });
    throw new Error("Invalid cron schedule provided");
  }

  // Schedule the cron job
  const job = cron.schedule(
    schedule,
    cronService.updateArtistListeningTimeForReward,
    {
      scheduled: false,
      timezone: "UTC",
    }
  );

  // Start the cron job
  job.start();

  logger.info("Artist listening stats cron job initialized", { schedule });

  // Return the job instance for external control if needed
  return job;
};

export const distributeRewardToArtistsBasedOnTotalTrackListens = (
  schedule = CRON_SCHEDULES.EVERY_MINUTE
) => {
  logger.info("Initializing artist listening stats cron job", { schedule });
  // Validate cron schedule
  if (!cron.validate(schedule)) {
    logger.error("Invalid cron schedule provided", { schedule });
    throw new Error("Invalid cron schedule provided");
  }

  // Schedule the cron job
  const job = cron.schedule(
    schedule,
    cronService.distributeRewardToArtistsBasedOnTotalTrackListens,
    {
      scheduled: false,
      timezone: "UTC",
    }
  );

  // Start the cron job
  job.start();

  logger.info("Artist listening stats cron job initialized", { schedule });

  // Return the job instance for external control if needed
  return job;
};

// updateArtistListeningTimeOnCartesi();
