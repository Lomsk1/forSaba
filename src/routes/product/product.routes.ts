import express from "express";

import { protect } from "../../middlewares/protection";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductId,
  sellProduct,
  updateProduct,
} from "../../controllers/product/product.controller";

const productRouter = express.Router();

productRouter.route("/").get(getAllProducts).post(protect, createProduct);

productRouter
  .route("/:id")
  .get(getProductId)
  .patch(protect, sellProduct)
  .delete(protect, deleteProduct)
  .put(protect, updateProduct);

export default productRouter;
