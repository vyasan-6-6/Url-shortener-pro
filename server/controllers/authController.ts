import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import asyncHandler from '../utils/asyncHandler';

export const registerUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide all required fields (name, email, password)'
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists with this email address'
    });
  }

  const user = await User.create({
    name,
    email,
    password
  });

  const token = generateToken(user._id.toString());

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    }
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password'
    });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  const token = generateToken(user._id.toString());

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    }
  });
});
