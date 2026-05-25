import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from '../utils/validation';

type ValidatorFn = (req: Request) => string | null;

export const validate = (validator: ValidatorFn) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const error = validator(req);
    if (error) {
      res.status(400).json({ success: false, error });
      return;
    }
    next();
  };
};

export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, error: `Invalid ${paramName}` });
      return;
    }
    next();
  };
};
