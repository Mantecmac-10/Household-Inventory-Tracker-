import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Authorization token missing!');
  }

  try {
    const decoded = jwt.verify(token, config.JWT_KEY) as { id: string };

    req.userId = decoded.id;

    next();
  } catch (error) {
    console.log('invalid token', error);
  }
};
