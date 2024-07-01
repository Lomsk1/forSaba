import { createOne, getAll, getOne } from "./../factory";
import SoldProduct from "../../models/product/soldProducts.model";

export const getAllSoldProducts = getAll(SoldProduct, {
  path: "user",
  select: "firstName lastName username _id",
});
export const getSoldProductId = getOne(SoldProduct);
export const createSoldProduct = createOne(SoldProduct);
