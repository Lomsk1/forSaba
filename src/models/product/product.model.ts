import mongoose, { Document, Model } from "mongoose";

// An interface that describes the properties
// that are required to create a new Brand
interface ProductAttrs {
  title: {
    en: string;
    ka: string;
  };
  price: number;
  amount: number;
  totalAmount: number;
  soldDate: Date;

  user: mongoose.Types.ObjectId;

  createdAt: Date;
}

// An interface that describes the properties
// that a Brand Model has
interface ProductModel extends Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc;
}

// An interface that describes the properties
// that a Brand Document has
export interface ProductDoc extends Document {
  title: {
    en: string;
    ka: string;
  };
  price: number;
  amount: number;
  totalAmount: number;
  soldDate: Date;

  user: mongoose.Types.ObjectId;

  createdAt: Date;
  sellProductFn(soldItems: number): Promise<void>;
}

const productSchema = new mongoose.Schema<ProductAttrs>({
  title: {
    en: {
      type: String,
      required: [true, "გთხოვთ მიუთითოთ სერვისის დასახელება ინგლისურად"],
    },
    ka: {
      type: String,
      required: [true, "გთხოვთ მიუთითოთ სერვისის დასახელება ქართულად"],
    },
  },
  amount: {
    type: Number,
    default: function (): number {
      const ProductAttrs = this as ProductAttrs;
      return ProductAttrs.totalAmount;
    },
  },
  price: {
    type: Number,
    default: 0,
  },
  soldDate: {
    type: Date,
  },
  totalAmount: {
    type: Number,
    default: 1,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "გთხოვთ მიუთითოთ მომხმარებელი"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// productSchema.pre(/^find/, function (next: NextFunction) {
//   const query = this as Query<ProductDoc[], ProductDoc>;

//   query.find({ amount: { $gt: 0 } });
//   next();
// });

productSchema.methods.sellProductFn = async function (soldItems: number) {
  this.amount = this.amount - soldItems;
  this.soldDate = Date.now();
  await this.save();
};

const Product = mongoose.model<ProductDoc, ProductModel>(
  "Product",
  productSchema
);

export default Product;
