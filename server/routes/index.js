import express from 'express';
import authRoutes from './authRoutes.js';
import urlRoutes from './urlRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/urls', urlRoutes);
router.use('/ai', aiRoutes);

export default router;
