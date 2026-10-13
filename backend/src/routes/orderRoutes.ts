import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';

export function createOrderRouter(orderController: OrderController): Router {
  const router = Router();

  router.post('/', orderController.create);
  router.get('/', orderController.getAll);
  router.get('/:id', orderController.getById);
  router.patch('/:id/status', orderController.updateStatus);
  router.delete('/:id', orderController.delete);

  return router;
}
