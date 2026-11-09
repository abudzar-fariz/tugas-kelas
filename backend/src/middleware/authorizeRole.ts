import { NextFunction, Request, Response } from 'express';
import { forbidden, unauthorized } from '../utils/errors';

export function authorizeRole(...roles: ('TEACHER' | 'STUDENT')[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(forbidden());
    }
    next();
  };
}
