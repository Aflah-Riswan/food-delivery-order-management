import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3001;
const app = createApp();


  app.listen(PORT, () => {
    console.log(`Food Delivery Backend listening on port ${PORT}`);
    console.log(`Note: Server uses in-memory storage; data will reset upon restart.`);
  });


export default app;
