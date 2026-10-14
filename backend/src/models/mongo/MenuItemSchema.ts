import mongoose, { Schema, Model } from 'mongoose';

export interface MenuItemDocument extends mongoose.Document {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export const MenuItemSchema = new Schema<MenuItemDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
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

export const MenuItemModel: Model<MenuItemDocument> =
  mongoose.models.MenuItem || mongoose.model<MenuItemDocument>('MenuItem', MenuItemSchema);
