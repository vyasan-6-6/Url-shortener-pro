/**
 * Validation rules for React Hook Form inputs
 */

export const nameRules = {
  required: 'Name is required',
  minLength: {
    value: 2,
    message: 'Name must be at least 2 characters long'
  }
};

export const emailRules = {
  required: 'Email is required',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address'
  }
};

export const passwordRules = {
  required: 'Password is required',
  minLength: {
    value: 6,
    message: 'Password must be at least 6 characters long'
  }
};
