import rateLimit from 'express-rate-limit';

const urlCreationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    status: 'error',
    message: 'Too many links created from this IP. Please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const limitUrlCreation = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Rate Limiter] Bypassed URL creation check in development environment');
    return next();
  }
  return urlCreationLimiter(req, res, next);
};
