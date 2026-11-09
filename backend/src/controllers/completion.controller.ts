import { NextFunction, Request, Response } from 'express';
import * as completionService from '../services/completion.service';

export async function markCompleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const completion = await completionService.markComplete(
      req.params['id'] as string,
      req.user!.id,
      req.user!.className!,
    );
    res.status(200).json({ data: completion });
  } catch (err) {
    next(err);
  }
}

export async function unmarkCompleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await completionService.unmarkComplete(
      req.params['id'] as string,
      req.user!.id,
      req.user!.className!,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
