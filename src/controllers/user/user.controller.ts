import { filterObj } from "./../../helper/filterObj";
import { Response, Request, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import User from "../../models/user/user.models";
import AppError from "../../utils/appErrors";
import { getAll, getOne } from "../factory";

export const getUserById = getOne(User);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError("მოცემულ ID-ზე მომხმარებელი ვერ მოიძებნა", 404));
    }
    res.status(200).json({
      status: "success",
      user,
    });
  }
);

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError("გთხოვთ განაახლოთ მხოლოდ ინფორმაცია, პაროლის გარეშე", 400)
      );
    }

    // 2) Filtered out unwanted fields that are not allowed too be updated
    const filteredBody: any = filterObj(
      req.body,
      "firstName",
      "lastName",
      "username"
    );

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      user: updatedUser,
    });
  }
);

export const getAllUser = getAll(User);
