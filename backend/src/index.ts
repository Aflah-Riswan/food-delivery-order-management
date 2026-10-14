import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const app = createApp();

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Food Delivery Backend listening on port ${PORT}`);
    console.log(`Note: Server uses in-memory storage; data will reset upon restart.`);
  });
}

export default app;
