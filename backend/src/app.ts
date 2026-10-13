import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MenuService } from './services/MenuService.js';
import { MenuController } from './controllers/MenuController.js';
import { createMenuRouter } from './routes/menuRoutes.js';
import { InMemoryMenuRepository } from './repositories/InMemoryMenuRepository.js';

import { OrderService } from './services/OrderService.js';
import { OrderController } from './controllers/OrderController.js';
import { createOrderRouter } from './routes/orderRoutes.js';
import { InMemoryOrderRepository } from './repositories/InMemoryOrderRepository.js';

export interface AppDependencies {
  menuService?: MenuService;
  orderService?: OrderService;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Menu dependency injection
  const menuRepo = new InMemoryMenuRepository();
  const menuService = dependencies.menuService ?? new MenuService(menuRepo);
  const menuController = new MenuController(menuService);

  // Order dependency injection
  const orderRepo = new InMemoryOrderRepository();
  const orderService = dependencies.orderService ?? new OrderService(orderRepo, menuRepo);
  const orderController = new OrderController(orderService);

  app.use('/api/menu', createMenuRouter(menuController));
  app.use('/api/orders', createOrderRouter(orderController));

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
