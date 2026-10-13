import { describe, it, expect, beforeEach } from 'vitest';
import { MenuService } from '../../src/services/MenuService.js';
import { IMenuRepository } from '../../src/repositories/IMenuRepository.js';
import { MenuItem } from '../../src/models/MenuItem.js';

class MockMenuRepository implements IMenuRepository {
  private items: MenuItem[] = [];

  constructor(initialItems: MenuItem[] = []) {
    this.items = [...initialItems];
  }

  async findAll(): Promise<MenuItem[]> {
    return [...this.items];
  }

  async findById(id: string): Promise<MenuItem | null> {
    const item = this.items.find((i) => i.id === id);
    return item ? { ...item } : null;
  }
}

describe('MenuService', () => {
  const sampleItems: MenuItem[] = [
    {
      id: 'menu-1',
      name: 'Margherita Pizza',
      description: 'Classic cheese and tomato pizza with fresh basil',
      price: 12.99,
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3',
      category: 'Pizza',
    },
    {
      id: 'menu-2',
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with cheddar cheese and lettuce',
      price: 9.99,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      category: 'Burgers',
    },
  ];

  let menuRepo: MockMenuRepository;
  let menuService: MenuService;

  beforeEach(() => {
    menuRepo = new MockMenuRepository(sampleItems);
    menuService = new MenuService(menuRepo);
  });

  it('should return all menu items', async () => {
    const items = await menuService.getAllMenuItems();
    expect(items).toHaveLength(2);
    expect(items[0]?.name).toBe('Margherita Pizza');
  });

  it('should return a menu item by ID when it exists', async () => {
    const item = await menuService.getMenuItemById('menu-1');
    expect(item).toBeDefined();
    expect(item.id).toBe('menu-1');
    expect(item.price).toBe(12.99);
  });

  it('should throw an error when menu item is not found', async () => {
    await expect(menuService.getMenuItemById('non-existent')).rejects.toThrow(
      'Menu item with ID non-existent not found'
    );
  });
});
