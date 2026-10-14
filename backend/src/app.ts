import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { MenuService } from './services/MenuService.js';
import { MenuController } from './controllers/MenuController.js';
import { createMenuRouter } from './routes/menuRoutes.js';
import { IMenuRepository } from './repositories/IMenuRepository.js';
import { MongoMenuRepository } from './repositories/MongoMenuRepository.js';

import { OrderService } from './services/OrderService.js';
import { OrderController } from './controllers/OrderController.js';
import { createOrderRouter } from './routes/orderRoutes.js';
import { IOrderRepository } from './repositories/IOrderRepository.js';
import { MongoOrderRepository } from './repositories/MongoOrderRepository.js';

export interface AppDependencies {
  menuService?: MenuService;
  orderService?: OrderService;
  menuRepo?: IMenuRepository;
  orderRepo?: IOrderRepository;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Determine repositories
  const menuRepo = dependencies.menuRepo ?? new MongoMenuRepository();
  const menuService = dependencies.menuService ?? new MenuService(menuRepo);
  const menuController = new MenuController(menuService);

  const orderRepo = dependencies.orderRepo ?? new MongoOrderRepository();
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
      storage: 'mongodb',
      timestamp: new Date().toISOString(),
    });
  });

  // Root API endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'Food Delivery Management API',
      status: 'ok',
      endpoints: {
        menu: '/api/menu',
        orders: '/api/orders',
        health: '/api/health',
      },
    });
  });

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
