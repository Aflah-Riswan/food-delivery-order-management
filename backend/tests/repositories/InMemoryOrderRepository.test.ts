import { describe, it, expect } from 'vitest';
import { InMemoryOrderRepository } from '../../src/repositories/InMemoryOrderRepository.js';
import { Order } from '../../src/models/Order.js';

describe('InMemoryOrderRepository', () => {
  const sampleOrder: Order = {
    id: 'test-order-1',
    customer: {
      customerName: 'Alice',
      deliveryAddress: '456 Elm Street',
      phoneNumber: '9876543210',
    },
    items: [
      {
        menuItemId: 'item-1',
        name: 'Burger',
        unitPrice: 10,
        quantity: 2,
        subtotal: 20,
      },
    ],
    totalAmount: 20,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('creates and finds an order by ID', async () => {
    const repo = new InMemoryOrderRepository();
    const created = await repo.create(sampleOrder);
    expect(created.id).toBe('test-order-1');

    const found = await repo.findById('test-order-1');
    expect(found).toEqual(sampleOrder);
  });

  it('lists all stored orders', async () => {
    const repo = new InMemoryOrderRepository();
    await repo.create(sampleOrder);
    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe('test-order-1');
  });

  it('updates an existing order', async () => {
    const repo = new InMemoryOrderRepository();
    await repo.create(sampleOrder);

    const updated = await repo.update({
      ...sampleOrder,
      status: 'CONFIRMED',
    });
    expect(updated.status).toBe('CONFIRMED');

    const found = await repo.findById('test-order-1');
    expect(found?.status).toBe('CONFIRMED');
  });

  it('deletes an order', async () => {
    const repo = new InMemoryOrderRepository();
    await repo.create(sampleOrder);

    const deleted = await repo.delete('test-order-1');
    expect(deleted).toBe(true);

    const found = await repo.findById('test-order-1');
    expect(found).toBeNull();
  });
});
