import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

async function bootstrap() {
  if (process.env.MONGODB_URI) {
    await connectDatabase(process.env.MONGODB_URI);
  } else {
    console.log('[Storage] MONGODB_URI not provided. Running with InMemory repositories.');
    console.log('[Storage] Note: In-memory data will reset upon server restart.');
  }

  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`Food Delivery Server listening on port ${PORT}`);
    console.log(`Storage: ${process.env.MONGODB_URI ? 'MongoDB (Persistent)' : 'In-Memory (Volatile)'}`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  return app;
}

bootstrap().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
