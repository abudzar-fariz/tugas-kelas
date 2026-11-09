import { NextFunction, Request, Response } from 'express';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../validators/task.validator';
import * as taskService from '../services/task.service';

export async function createTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(input, req.user!.id);
    res.status(201).json({ data: task });
  } catch (err) {
    next(err);
  }
}

export async function listTasksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = taskQuerySchema.parse(req.query);
    const result = await taskService.listTasks(query, req.user!.id, req.user!.role);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.getTaskById(
      req.params['id'] as string,
      req.user!.id,
      req.user!.role,
    );
    res.status(200).json({ data: task });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(req.params['id'] as string, input, req.user!.id);
    res.status(200).json({ data: task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.deleteTask(req.params['id'] as string, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
