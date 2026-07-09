import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token containing the user's ID
 * @param {string} userId - The database ID of the user
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export default generateToken;
