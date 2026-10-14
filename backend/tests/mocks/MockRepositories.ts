import { MenuItem } from '../../src/models/MenuItem.js';
import { Order } from '../../src/models/Order.js';
import { IMenuRepository } from '../../src/repositories/IMenuRepository.js';
import { IOrderRepository } from '../../src/repositories/IOrderRepository.js';
import { defaultMenuItems } from '../../src/data/seedMenu.js';

export class MockMenuRepository implements IMenuRepository {
  private readonly items: Map<string, MenuItem> = new Map();

  constructor(seeds: MenuItem[] = defaultMenuItems) {
    for (const item of seeds) {
      this.items.set(item.id, { ...item });
    }
  }

  async findAll(): Promise<MenuItem[]> {
    return Array.from(this.items.values()).map((i) => ({ ...i }));
  }

  async findById(id: string): Promise<MenuItem | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }
}

export class MockOrderRepository implements IOrderRepository {
  private readonly orders: Map<string, Order> = new Map();

  async create(order: Order): Promise<Order> {
    this.orders.set(order.id, { ...order });
    return { ...order };
  }

  async findById(id: string): Promise<Order | null> {
    const order = this.orders.get(id);
    return order ? { ...order } : null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values()).map((o) => ({ ...o }));
  }

  async update(order: Order): Promise<Order> {
    if (!this.orders.has(order.id)) {
      throw new Error(`Order ${order.id} not found`);
    }
    this.orders.set(order.id, { ...order });
    return { ...order };
  }

  async delete(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }
}
