import { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from './error';

export const asyncWrapper = <T extends { [key: string]: any }, ResBody = any, ReqBody = any>(fn: RequestHandler<T>) => {
  const handler: RequestHandler<T, ResBody, ReqBody> = (req, res, next) => {
    try {
      return fn(req, res, next).catch(next);
    } catch (e) {
      next(e);
    }
  };
  return handler;
};

export const logErrors: ErrorRequestHandler = (err: Error, _req, _res, next) => {
  console.error(err.name, err.message, err.stack);
  next(err);
};

export const errorHandler: ErrorRequestHandler = (err: Error, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status || 500);
  } else {
    res.status(500);
  }
  res.send({ error: err.message || 'failed' });
};
