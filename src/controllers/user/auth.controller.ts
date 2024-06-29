import { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import { signToken } from "../../middlewares/jwt";
import User, { UserDoc } from "../../models/user/user.models";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../utils/appErrors";

dotenv.config();

export const createSendToken = (
  user: UserDoc,
  statusCode: number,
  res: Response,
  req: Request
) => {
  const token = signToken(user.id, user.email, user.role);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN!) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

export const userSignUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const checkUser = await User.findOne({ email: req.body.email });
    if (checkUser) {
      next(new AppError("აღნიშნული იმეილით უკვე არსებობს მომხმარებელი", 400));
    } else {
      const newUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
      });

      createSendToken(newUser, 201, res, req);
    }
  }
);

export const userLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
      return next(new AppError("გთხოვთ, მიუთითოთ იმეილი და პაროლი!", 400));
    }
    // 2) check if user exist && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("პაროლი ან იმეილი არასწორია", 401));
    }

    // 3) if everything is OK, send token to client
    createSendToken(user, 200, res, req);
  }
);

export const updateUserPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) check if POSTed current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("ახლანდელი პაროლი არასწორია", 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res, req);
  }
);
