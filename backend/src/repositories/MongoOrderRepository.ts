import { Model } from 'mongoose';
import { Order } from '../models/Order.js';
import { IOrderRepository } from './IOrderRepository.js';
import { OrderDocument, OrderModel } from '../models/mongo/OrderSchema.js';

export class MongoOrderRepository implements IOrderRepository {
  constructor(private readonly model: Model<OrderDocument> = OrderModel) {}

  async create(order: Order): Promise<Order> {
    const created = await this.model.create(order);
    const obj = created.toObject ? created.toObject() : created;
    return this.toEntity(obj);
  }

  async findById(id: string): Promise<Order | null> {
    const doc: any = await this.model.findOne({ id }).lean();
    if (!doc) {
      return null;
    }
    return this.toEntity(doc);
  }

  async findAll(): Promise<Order[]> {
    const docs = await this.model.find().sort({ createdAt: -1 }).lean();
    return docs.map((doc: any) => this.toEntity(doc));
  }

  async update(order: Order): Promise<Order> {
    const updated: any = await this.model
      .findOneAndUpdate({ id: order.id }, { $set: order }, { new: true })
      .lean();

    if (!updated) {
      throw new Error(`Order with id ${order.id} not found for update`);
    }

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ id });
    return (result.deletedCount ?? 0) > 0;
  }

  private toEntity(doc: any): Order {
    return {
      id: doc.id,
      customer: {
        customerName: doc.customer.customerName,
        deliveryAddress: doc.customer.deliveryAddress,
        phoneNumber: doc.customer.phoneNumber,
      },
      items: doc.items.map((item: any) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        imageUrl: item.imageUrl,
      })),
      totalAmount: doc.totalAmount,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
