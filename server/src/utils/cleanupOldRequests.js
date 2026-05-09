import TimeExtensionRequest from "../models/timeExtensionRequestModel.js";

// Delete extension requests older than 1 week, except those with warnings
export const cleanupOldRequests = async () => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Delete requests that are:
    // 1. Older than 1 week (respondedAt < oneWeekAgo)
    // 2. AND either not approved OR not marked as warning
    // This keeps all warnings permanently for employee records
    const result = await TimeExtensionRequest.deleteMany({
      respondedAt: { $lt: oneWeekAgo },
      $or: [
        { status: { $ne: "approved" } }, // Delete all rejected/pending old requests
        { isWarning: { $ne: true } }, // Delete approved requests without warnings
      ],
    });

    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up old requests:", error);
    throw error;
  }
};

// Run cleanup every 24 hours
export const scheduleCleanup = () => {
  // Run immediately on startup
  cleanupOldRequests();
  
  // Then run every 24 hours
  setInterval(() => {
    cleanupOldRequests();
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
};
