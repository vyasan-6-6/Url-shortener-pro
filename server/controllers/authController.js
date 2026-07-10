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

  // 1. Validation: check if all required fields are present
  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide all required fields (name, email, password)'
    });
  }

  // 2. Uniqueness: check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists with this email address'
    });
  }

  // 3. Database Insertion: create the user (the pre-save hashing runs here!)
  const user = await User.create({
    name,
    email,
    password
  });

  // 4. Generate Token & Respond
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

  // 1. Validation
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password'
    });
  }

  // 2. Database Lookup: find user and explicitly include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // 3. Verify Password: compare entering password with database hashed password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // 4. Generate Token & Respond
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
