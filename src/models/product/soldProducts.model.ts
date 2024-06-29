import mongoose, { Document, Model } from "mongoose";
import { Query } from "mongoose";

// An interface that describes the properties
// that are required to create a new Brand
interface SoldProductAttrs {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  amount: number;
  createdAt: Date;
}

// An interface that describes the properties
// that a Brand Model has
interface SoldProductModel extends Model<SoldProductDoc> {
  build(attrs: SoldProductAttrs): SoldProductDoc;
}

// An interface that describes the properties
// that a Brand Document has
export interface SoldProductDoc extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  amount: number;

  createdAt: Date;
}

const soldProductSchema = new mongoose.Schema<SoldProductAttrs>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "გთხოვთ მიუთითოთ მომხმარებელი"],
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "გთხოვთ მიუთითოთ მომხმარებელი"],
  },
  amount: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

soldProductSchema.pre(/^find/, function (next) {
  const query = this as Query<SoldProductDoc[], SoldProductDoc>;

  query.populate({
    path: "product",
    select: "_id title price amount",
  });

  next();
});

const SoldProduct = mongoose.model<SoldProductDoc, SoldProductModel>(
  "SoldProduct",
  soldProductSchema
);

export default SoldProduct;
