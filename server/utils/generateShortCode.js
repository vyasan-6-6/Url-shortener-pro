import { customAlphabet } from 'nanoid';

// Alphanumeric alphabet: lowercase letters, uppercase letters, and numbers
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Define the short code length (e.g., 6 characters)
const CODE_LENGTH = 6;

/**
 * Generate a unique alphanumeric short code
 * @returns {string} Random 6-character string
 */
export const generateShortCode = () => {
  const nanoid = customAlphabet(ALPHABET, CODE_LENGTH);
  return nanoid();
};
