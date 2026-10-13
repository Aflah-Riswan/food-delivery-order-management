import { Router } from 'express';
import { MenuController } from '../controllers/MenuController.js';

export function createMenuRouter(menuController: MenuController): Router {
  const router = Router();

  router.get('/', menuController.getAll);
  router.get('/:id', menuController.getById);

  return router;
}
