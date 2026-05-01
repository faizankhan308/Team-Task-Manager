import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  await connectDB();
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
