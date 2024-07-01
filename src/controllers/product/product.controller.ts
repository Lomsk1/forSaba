import { createOne, deleteOne, getAll, getOne, updateOne } from "./../factory";
import Product from "../../models/product/product.model";
import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Response, Request } from "express";
import User from "../../models/user/user.models";
import SoldProduct from "../../models/product/soldProducts.model";

export const getAllProducts = getAll(Product, {
  path: "user",
  select: "firstName lastName _id",
});
export const getProductId = getOne(Product, {
  path: "user",
  select: "firstName lastName _id",
});
export const createProduct = createOne(Product);
export const updateProduct = updateOne(Product);
export const deleteProduct = deleteOne(Product);

export const sellProduct = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.body.user);

    await product.sellProductFn(req.body.amount ? req.body.amount : 1);

    if (user && product) {
      user.totalSellingMoney = req.body.amount
        ? product.price * req.body.amount + user.totalSellingMoney
        : product.price + user.totalSellingMoney;

      await user.save({ validateBeforeSave: false });
    }

    await SoldProduct.create({
      user: user.id,
      product: product.id,
      amount: req.body.amount,
    });

    res.status(201).json({
      status: "success",
      user,
      product,
    });
  }
);
