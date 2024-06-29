import { NextFunction, Request, Response } from "express";

export const getCostumer = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.params.id = req.costumer.id;
  next();
};

export const setUserId = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};