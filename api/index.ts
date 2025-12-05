import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { seedDatabase } from "../server/seed";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware for API routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Initialize the app (runs once per cold start in Vercel)
let isInitialized = false;

async function initializeApp() {
  if (isInitialized) return;
  
  try {
    console.log("🚀 Initializing Fantasy Football API...");
    
    // Test database connection
    try {
      console.log("🔌 Testing database connection...");
      const { db } = await import("../server/db");
      await db.execute("SELECT 1 as test");
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    // Seed the database
    console.log("🌱 Initializing database...");
    await seedDatabase();
    console.log("✅ Database initialization complete");

    // Register API routes
    console.log("🛣️ Registering API routes...");
    await registerRoutes(app);
    console.log("✅ API routes registered");

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error(`❌ Server error [${status}]:`, message);
      res.status(status).json({ message });
    });

    isInitialized = true;
    console.log("✅ API initialization complete");
  } catch (error) {
    console.error("💥 Critical initialization error:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
    throw error;
  }
}

// Initialize on first import
initializeApp().catch(err => {
  console.error("Failed to initialize app:", err);
});

// Export the Express app for Vercel serverless function
export default app;
