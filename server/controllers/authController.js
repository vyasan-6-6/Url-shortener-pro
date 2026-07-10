import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Register a new user
 * @route   POST /auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res, next) => {
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

  const token = generateToken(user._id);

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

/**
 * @desc    Authenticate user & get token
 * @route   POST /auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res, next) => {
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

  const token = generateToken(user._id);

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
