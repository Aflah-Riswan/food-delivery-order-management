import { describe, it, expect, vi } from 'vitest';
import { MongoOrderRepository } from '../../src/repositories/MongoOrderRepository.js';
import { Order } from '../../src/models/Order.js';

describe('MongoOrderRepository', () => {
  const sampleOrder: Order = {
    id: 'order-123',
    customer: {
      customerName: 'Aflah',
      deliveryAddress: '123 Main St',
      phoneNumber: '1234567890',
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
    createdAt: '2026-10-14T10:00:00.000Z',
    updatedAt: '2026-10-14T10:00:00.000Z',
  };

  it('create saves order and returns domain entity', async () => {
    const mockModel: any = {
      create: vi.fn().mockResolvedValue({
        toObject: () => ({ ...sampleOrder, _id: 'mongo-id-123' }),
      }),
    };

    const repo = new MongoOrderRepository(mockModel);
    const created = await repo.create(sampleOrder);

    expect(mockModel.create).toHaveBeenCalledWith(sampleOrder);
    expect(created.id).toBe('order-123');
    expect(created.status).toBe('PENDING');
  });

  it('findById finds order by custom id and returns entity', async () => {
    const mockModel: any = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ ...sampleOrder, _id: 'mongo-id-123' }),
      }),
    };

    const repo = new MongoOrderRepository(mockModel);
    const found = await repo.findById('order-123');

    expect(mockModel.findOne).toHaveBeenCalledWith({ id: 'order-123' });
    expect(found?.id).toBe('order-123');
  });

  it('findById returns null if not found', async () => {
    const mockModel: any = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    };

    const repo = new MongoOrderRepository(mockModel);
    const found = await repo.findById('missing-order');

    expect(found).toBeNull();
  });

  it('findAll returns all orders sorted by createdAt descending', async () => {
    const mockModel: any = {
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([{ ...sampleOrder, _id: 'mongo-id-123' }]),
        }),
      }),
    };

    const repo = new MongoOrderRepository(mockModel);
    const all = await repo.findAll();

    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe('order-123');
  });

  it('update updates an existing order and returns updated entity', async () => {
    const updatedOrder: Order = {
      ...sampleOrder,
      status: 'CONFIRMED',
      updatedAt: '2026-10-14T10:05:00.000Z',
    };

    const mockModel: any = {
      findOneAndUpdate: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ ...updatedOrder, _id: 'mongo-id-123' }),
      }),
    };

    const repo = new MongoOrderRepository(mockModel);
    const result = await repo.update(updatedOrder);

    expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: 'order-123' },
      { $set: updatedOrder },
      { new: true }
    );
    expect(result.status).toBe('CONFIRMED');
  });

  it('delete removes order by id and returns boolean', async () => {
    const mockModel: any = {
      deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    };

    const repo = new MongoOrderRepository(mockModel);
    const success = await repo.delete('order-123');

    expect(mockModel.deleteOne).toHaveBeenCalledWith({ id: 'order-123' });
    expect(success).toBe(true);
  });
});
