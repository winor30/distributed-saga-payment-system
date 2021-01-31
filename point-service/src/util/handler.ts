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

export const pubsubHandlerWrapper = <T extends { [key: string]: any }, ResBody = any, ReqBody = any>(
  fn: RequestHandler<T>
) => {
  const handler: RequestHandler<T, ResBody, { message?: { data?: string } }> = (req, res, next) => {
    if (!req.body) {
      const msg = 'no Pub/Sub message received';
      throw new HttpError(msg, 400);
    }
    if (!req.body.message || !req.body.message.data) {
      const msg = 'invalid Pub/Sub message format';
      throw new HttpError(msg, 400);
    }
    const data = JSON.parse(Buffer.from(req.body.message.data, 'base64').toString().trim()) as ReqBody;
    if (!data) {
      const msg = 'invalid Pub/Sub data format';
      throw new HttpError(msg, 400);
    }
    req.body = data;
    return fn(req, res, next).catch(next);
  };
  return asyncWrapper(handler);
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
