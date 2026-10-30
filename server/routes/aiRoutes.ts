import express from 'express';
import { getAiAliases, getAiInsights } from '../controllers/aiController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/aliases', getAiAliases);
router.post('/insights', getAiInsights);

export default router;

