import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { seedTestData, teardown, type SeedResult } from './setup';

let seed: SeedResult;

beforeAll(async () => {
  seed = await seedTestData();
});

afterAll(async () => {
  await teardown();
});

describe('PUT /api/v1/tasks/:id/completion — student marks complete', () => {
  it('returns 200 when student marks their class task complete', async () => {
    const res = await request(app)
      .put(`/api/v1/tasks/${seed.task10A.id}/completion`)
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.taskId).toBe(seed.task10A.id);
    expect(res.body.data.completedAt).toBeDefined();
  });

  it('is idempotent — second PUT returns 200 without error', async () => {
    const res = await request(app)
      .put(`/api/v1/tasks/${seed.task10A.id}/completion`)
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(200);
  });

  it('returns 422 when student marks a task from a different class', async () => {
    // studentB (10-B) tries to complete task10A (10-A)
    const res = await request(app)
      .put(`/api/v1/tasks/${seed.task10A.id}/completion`)
      .set('Authorization', `Bearer ${seed.studentB.token}`);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('UNPROCESSABLE');
  });

  it('returns 403 when teacher tries to mark complete', async () => {
    const res = await request(app)
      .put(`/api/v1/tasks/${seed.task10A.id}/completion`)
      .set('Authorization', `Bearer ${seed.teacher.token}`);
    expect(res.status).toBe(403);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .put(`/api/v1/tasks/${seed.task10A.id}/completion`);
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/api/v1/tasks/00000000-0000-0000-0000-000000000000/completion')
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/tasks/:id/completion — student unmarks', () => {
  it('returns 204 when student unmarks completion', async () => {
    // Ensure it's marked first
    await request(app)
      .put(`/api/v1/tasks/${seed.task10A.id}/completion`)
      .set('Authorization', `Bearer ${seed.studentA.token}`);

    const res = await request(app)
      .delete(`/api/v1/tasks/${seed.task10A.id}/completion`)
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(204);
  });

  it('is idempotent — second DELETE also returns 204', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${seed.task10A.id}/completion`)
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(204);
  });

  it('returns 403 when teacher tries to unmark', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${seed.task10A.id}/completion`)
      .set('Authorization', `Bearer ${seed.teacher.token}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/v1/tasks — completion status filter', () => {
  beforeAll(async () => {
    // Mark task10A as completed by studentA, leave task10B unmarked
    await request(app)
      .put(`/api/v1/tasks/${seed.task10A.id}/completion`)
      .set('Authorization', `Bearer ${seed.studentA.token}`);
  });

  it('returns only completed tasks with ?status=completed', async () => {
    const res = await request(app)
      .get('/api/v1/tasks?status=completed')
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((t: { isCompleted: boolean }) => t.isCompleted === true)).toBe(true);
  });

  it('returns only pending tasks with ?status=pending', async () => {
    const res = await request(app)
      .get('/api/v1/tasks?status=pending')
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((t: { isCompleted: boolean }) => t.isCompleted === false)).toBe(true);
  });

  it('each task in list has isCompleted field for student', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((t: { isCompleted: boolean }) => typeof t.isCompleted === 'boolean')).toBe(true);
  });

  it('student 10-A cannot see task from 10-B in list', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    const classNames = res.body.data.map((t: { className: string }) => t.className);
    expect(classNames.every((c: string) => c === '10-A')).toBe(true);
  });
});
