import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes from unauthorized access
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extract token from Header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Get user from database by ID and attach it to the request object (req.user)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User belonging to this token no longer exists'
        });
      }

      // 5. Allow request to proceed to the next handler
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized: token is invalid or expired'
      });
    }
  }

  // 6. Return error if no token was found in the header
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized: no token provided'
    });
  }
};
