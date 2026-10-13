import { MenuItem } from '../models/MenuItem.js';
import { IMenuRepository } from '../repositories/IMenuRepository.js';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class MenuService {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async getAllMenuItems(): Promise<MenuItem[]> {
    return this.menuRepository.findAll();
  }

  async getMenuItemById(id: string): Promise<MenuItem> {
    const item = await this.menuRepository.findById(id);
    if (!item) {
      throw new NotFoundError(`Menu item with ID ${id} not found`);
    }
    return item;
  }
}
