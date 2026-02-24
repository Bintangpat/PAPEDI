import cron from "node-cron";
import prisma from "../config/prisma.js";

const cleanupOtps = async () => {
  try {
    const now = new Date();
    const result = await prisma.otp.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
    console.log(`[Cron] Cleaned up ${result.count} expired OTPs.`);
  } catch (error) {
    console.error("[Cron] Failed to cleanup OTPs:", error);
  }
};

// Run every hour
export const startOtpCleanup = () => {
  cron.schedule("0 * * * *", cleanupOtps);
  console.log("[Cron] OTP cleanup job scheduled.");
};
