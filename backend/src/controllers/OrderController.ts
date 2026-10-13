import { Request, Response, NextFunction } from 'express';
import {
  OrderService,
  ValidationError,
  NotFoundError,
  InvalidStateTransitionError,
} from '../services/OrderService.js';
import { OrderStatus } from '../models/Order.js';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customer, items } = req.body;
      const order = await this.orderService.createOrder({ customer, items });
      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await this.orderService.getAllOrders();
      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'Valid Order ID is required' });
        return;
      }

      const order = await this.orderService.getOrderById(id);
      if (!order) {
        res.status(404).json({ success: false, message: `Order with ID ${id} not found` });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'Valid Order ID is required' });
        return;
      }

      const { status } = req.body;
      if (!status || typeof status !== 'string') {
        res.status(400).json({ success: false, message: 'Order status is required' });
        return;
      }

      const updated = await this.orderService.updateOrderStatus(id, status as OrderStatus);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error instanceof InvalidStateTransitionError || error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'Valid Order ID is required' });
        return;
      }

      const deleted = await this.orderService.deleteOrder(id);
      res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
        data: { deleted },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error instanceof InvalidStateTransitionError) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };
}
