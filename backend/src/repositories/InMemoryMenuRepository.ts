import { MenuItem } from '../models/MenuItem.js';
import { IMenuRepository } from './IMenuRepository.js';
import { defaultMenuItems } from '../data/seedMenu.js';

/**
 * In-memory storage repository for menu items.
 *
 * NOTE: All data stored in this repository is held exclusively in volatile memory (RAM).
 * All items and modifications will be lost whenever the server restarts or the process exits.
 * This repository is not permanently persisted.
 */
export class InMemoryMenuRepository implements IMenuRepository {
  private readonly items: Map<string, MenuItem> = new Map();

  constructor(seedItems?: MenuItem[]) {
    const seeds = seedItems ?? defaultMenuItems;
    for (const item of seeds) {
      this.items.set(item.id, { ...item });
    }
  }

  async findAll(): Promise<MenuItem[]> {
    return Array.from(this.items.values()).map((item) => ({ ...item }));
  }

  async findById(id: string): Promise<MenuItem | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }
}
