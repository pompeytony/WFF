import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

      log(logLine);
    }
  });

  next();
});

async function startServer() {
  try {
    console.log("🚀 Starting Fantasy Football server...");
    
    // Set NODE_ENV if not already set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }
    
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    
    // Test database connection before seeding
    try {
      console.log("🔌 Testing database connection...");
      const { db } = await import("./db");
      // Simple query to test connection
      await db.execute("SELECT 1 as test");
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    // Seed the database on startup
    console.log("🌱 Initializing database...");
    await seedDatabase();
    console.log("✅ Database initialization complete");

    console.log("🛣️ Registering API routes...");
    const server = await registerRoutes(app);
    console.log("✅ API routes registered");

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error(`❌ Server error [${status}]:`, message);
      res.status(status).json({ message });
    });

    // Setup environment-specific configurations
    const isProduction = process.env.NODE_ENV === "production";
    console.log(`⚙️ Configuring for ${isProduction ? 'production' : 'development'}...`);
    
    if (!isProduction) {
      console.log("🔧 Setting up Vite development server...");
      await setupVite(app, server);
      console.log("✅ Vite development server ready");
    } else {
      console.log("📁 Serving static files...");
      serveStatic(app);
      console.log("✅ Static file serving configured");
    }

    /*
// ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    console.log(`🌐 Starting server on port ${port}...`);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log(`🎉 Fantasy Football server running successfully on port ${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Access your app at: http://localhost:${port}`);
      log(`serving on port ${port}`);
    });

    // Handle server startup errors
    server.on('error', (error: any) => {
      console.error('❌ Server startup error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("💥 Critical server startup error:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
    
    // Log environment info for debugging
    console.error("🔍 Environment debug info:");
    console.error("- NODE_ENV:", process.env.NODE_ENV);
    console.error("- PORT:", process.env.PORT);
    console.error("- DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");
    
    process.exit(1);
  }
}
*/

// Start the server
// startServer();

// Export the Express app for Vercel serverless function
export default app;
