import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized } from '../utils/errors';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  className: string | null;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(unauthorized());
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error('JWT_SECRET is not configured'));
  }

  try {
    const payload = jwt.verify(token, secret as string) as JwtPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      // Role enum values match string literals — safe cast after JWT verification
      role: payload.role as 'TEACHER' | 'STUDENT',
      className: payload.className,
    };
    next();
  } catch {
    next(unauthorized('Token tidak valid atau sudah kedaluwarsa'));
  }
}
