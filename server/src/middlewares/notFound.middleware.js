import { NotFoundError } from '../errors/index.js';

export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
};
