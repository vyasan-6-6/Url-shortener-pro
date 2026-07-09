import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply rate limiting middleware to prevent login/registration spamming
router.use(authLimiter);

// Define authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
