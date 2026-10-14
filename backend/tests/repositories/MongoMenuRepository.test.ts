import { describe, it, expect, vi } from 'vitest';
import { MongoMenuRepository } from '../../src/repositories/MongoMenuRepository.js';
import { MenuItem } from '../../src/models/MenuItem.js';

describe('MongoMenuRepository', () => {
  const sampleItems: MenuItem[] = [
    {
      id: 'item-1',
      name: 'Burger',
      description: 'Juicy burger',
      price: 10,
      imageUrl: 'http://example.com/burger.jpg',
      category: 'Burgers',
    },
  ];

  it('findAll returns array of menu items mapped from mongo model', async () => {
    const mockModel: any = {
      find: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: 'mongo-id-1',
            id: 'item-1',
            name: 'Burger',
            description: 'Juicy burger',
            price: 10,
            imageUrl: 'http://example.com/burger.jpg',
            category: 'Burgers',
          },
        ]),
      }),
    };

    const repo = new MongoMenuRepository(mockModel);
    const items = await repo.findAll();

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe('item-1');
    expect(items[0]?.name).toBe('Burger');
  });

  it('findById returns item when found by custom id', async () => {
    const mockModel: any = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: 'mongo-id-1',
          id: 'item-1',
          name: 'Burger',
          description: 'Juicy burger',
          price: 10,
          imageUrl: 'http://example.com/burger.jpg',
          category: 'Burgers',
        }),
      }),
    };

    const repo = new MongoMenuRepository(mockModel);
    const item = await repo.findById('item-1');

    expect(mockModel.findOne).toHaveBeenCalledWith({ id: 'item-1' });
    expect(item?.id).toBe('item-1');
    expect(item?.name).toBe('Burger');
  });

  it('findById returns null when item is not found', async () => {
    const mockModel: any = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    };

    const repo = new MongoMenuRepository(mockModel);
    const item = await repo.findById('unknown-id');

    expect(item).toBeNull();
  });

  it('seeds default items if the collection is empty', async () => {
    const mockModel: any = {
      countDocuments: vi.fn().mockResolvedValue(0),
      insertMany: vi.fn().mockResolvedValue(sampleItems),
    };

    const repo = new MongoMenuRepository(mockModel);
    await repo.seedIfEmpty(sampleItems);

    expect(mockModel.countDocuments).toHaveBeenCalled();
    expect(mockModel.insertMany).toHaveBeenCalledWith(sampleItems);
  });
});
