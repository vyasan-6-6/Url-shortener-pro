import { generateAliases, generateAnalyticsInsights } from '../services/aiService.js';
import Url from '../models/Url.js';
import Click from '../models/Click.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAiAliases = asyncHandler(async (req, res, next) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide the original URL to generate aliases'
    });
  }

  const aliases = await generateAliases(originalUrl);

  res.status(200).json({
    status: 'success',
    data: aliases
  });
});

export const getAiInsights = asyncHandler(async (req, res, next) => {
  const { urlId } = req.body;

  if (!urlId) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a urlId to fetch insights'
    });
  }

  const url = await Url.findById(urlId);
  if (!url || url.isDeleted) {
    return res.status(404).json({
      status: 'error',
      message: 'URL mapping not found'
    });
  }

  if (url.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not authorized to view insights for this URL'
    });
  }

  const clicks = await Click.find({ urlId: url._id }).sort({ clickedAt: -1 });

  const insights = await generateAnalyticsInsights(url, clicks);

  res.status(200).json({
    status: 'success',
    data: insights
  });
});
