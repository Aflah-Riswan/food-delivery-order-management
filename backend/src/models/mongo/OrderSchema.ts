import mongoose, { Schema, Model } from 'mongoose';
import { OrderStatus } from '../Order.js';

export interface OrderDocument extends mongoose.Document {
  id: string;
  customer: {
    customerName: string;
    deliveryAddress: string;
    phoneNumber: string;
  };
  items: Array<{
    menuItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    imageUrl?: string;
  }>;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const OrderItemSnapshotSchema = new Schema(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: false },
  },
  { _id: false }
);

const CustomerInfoSchema = new Schema(
  {
    customerName: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { _id: false }
);

export const OrderSchema = new Schema<OrderDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customer: { type: CustomerInfoSchema, required: true },
    items: { type: [OrderItemSnapshotSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export const OrderModel: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);
