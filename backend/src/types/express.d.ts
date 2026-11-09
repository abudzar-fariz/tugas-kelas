// Module augmentation — must have at least one import/export to be treated as a module
export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'TEACHER' | 'STUDENT';
        className: string | null;
      };
    }
  }
}
