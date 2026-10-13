import { Request, Response, NextFunction } from 'express';
import { MenuService, NotFoundError } from '../services/MenuService.js';

export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.menuService.getAllMenuItems();
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Item ID is required',
        });
        return;
      }
      const item = await this.menuService.getMenuItemById(id);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };
}
