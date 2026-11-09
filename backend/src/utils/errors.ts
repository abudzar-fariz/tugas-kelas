export interface ErrorDetail {
  field?: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details: ErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const badRequest = (message: string, details: ErrorDetail[] = []) =>
  new AppError(400, 'BAD_REQUEST', message, details);

export const unauthorized = (message = 'Autentikasi diperlukan') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'Akses ditolak') =>
  new AppError(403, 'FORBIDDEN', message);

export const notFound = (message = 'Data tidak ditemukan') =>
  new AppError(404, 'NOT_FOUND', message);

export const conflict = (message: string) =>
  new AppError(409, 'CONFLICT', message);

export const unprocessable = (message: string, details: ErrorDetail[] = []) =>
  new AppError(422, 'UNPROCESSABLE', message, details);

export const validationError = (details: ErrorDetail[]) =>
  new AppError(400, 'VALIDATION_ERROR', 'Input tidak valid', details);
