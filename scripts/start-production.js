#!/usr/bin/env node

/**
 * Production startup script for Fantasy Football League
 * This script ensures proper environment configuration for deployment
 */

// Set production environment if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Ensure PORT is set for production
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

console.log('🚀 Starting Fantasy Football League in production mode...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${process.env.PORT}`);
console.log(`🗃️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Missing DATABASE_URL'}`);

// Import and start the main server
import('./dist/index.js').catch((error) => {
  console.error('💥 Failed to start production server:', error);
  process.exit(1);
});