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

describe('POST /api/v1/tasks — teacher only', () => {
  it('returns 201 when teacher creates a task', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${seed.teacher.token}`)
      .send({
        title: 'Tugas Guru',
        description: 'Deskripsi tugas dari guru',
        dueDate: '2027-06-01T00:00:00.000Z',
        className: '10-A',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Tugas Guru');
    expect(res.body.data.teacherId).toBe(seed.teacher.id);
  });

  it('returns 403 when student tries to create a task', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${seed.studentA.token}`)
      .send({
        title: 'Tugas Siswa',
        description: 'Siswa tidak boleh ini',
        dueDate: '2027-06-01T00:00:00.000Z',
        className: '10-A',
      });
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/tasks').send({
      title: 'No Auth',
      description: 'Should fail',
      dueDate: '2027-06-01T00:00:00.000Z',
      className: '10-A',
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${seed.teacher.token}`)
      .send({ title: 'Tidak Lengkap' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PATCH /api/v1/tasks/:id — owner only', () => {
  it('returns 200 when task owner updates the task', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${seed.task10A.id}`)
      .set('Authorization', `Bearer ${seed.teacher.token}`)
      .send({ title: 'Judul Diperbarui' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Judul Diperbarui');
  });

  it('returns 403 when non-owner teacher updates the task', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${seed.task10A.id}`)
      .set('Authorization', `Bearer ${seed.teacher2.token}`)
      .send({ title: 'Curi Task' });
    expect(res.status).toBe(403);
  });

  it('returns 403 when student tries to update a task', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${seed.task10A.id}`)
      .set('Authorization', `Bearer ${seed.studentA.token}`)
      .send({ title: 'Siswa Mengubah' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/v1/tasks/:id — owner only', () => {
  let tempTaskId: string;

  beforeAll(async () => {
    // Create a temp task owned by teacher to delete
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${seed.teacher.token}`)
      .send({
        title: 'Task Sementara',
        description: 'Akan dihapus',
        dueDate: '2027-06-01T00:00:00.000Z',
        className: '10-A',
      });
    tempTaskId = res.body.data.id;
  });

  it('returns 403 when student tries to delete a task', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${tempTaskId}`)
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 when non-owner teacher deletes the task', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${tempTaskId}`)
      .set('Authorization', `Bearer ${seed.teacher2.token}`);
    expect(res.status).toBe(403);
  });

  it('returns 204 when task owner deletes the task', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${tempTaskId}`)
      .set('Authorization', `Bearer ${seed.teacher.token}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 after deletion', async () => {
    const res = await request(app)
      .get(`/api/v1/tasks/${tempTaskId}`)
      .set('Authorization', `Bearer ${seed.teacher.token}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/v1/tasks — role scoping', () => {
  it('teacher only sees their own tasks', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${seed.teacher.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.every((t: { teacherId: string }) => t.teacherId === seed.teacher.id)).toBe(true);
  });

  it('student only sees tasks for their class', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${seed.studentA.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((t: { className: string }) => t.className === '10-A')).toBe(true);
  });

  it('returns pagination meta', async () => {
    const res = await request(app)
      .get('/api/v1/tasks?page=1&limit=5')
      .set('Authorization', `Bearer ${seed.teacher.token}`);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 5 });
    expect(typeof res.body.meta.total).toBe('number');
    expect(typeof res.body.meta.totalPages).toBe('number');
  });
});
