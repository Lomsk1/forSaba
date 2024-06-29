import express from "express";
import {
  updateUserPassword,
  userLogin,
  userSignUp,
} from "../../controllers/user/auth.controller";
import { getCostumer } from "../../middlewares/getCostumer";
import { protect } from "../../middlewares/protection";
import {
  getUser,
  getUserById,
  updateUser,
} from "../../controllers/user/user.controller";

const userRouter = express.Router();

userRouter.post("/signup", userSignUp);
userRouter.post("/login", userLogin);

userRouter.get("/getUser/:id", getUserById);

userRouter.use(protect);
userRouter.get("/me", getCostumer, getUser);

userRouter.patch("/updateMe", updateUser);
userRouter.patch("/updatePassword", updateUserPassword);

export default userRouter;
