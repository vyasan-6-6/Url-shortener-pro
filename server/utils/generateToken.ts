import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token containing the user's ID
 * @param {string} userId - The database ID of the user
 * @returns {string} Signed JWT token
 */
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }
  return jwt.sign(
    { id: userId }, 
    secret, 
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );
};

export default generateToken;
