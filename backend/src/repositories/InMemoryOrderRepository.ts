import { Order } from '../models/Order.js';
import { IOrderRepository } from './IOrderRepository.js';

/**
 * In-memory storage repository for orders.
 *
 * NOTE: All order data stored in this repository is kept in process RAM only.
 * Data is NOT permanently persisted to disk or an external database.
 * When the server process terminates or restarts, all order history and status changes will be lost.
 */
export class InMemoryOrderRepository implements IOrderRepository {
  private readonly orders: Map<string, Order> = new Map();

  async create(order: Order): Promise<Order> {
    const clone = structuredClone(order);
    this.orders.set(order.id, clone);
    return structuredClone(clone);
  }

  async findById(id: string): Promise<Order | null> {
    const order = this.orders.get(id);
    return order ? structuredClone(order) : null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .map((o) => structuredClone(o))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async update(order: Order): Promise<Order> {
    const clone = structuredClone(order);
    this.orders.set(order.id, clone);
    return structuredClone(clone);
  }

  async delete(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }
}
