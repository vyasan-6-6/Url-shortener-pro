import { Response, NextFunction } from 'express';
import { generateAliases, generateAnalyticsInsights } from '../services/aiService';
import Url from '../models/Url';
import Click from '../models/Click';
import asyncHandler from '../utils/asyncHandler';
import { AuthRequest } from '../types';

export const getAiAliases = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction): Promise<any> => {
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

export const getAiInsights = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction): Promise<any> => {
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

  if (!req.user || url.userId.toString() !== req.user._id.toString()) {
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
