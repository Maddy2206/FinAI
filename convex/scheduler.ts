import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Send weekly reports every Monday at 8:00 AM UTC
crons.weekly(
  "weekly-financial-reports",
  { dayOfWeek: "monday", hourUTC: 8, minuteUTC: 0 },
  internal.reportsActions.sendReportsToAllUsers
);

// Check overspending alerts daily at 9:00 AM UTC
crons.daily(
  "daily-overspending-check",
  { hourUTC: 9, minuteUTC: 0 },
  internal.insights.checkOverspending
);

export default crons;
