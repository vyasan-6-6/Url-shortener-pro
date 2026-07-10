import express from 'express';
import { 
  createShortUrl, getUserUrls, deleteUrl, 
  updateUrl, getUrlQRCode 
} from '../controllers/urlController.js';
import { urlRules, validate } from '../middlewares/validator.js';
import { limitUrlCreation } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/', limitUrlCreation, urlRules, validate, createShortUrl);
router.get('/', getUserUrls);
router.delete('/:id', deleteUrl);
router.put('/:id', urlRules, validate, updateUrl);
router.get('/:id/qrcode', getUrlQRCode);

export default router;
