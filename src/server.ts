import dotenv from "dotenv";
import path from "path";

// Load environment variables
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
const envPath = path.resolve(process.cwd(), envFile);
dotenv.config({ path: envPath });

import app from "./app";
import sequelize from "./config/database";
import logger from "./utils/logger";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("✓ Database connection established successfully");

    // Sync models (only in development)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      logger.info("✓ Database models synchronized");
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(
        `✓ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    logger.error("✗ Unable to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

startServer();
