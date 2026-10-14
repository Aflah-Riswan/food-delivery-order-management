import { createApp } from '../backend/dist/app.js';
import { connectDatabase } from '../backend/dist/config/database.js';

let isConnected = false;
const app = createApp();

export default async function handler(req, res) {
  if (process.env.MONGODB_URI && !isConnected) {
    try {
      await connectDatabase(process.env.MONGODB_URI);
      isConnected = true;
    } catch (err) {
      console.warn('[Vercel] MongoDB connection skipped/failed, using fallback:', err);
    }
  }
  return app(req, res);
}
