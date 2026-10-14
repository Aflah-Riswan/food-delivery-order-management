import mongoose from 'mongoose';
import { defaultMenuItems } from '../data/seedMenu.js';
import { MongoMenuRepository } from '../repositories/MongoMenuRepository.js';

export interface DatabaseConnectionResult {
  connected: boolean;
  uri?: string;
  error?: string;
}

export async function connectDatabase(uri?: string): Promise<DatabaseConnectionResult> {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    return {
      connected: false,
      error: 'No MONGODB_URI provided',
    };
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`[Database] Successfully connected to MongoDB at ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

    // Seed menu if collection is empty
    const menuRepo = new MongoMenuRepository();
    await menuRepo.seedIfEmpty(defaultMenuItems);
    console.log(`[Database] Menu catalog synchronized.`);

    return {
      connected: true,
      uri: mongoUri,
    };
  } catch (error: any) {
    console.error('[Database] Failed to connect to MongoDB:', error.message);
    return {
      connected: false,
      error: error.message,
    };
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] Disconnected from MongoDB.');
  }
}
