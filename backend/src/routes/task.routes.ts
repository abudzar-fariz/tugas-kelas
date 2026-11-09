import { Router } from 'express';
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
router.post('/', authorizeRole('TEACHER'), createTaskHandler);
router.patch('/:id', authorizeRole('TEACHER'), updateTaskHandler);
router.delete('/:id', authorizeRole('TEACHER'), deleteTaskHandler);

// Student-only completion endpoints (idempotent)
router.put('/:id/completion', authorizeRole('STUDENT'), markCompleteHandler);
router.delete('/:id/completion', authorizeRole('STUDENT'), unmarkCompleteHandler);

export default router;
