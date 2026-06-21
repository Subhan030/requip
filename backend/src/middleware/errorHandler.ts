import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (err: ApiError, req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.statusCode || 500;
  
  logger.error('Error occurred', { error: err.message, url: req.url, method: req.method });

  res.status(statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
