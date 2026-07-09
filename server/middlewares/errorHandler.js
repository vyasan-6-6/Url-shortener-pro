/**
 * Express Global Error Handling Middleware
 * Intercepts any uncaught errors passed via next(error) and formats them as JSON
 */
export const errorHandler = (err, req, res, next) => {
  // If the error has a status code, use it. Otherwise, default to 500 (Internal Server Error)
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode || 500;
  
  console.error(`[Server Error] Path: ${req.path} | Message: ${err.message}`);
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
};
