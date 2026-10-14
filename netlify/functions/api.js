import serverless from 'serverless-http';
import { createApp } from '../../backend/dist/app.js';
import { connectDatabase } from '../../backend/dist/config/database.js';

let app = null;
let serverlessHandler = null;

async function bootstrap() {
  if (process.env.MONGODB_URI) {
    try {
      await connectDatabase(process.env.MONGODB_URI);
      console.log('[Netlify] Connected to MongoDB Atlas successfully.');
    } catch (err) {
      console.error('[Netlify] MongoDB connection error:', err);
    }
  }
  app = createApp();
  serverlessHandler = serverless(app);
}

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!serverlessHandler) {
    await bootstrap();
  }

  // Normalize path if routed via /.netlify/functions/api
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api') || '/';
  }

  return serverlessHandler(event, context);
};
