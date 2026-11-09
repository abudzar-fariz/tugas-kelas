import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { clearDatabase, teardown } from './setup';

beforeAll(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardown();
});

describe('POST /api/v1/auth/register', () => {
  it('registers a teacher successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Guru Baru',
      email: 'guru.baru@test.id',
      password: 'password123',
      role: 'TEACHER',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.role).toBe('TEACHER');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('registers a student with className', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Siswa Baru',
      email: 'siswa.baru@test.id',
      password: 'password123',
      role: 'STUDENT',
      className: '10-A',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.className).toBe('10-A');
  });

  it('returns 409 for duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Duplikat',
      email: 'guru.baru@test.id', // already registered above
      password: 'password123',
      role: 'TEACHER',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns 400 when student has no className', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Tanpa Kelas',
      email: 'no.class@test.id',
      password: 'password123',
      role: 'STUDENT',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for short password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Short PW',
      email: 'short@test.id',
      password: '123',
      role: 'TEACHER',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('normalises email to lowercase', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Upper Case',
      email: 'Upper.Case@Test.Id',
      password: 'password123',
      role: 'TEACHER',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('upper.case@test.id');
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns 200 with token on correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'guru.baru@test.id',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.role).toBe('TEACHER');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'guru.baru@test.id',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'nobody@test.id',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/auth/me', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'guru.baru@test.id',
      password: 'password123',
    });
    token = res.body.token;
  });

  it('returns 200 with user profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('guru.baru@test.id');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer this.is.invalid');
    expect(res.status).toBe(401);
  });
});
