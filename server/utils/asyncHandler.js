/**
 * Wraps asynchronous Express controller functions to automatically catch errors
 * and forward them to the global error-handling middleware.
 * 
 * @param {Function} fn - The asynchronous controller function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
