import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from '../../src/services/OrderService.js';
import { MockOrderRepository, MockMenuRepository } from '../mocks/MockRepositories.js';
import { Order } from '../../src/models/Order.js';

describe('Order Simulation in OrderService', () => {
  let orderService: OrderService;
  let orderRepo: MockOrderRepository;
  let menuRepo: MockMenuRepository;

  beforeEach(() => {
    orderRepo = new MockOrderRepository();
    menuRepo = new MockMenuRepository();
    orderService = new OrderService(orderRepo, menuRepo);
  });

  it('advances an order step-by-step through the fulfillment lifecycle', async () => {
    const order = await orderService.createOrder({
      customer: {
        customerName: 'Bob',
        deliveryAddress: '101 Pine St',
        phoneNumber: '555-0100',
      },
      items: [{ menuItemId: 'item-1', quantity: 1 }],
    });

    expect(order.status).toBe('PENDING');

    // Step 1: PENDING -> CONFIRMED
    const step1 = await orderService.simulateNextStep(order.id);
    expect(step1.status).toBe('CONFIRMED');

    // Step 2: CONFIRMED -> PREPARING
    const step2 = await orderService.simulateNextStep(order.id);
    expect(step2.status).toBe('PREPARING');

    // Step 3: PREPARING -> OUT_FOR_DELIVERY
    const step3 = await orderService.simulateNextStep(order.id);
    expect(step3.status).toBe('OUT_FOR_DELIVERY');

    // Step 4: OUT_FOR_DELIVERY -> DELIVERED
    const step4 = await orderService.simulateNextStep(order.id);
    expect(step4.status).toBe('DELIVERED');

    // Step 5: Terminal state cannot advance
    await expect(orderService.simulateNextStep(order.id)).rejects.toThrow(
      'Order is already in terminal state DELIVERED'
    );
  });

  it('notifies status listeners on each simulated step', async () => {
    const order = await orderService.createOrder({
      customer: {
        customerName: 'Bob',
        deliveryAddress: '101 Pine St',
        phoneNumber: '555-0100',
      },
      items: [{ menuItemId: 'item-1', quantity: 1 }],
    });

    const emittedStatuses: string[] = [];
    const unsubscribe = orderService.addStatusListener((updated: Order) => {
      if (updated.id === order.id) {
        emittedStatuses.push(updated.status);
      }
    });

    await orderService.simulateNextStep(order.id);
    await orderService.simulateNextStep(order.id);

    expect(emittedStatuses).toEqual(['CONFIRMED', 'PREPARING']);
    unsubscribe();
  });
});
