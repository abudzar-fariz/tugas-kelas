import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, validationError } from '../utils/errors';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const appErr = validationError(
      err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
    res.status(appErr.statusCode).json(formatError(appErr));
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json(formatError(err));
    return;
  }

  // Unknown errors — hide details from client
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Terjadi kesalahan pada server',
      details: [],
    },
  });
}

function formatError(err: AppError) {
  return {
    error: {
      code: err.code,
      message: err.message,
      details: err.details,
    },
  };
}
