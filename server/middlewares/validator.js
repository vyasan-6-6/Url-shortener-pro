import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: errors.array()[0].msg
    });
  }
  next();
};

export const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const urlRules = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('Destination URL is required')
    .isURL()
    .withMessage('Please provide a valid URL pattern (e.g. http://example.com)'),
  body('customAlias')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Custom alias must contain only letters, numbers, dashes, or underscores')
    .isLength({ min: 3, max: 30 })
    .withMessage('Custom alias must be between 3 and 30 characters long'),
  body('expiresAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date format')
];
