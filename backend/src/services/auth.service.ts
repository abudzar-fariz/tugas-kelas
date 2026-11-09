import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { conflict, unauthorized } from '../utils/errors';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

const prisma = new PrismaClient();
const BCRYPT_COST = 12;

function signToken(payload: {
  sub: string;
  email: string;
  name: string;
  role: string;
  className: string | null;
}): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '8h') as jwt.SignOptions['expiresIn'];
  return jwt.sign(payload, secret, { expiresIn });
}

function safeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  className: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    className: user.className,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('Email sudah digunakan');

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      className: input.className ?? null,
    },
  });

  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    className: user.className,
  });

  return { token, user: safeUser(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw unauthorized('Email atau password salah');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw unauthorized('Email atau password salah');

  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    className: user.className,
  });

  return { token, user: safeUser(user) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw unauthorized();
  return safeUser(user);
}
