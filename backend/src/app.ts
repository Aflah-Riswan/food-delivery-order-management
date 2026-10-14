import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { MenuService } from './services/MenuService.js';
import { MenuController } from './controllers/MenuController.js';
import { createMenuRouter } from './routes/menuRoutes.js';
import { IMenuRepository } from './repositories/IMenuRepository.js';
import { InMemoryMenuRepository } from './repositories/InMemoryMenuRepository.js';
import { MongoMenuRepository } from './repositories/MongoMenuRepository.js';

import { OrderService } from './services/OrderService.js';
import { OrderController } from './controllers/OrderController.js';
import { createOrderRouter } from './routes/orderRoutes.js';
import { IOrderRepository } from './repositories/IOrderRepository.js';
import { InMemoryOrderRepository } from './repositories/InMemoryOrderRepository.js';
import { MongoOrderRepository } from './repositories/MongoOrderRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AppDependencies {
  menuService?: MenuService;
  orderService?: OrderService;
  menuRepo?: IMenuRepository;
  orderRepo?: IOrderRepository;
}

function getFrontendDistPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(__dirname, '../../frontend/dist'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }
  return null;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Determine repositories based on Dependency Inversion Principle
  const useMongo = Boolean(process.env.MONGODB_URI);

  const menuRepo =
    dependencies.menuRepo ??
    (useMongo ? new MongoMenuRepository() : new InMemoryMenuRepository());

  const menuService = dependencies.menuService ?? new MenuService(menuRepo);
  const menuController = new MenuController(menuService);

  const orderRepo =
    dependencies.orderRepo ??
    (useMongo ? new MongoOrderRepository() : new InMemoryOrderRepository());

  const orderService = dependencies.orderService ?? new OrderService(orderRepo, menuRepo);
  const orderController = new OrderController(orderService);

  // Mount API routers
  const menuRouter = createMenuRouter(menuController);
  app.use('/api/menu', menuRouter);
  app.use('/menu', menuRouter);

  const orderRouter = createOrderRouter(orderController);
  app.use('/api/orders', orderRouter);
  app.use('/orders', orderRouter);

  // Health check endpoint
  app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      storage: useMongo ? 'mongodb' : 'in-memory',
      timestamp: new Date().toISOString(),
    });
  });

  // Serve static React frontend in production if dist exists (All-in-One deployment)
  const frontendDist = getFrontendDistPath();
  if (frontendDist) {
    app.use(express.static(frontendDist));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/menu') || req.path.startsWith('/orders')) {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  // Global 404 handler for API routes
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
