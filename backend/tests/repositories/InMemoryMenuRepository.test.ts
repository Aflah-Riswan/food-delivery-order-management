import { describe, it, expect } from 'vitest';
import { InMemoryMenuRepository } from '../../src/repositories/InMemoryMenuRepository.js';

describe('InMemoryMenuRepository', () => {
  it('should initialize with default seed items', async () => {
    const repo = new InMemoryMenuRepository();
    const items = await repo.findAll();
    expect(items.length).toBeGreaterThan(0);
  });

  it('should find item by valid id', async () => {
    const repo = new InMemoryMenuRepository();
    const items = await repo.findAll();
    const firstItem = items[0]!;

    const found = await repo.findById(firstItem.id);
    expect(found).toEqual(firstItem);
  });

  it('should return null when item id is not found', async () => {
    const repo = new InMemoryMenuRepository();
    const found = await repo.findById('does-not-exist');
    expect(found).toBeNull();
  });
});
