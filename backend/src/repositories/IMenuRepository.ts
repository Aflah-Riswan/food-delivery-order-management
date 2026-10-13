import { MenuItem } from '../models/MenuItem.js';

export interface IMenuRepository {
  findAll(): Promise<MenuItem[]>;
  findById(id: string): Promise<MenuItem | null>;
}
