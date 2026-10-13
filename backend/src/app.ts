import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MenuService } from './services/MenuService.js';
import { MenuController } from './controllers/MenuController.js';
import { createMenuRouter } from './routes/menuRoutes.js';
import { InMemoryMenuRepository } from './repositories/InMemoryMenuRepository.js';

export interface AppDependencies {
  menuService?: MenuService;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const menuRepo = new InMemoryMenuRepository();
  const menuService = dependencies.menuService ?? new MenuService(menuRepo);
  const menuController = new MenuController(menuService);

  app.use('/api/menu', createMenuRouter(menuController));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Global 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  });

  return app;
}
