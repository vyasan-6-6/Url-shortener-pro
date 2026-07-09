import rateLimit from 'express-rate-limit';

/**
 * Limit link creations to 100 requests per 24 hours per IP address to prevent database abuse
 */
export const urlCreationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 100, // Limit each IP to 100 requests per 24 hours
  message: {
    status: 'error',
    message: 'Too many links created from this IP. Please try again tomorrow. (Limit: 100 links/day)'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the legacy `X-RateLimit-*` headers
});

/**
 * Limit registration and login attempts to 15 requests per 15 minutes per IP address to block brute force scripts
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 15, // Limit each IP to 15 auth attempts per 15 minutes
  message: {
    status: 'error',
    message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
