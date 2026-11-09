import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';
import {
  createTaskHandler,
  listTasksHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from '../controllers/task.controller';
import {
  markCompleteHandler,
  unmarkCompleteHandler,
} from '../controllers/completion.controller';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// List tasks — both roles (scoping handled in service)
router.get('/', listTasksHandler);

// Detail task — both roles
router.get('/:id', getTaskHandler);

// Teacher-only mutations
router.post('/', authorizeRole(Role.TEACHER), createTaskHandler);
router.patch('/:id', authorizeRole(Role.TEACHER), updateTaskHandler);
router.delete('/:id', authorizeRole(Role.TEACHER), deleteTaskHandler);

// Student-only completion endpoints (idempotent)
router.put('/:id/completion', authorizeRole(Role.STUDENT), markCompleteHandler);
router.delete('/:id/completion', authorizeRole(Role.STUDENT), unmarkCompleteHandler);

export default router;
