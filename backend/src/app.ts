import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json());

// Routes will be mounted here in subsequent commits
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
