import express from 'express';
import {
  createShortUrl,
  getUserUrls,
  deleteUrl,
  updateUrl,
  getUrlQRCode
} from '../controllers/urlController';
import { urlRules, validate } from '../middlewares/validator';
import { limitUrlCreation } from '../middlewares/rateLimiter';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', limitUrlCreation, urlRules, validate, createShortUrl);
router.get('/', getUserUrls);
router.delete('/:id', deleteUrl);
router.put('/:id', urlRules, validate, updateUrl);
router.get('/:id/qrcode', getUrlQRCode);

export default router;

