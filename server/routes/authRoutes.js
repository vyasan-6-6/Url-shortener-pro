import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { registerRules, loginRules, validate } from '../middlewares/validator.js';

const router = express.Router();

router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginRules, validate, loginUser);

export default router;
