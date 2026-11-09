import { Router } from 'express';
import { registerHandler, loginHandler, getMeHandler } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', authenticate, getMeHandler);

export default router;
