import express from "express";

import { protect } from "../../middlewares/protection";
import {createSoldProduct, 
  getAllSoldProducts,
  getSoldProductId,
} from "../../controllers/product/soldProduct.contoller";

const soldProductRouter = express.Router();

soldProductRouter
  .route("/")
  .get(getAllSoldProducts)
  .post(protect, createSoldProduct);

soldProductRouter.route("/:id").get(getSoldProductId);

export default soldProductRouter;
