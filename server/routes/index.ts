import express from 'express';
import authRoutes from './authRoutes';
import urlRoutes from './urlRoutes';
import aiRoutes from './aiRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/urls', urlRoutes);
router.use('/ai', aiRoutes);

export default router;

