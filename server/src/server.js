import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = parseInt(String(process.env.PORT || 5000).replace(/['"]/g, ''), 10);
let server;

const startServer = async () => {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Connect to DB in the background so health check passes immediately
  connectDB().then(() => {
    console.log('MongoDB connection established');
  }).catch((err) => {
    console.error('MongoDB connection failed:', err);
    // Don't exit here, so we can still see the health check status
  });
};

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
