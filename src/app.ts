import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { ApiError } from "./utils/ApiError";
import logger from "./utils/logger";

const app: Application = express();

// Trust proxy
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || "*",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
});

app.use("/api/", apiLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to E-commerce API",
    version: "1.0.0",
    docs: "/api/v1",
  });
});

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

export default app;
