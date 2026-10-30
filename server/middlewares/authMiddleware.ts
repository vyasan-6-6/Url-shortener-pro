import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

interface JwtPayload {
  id: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User belonging to this token no longer exists.'
        });
      }

      req.user = user;
      return next();
    } catch (error: any) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized: invalid or expired token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized: no token provided'
    });
  }
};
