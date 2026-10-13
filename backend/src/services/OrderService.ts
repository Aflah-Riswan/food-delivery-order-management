import crypto from 'node:crypto';
import {
  Order,
  OrderStatus,
  CreateOrderInput,
  OrderItemSnapshot,
} from '../models/Order.js';
import { IOrderRepository } from '../repositories/IOrderRepository.js';
import { IMenuRepository } from '../repositories/IMenuRepository.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class InvalidStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStateTransitionError';
  }
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export type OrderStatusListener = (order: Order) => void;

export class OrderService {
  private readonly statusListeners: Set<OrderStatusListener> = new Set();

  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly menuRepository: IMenuRepository
  ) {}

  addStatusListener(listener: OrderStatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyListeners(order: Order): void {
    for (const listener of this.statusListeners) {
      try {
        listener(order);
      } catch (err) {
        console.error('Error in order status listener:', err);
      }
    }
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    this.validateCustomer(input.customer);
    this.validateItemsInput(input.items);

    const snapshots: OrderItemSnapshot[] = [];
    let calculatedTotal = 0;

    for (const itemInput of input.items) {
      const menuItem = await this.menuRepository.findById(itemInput.menuItemId);
      if (!menuItem) {
        throw new NotFoundError(
          `Menu item ${itemInput.menuItemId} not found in catalog`
        );
      }

      const unitPrice = menuItem.price;
      const subtotal = Math.round(unitPrice * itemInput.quantity * 100) / 100;
      calculatedTotal += subtotal;

      snapshots.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        unitPrice,
        quantity: itemInput.quantity,
        subtotal,
        imageUrl: menuItem.imageUrl,
      });
    }

    calculatedTotal = Math.round(calculatedTotal * 100) / 100;
    const now = new Date().toISOString();

    const order: Order = {
      id: `ord_${crypto.randomUUID().slice(0, 8)}`,
      customer: {
        customerName: input.customer.customerName.trim(),
        deliveryAddress: input.customer.deliveryAddress.trim(),
        phoneNumber: input.customer.phoneNumber.trim(),
      },
      items: snapshots,
      totalAmount: calculatedTotal,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.orderRepository.create(order);
    this.notifyListeners(saved);
    return saved;
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async updateOrderStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    if (existing.status === newStatus) {
      return existing;
    }

    const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new InvalidStateTransitionError(
        `Invalid status transition from ${existing.status} to ${newStatus}`
      );
    }

    const updated: Order = {
      ...existing,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    const saved = await this.orderRepository.update(updated);
    this.notifyListeners(saved);
    return saved;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    if (existing.status === 'OUT_FOR_DELIVERY' || existing.status === 'DELIVERED') {
      throw new InvalidStateTransitionError(
        'Cannot delete order once it is out for delivery or delivered'
      );
    }

    return this.orderRepository.delete(id);
  }

  private validateCustomer(customer: unknown): asserts customer is CreateOrderInput['customer'] {
    if (!customer || typeof customer !== 'object') {
      throw new ValidationError('Customer information is required');
    }

    const c = customer as Partial<CreateOrderInput['customer']>;
    if (!c.customerName || typeof c.customerName !== 'string' || c.customerName.trim().length < 2) {
      throw new ValidationError('Customer name must be at least 2 characters');
    }

    if (!c.deliveryAddress || typeof c.deliveryAddress !== 'string' || c.deliveryAddress.trim().length < 5) {
      throw new ValidationError('Delivery address must be at least 5 characters');
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!c.phoneNumber || typeof c.phoneNumber !== 'string' || !phoneRegex.test(c.phoneNumber.trim())) {
      throw new ValidationError('Valid phone number is required');
    }
  }

  private validateItemsInput(items: unknown): asserts items is CreateOrderInput['items'] {
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    for (const item of items) {
      if (!item || typeof item !== 'object') {
        throw new ValidationError('Each order item must be a valid object');
      }

      if (!item.menuItemId || typeof item.menuItemId !== 'string' || item.menuItemId.trim() === '') {
        throw new ValidationError('Valid menuItemId is required for each item');
      }

      if (
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new ValidationError('Item quantity must be a positive integer');
      }
    }
  }
}
