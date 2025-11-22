import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  logger.error(err);

  if (!(error instanceof ApiError)) {
    const statusCode = 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, false, error.stack);
  }

  const statusCode = (error as ApiError).statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
