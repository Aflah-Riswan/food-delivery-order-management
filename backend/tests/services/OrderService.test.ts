import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService, ValidationError, InvalidStateTransitionError } from '../../src/services/OrderService.js';
import { IOrderRepository } from '../../src/repositories/IOrderRepository.js';
import { IMenuRepository } from '../../src/repositories/IMenuRepository.js';
import { Order, OrderStatus } from '../../src/models/Order.js';
import { MenuItem } from '../../src/models/MenuItem.js';

class MockOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();

  async create(order: Order): Promise<Order> {
    this.orders.set(order.id, { ...order });
    return { ...order };
  }

  async findById(id: string): Promise<Order | null> {
    const o = this.orders.get(id);
    return o ? { ...o } : null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values()).map((o) => ({ ...o }));
  }

  async update(order: Order): Promise<Order> {
    this.orders.set(order.id, { ...order });
    return { ...order };
  }

  async delete(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }
}

class MockMenuRepository implements IMenuRepository {
  private items: Map<string, MenuItem> = new Map();

  constructor(items: MenuItem[]) {
    for (const item of items) {
      this.items.set(item.id, item);
    }
  }

  async findAll(): Promise<MenuItem[]> {
    return Array.from(this.items.values());
  }

  async findById(id: string): Promise<MenuItem | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }
}

describe('OrderService', () => {
  let orderRepo: MockOrderRepository;
  let menuRepo: MockMenuRepository;
  let orderService: OrderService;

  const sampleMenu: MenuItem[] = [
    {
      id: 'menu-burger',
      name: 'Burger',
      description: 'Tasty burger',
      price: 10.0,
      imageUrl: 'burger.jpg',
      category: 'Burgers',
    },
    {
      id: 'menu-pizza',
      name: 'Pizza',
      description: 'Cheesy pizza',
      price: 15.5,
      imageUrl: 'pizza.jpg',
      category: 'Pizza',
    },
  ];

  beforeEach(() => {
    orderRepo = new MockOrderRepository();
    menuRepo = new MockMenuRepository(sampleMenu);
    orderService = new OrderService(orderRepo, menuRepo);
  });

  describe('Order Creation', () => {
    it('creates an order with trusted backend pricing and initial status PENDING', async () => {
      const order = await orderService.createOrder({
        customer: {
          customerName: 'John Doe',
          deliveryAddress: '123 Baker Street',
          phoneNumber: '1234567890',
        },
        items: [
          { menuItemId: 'menu-burger', quantity: 2 },
          { menuItemId: 'menu-pizza', quantity: 1 },
        ],
      });

      expect(order.id).toBeDefined();
      expect(order.status).toBe('PENDING');
      expect(order.items).toHaveLength(2);
      expect(order.items[0]?.name).toBe('Burger');
      expect(order.items[0]?.unitPrice).toBe(10.0);
      expect(order.items[0]?.quantity).toBe(2);
      expect(order.items[0]?.subtotal).toBe(20.0);

      expect(order.items[1]?.name).toBe('Pizza');
      expect(order.items[1]?.unitPrice).toBe(15.5);
      expect(order.items[1]?.quantity).toBe(1);
      expect(order.items[1]?.subtotal).toBe(15.5);

      expect(order.totalAmount).toBe(35.5);
      expect(order.customer.customerName).toBe('John Doe');
    });

    it('rejects order if customer name is missing or too short', async () => {
      await expect(
        orderService.createOrder({
          customer: { customerName: ' ', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
          items: [{ menuItemId: 'menu-burger', quantity: 1 }],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('rejects order if delivery address is missing or too short', async () => {
      await expect(
        orderService.createOrder({
          customer: { customerName: 'John', deliveryAddress: 'Hi', phoneNumber: '1234567890' },
          items: [{ menuItemId: 'menu-burger', quantity: 1 }],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('rejects order if phone number is invalid', async () => {
      await expect(
        orderService.createOrder({
          customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: 'abc' },
          items: [{ menuItemId: 'menu-burger', quantity: 1 }],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('rejects order with empty items array', async () => {
      await expect(
        orderService.createOrder({
          customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
          items: [],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('rejects order if item quantity is zero or negative', async () => {
      await expect(
        orderService.createOrder({
          customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
          items: [{ menuItemId: 'menu-burger', quantity: 0 }],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('rejects order if menu item does not exist in backend database', async () => {
      await expect(
        orderService.createOrder({
          customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
          items: [{ menuItemId: 'non-existent-item', quantity: 1 }],
        })
      ).rejects.toThrow('Menu item non-existent-item not found');
    });
  });

  describe('Order Status Transitions', () => {
    it('allows valid sequential status transitions', async () => {
      const order = await orderService.createOrder({
        customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
        items: [{ menuItemId: 'menu-burger', quantity: 1 }],
      });

      const confirmed = await orderService.updateOrderStatus(order.id, 'CONFIRMED');
      expect(confirmed.status).toBe('CONFIRMED');

      const preparing = await orderService.updateOrderStatus(order.id, 'PREPARING');
      expect(preparing.status).toBe('PREPARING');

      const outForDelivery = await orderService.updateOrderStatus(order.id, 'OUT_FOR_DELIVERY');
      expect(outForDelivery.status).toBe('OUT_FOR_DELIVERY');

      const delivered = await orderService.updateOrderStatus(order.id, 'DELIVERED');
      expect(delivered.status).toBe('DELIVERED');
    });

    it('allows cancellation from PENDING, CONFIRMED, and PREPARING', async () => {
      const order = await orderService.createOrder({
        customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
        items: [{ menuItemId: 'menu-burger', quantity: 1 }],
      });

      const cancelled = await orderService.updateOrderStatus(order.id, 'CANCELLED');
      expect(cancelled.status).toBe('CANCELLED');
    });

    it('rejects invalid jump transitions (e.g. PENDING to DELIVERED)', async () => {
      const order = await orderService.createOrder({
        customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
        items: [{ menuItemId: 'menu-burger', quantity: 1 }],
      });

      await expect(orderService.updateOrderStatus(order.id, 'DELIVERED')).rejects.toThrow(
        InvalidStateTransitionError
      );
    });

    it('rejects cancellation once order is OUT_FOR_DELIVERY', async () => {
      const order = await orderService.createOrder({
        customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
        items: [{ menuItemId: 'menu-burger', quantity: 1 }],
      });

      await orderService.updateOrderStatus(order.id, 'CONFIRMED');
      await orderService.updateOrderStatus(order.id, 'PREPARING');
      await orderService.updateOrderStatus(order.id, 'OUT_FOR_DELIVERY');

      await expect(orderService.updateOrderStatus(order.id, 'CANCELLED')).rejects.toThrow(
        InvalidStateTransitionError
      );
    });

    it('rejects transitions from terminal DELIVERED state', async () => {
      const order = await orderService.createOrder({
        customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
        items: [{ menuItemId: 'menu-burger', quantity: 1 }],
      });

      await orderService.updateOrderStatus(order.id, 'CONFIRMED');
      await orderService.updateOrderStatus(order.id, 'PREPARING');
      await orderService.updateOrderStatus(order.id, 'OUT_FOR_DELIVERY');
      await orderService.updateOrderStatus(order.id, 'DELIVERED');

      await expect(orderService.updateOrderStatus(order.id, 'CANCELLED')).rejects.toThrow(
        InvalidStateTransitionError
      );
    });
  });

  describe('Order Deletion / Cancellation via DELETE', () => {
    it('deletes order successfully if PENDING', async () => {
      const order = await orderService.createOrder({
        customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
        items: [{ menuItemId: 'menu-burger', quantity: 1 }],
      });

      const deleted = await orderService.deleteOrder(order.id);
      expect(deleted).toBe(true);

      const found = await orderService.getOrderById(order.id);
      expect(found).toBeNull();
    });

    it('rejects deletion if order is OUT_FOR_DELIVERY or DELIVERED', async () => {
      const order = await orderService.createOrder({
        customer: { customerName: 'John', deliveryAddress: '123 Main St', phoneNumber: '1234567890' },
        items: [{ menuItemId: 'menu-burger', quantity: 1 }],
      });

      await orderService.updateOrderStatus(order.id, 'CONFIRMED');
      await orderService.updateOrderStatus(order.id, 'PREPARING');
      await orderService.updateOrderStatus(order.id, 'OUT_FOR_DELIVERY');

      await expect(orderService.deleteOrder(order.id)).rejects.toThrow(
        'Cannot delete order once it is out for delivery or delivered'
      );
    });
  });
});
