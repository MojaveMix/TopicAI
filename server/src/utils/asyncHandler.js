/**
 * Wraps an async route handler or middleware to catch any rejected promises and forward to next()
 * @param {Function} fn - Async express handler
 * @returns {Function} Express middleware handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
