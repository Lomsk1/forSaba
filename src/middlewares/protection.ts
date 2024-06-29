import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appErrors";
import User, { UserDoc } from "../models/user/user.models";

interface CostumerPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      costumer: CostumerPayload;
      user: UserDoc;
    }
  }
}

export const protect = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's there
    let token: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("არ ხართ ავტორიზებული! გთხოვთ, გაიაროთ ავტორიზაცია", 401)
      );
    }

    // 2) Verification token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CostumerPayload;

    // 3) check if user still exist
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError("ვალიდურობის დრო გასულია", 401));
    }

    // 4) Check if user changed password after the  JWT was issued
    if (currentUser && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "პაროლი ახალი შეცვლილია! გთხოვთ გაიაროთ ავტორიზაცია თავიდან",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.costumer = decoded;
    req.user = currentUser;
    next();
  }
);
