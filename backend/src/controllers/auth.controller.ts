import { NextFunction, Request, Response } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import * as authService from '../services/auth.service';

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // req.user is guaranteed by authenticate middleware
    const user = await authService.getMe(req.user!.id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
