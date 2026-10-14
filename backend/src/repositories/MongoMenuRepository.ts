import { Model } from 'mongoose';
import { MenuItem } from '../models/MenuItem.js';
import { IMenuRepository } from './IMenuRepository.js';
import { MenuItemDocument, MenuItemModel } from '../models/mongo/MenuItemSchema.js';

export class MongoMenuRepository implements IMenuRepository {
  constructor(private readonly model: Model<MenuItemDocument> = MenuItemModel) {}

  async findAll(): Promise<MenuItem[]> {
    const docs = await this.model.find().lean();
    return docs.map((doc: any) => this.toEntity(doc));
  }

  async findById(id: string): Promise<MenuItem | null> {
    const doc: any = await this.model.findOne({ id }).lean();
    if (!doc) {
      return null;
    }
    return this.toEntity(doc);
  }

  async seedIfEmpty(items: MenuItem[]): Promise<void> {
    const count = await this.model.countDocuments();
    if (count === 0 && items.length > 0) {
      await this.model.insertMany(items);
    }
  }

  private toEntity(doc: any): MenuItem {
    return {
      id: doc.id,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      imageUrl: doc.imageUrl,
      category: doc.category,
    };
  }
}
