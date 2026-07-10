import Url from '../models/Url.js';
import Click from '../models/Click.js';
import { generateShortCode } from '../utils/generateShortCode.js';
import useragent from 'useragent';
import QRCode from 'qrcode';
import { checkUrlSafety } from '../services/aiService.js';
import asyncHandler from '../utils/asyncHandler.js';

const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

export const createShortUrl = asyncHandler(async (req, res, next) => {
  const { originalUrl, customAlias, expiresAt } = req.body;

  if (!originalUrl) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide the original URL'
    });
  }

  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a valid URL starting with http:// or https://'
    });
  }

  const safetyCheck = await checkUrlSafety(originalUrl);
  if (!safetyCheck.isSafe) {
    return res.status(400).json({
      status: 'error',
      message: `AI Safety Shield: ${safetyCheck.reason}`
    });
  }

  let code = customAlias ? customAlias.trim() : '';

  if (code) {
    const aliasRegex = /^[a-zA-Z0-9-_]+$/;
    if (!aliasRegex.test(code)) {
      return res.status(400).json({
        status: 'error',
        message: 'Custom alias must contain only letters, numbers, dashes, or underscores'
      });
    }

    const aliasTaken = await Url.findOne({ shortCode: code, isDeleted: false });
    if (aliasTaken) {
      return res.status(400).json({
        status: 'error',
        message: 'This custom alias is already taken. Please choose another one.'
      });
    }
  } else {
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      code = generateShortCode();
      const codeExists = await Url.findOne({ shortCode: code, isDeleted: false });
      if (!codeExists) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        status: 'error',
        message: 'Server failed to generate a unique short code. Please try again.'
      });
    }
  }

  let expirationDate = null;
  if (expiresAt) {
    expirationDate = new Date(expiresAt);
    if (isNaN(expirationDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid expiration date format'
      });
    }
    if (expirationDate <= new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Expiration date must be set in the future'
      });
    }
  }

  const url = await Url.create({
    originalUrl,
    shortCode: code,
    userId: req.user._id,
    expiresAt: expirationDate
  });

  res.status(201).json({
    status: 'success',
    data: url
  });
});

export const getUserUrls = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  const query = {
    userId: req.user._id,
    isDeleted: false
  };

  if (search) {
    query.$or = [
      { originalUrl: { $regex: search, $options: 'i' } },
      { shortCode: { $regex: search, $options: 'i' } }
    ];
  }

  const totalCount = await Url.countDocuments(query);
  const urls = await Url.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    results: urls.length,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount
    },
    data: urls
  });
});

export const redirectToOriginal = asyncHandler(async (req, res, next) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode, isDeleted: false });

  if (!url) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/404`);
  }

  if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
    return res.status(410).send(`
      <html>
        <head>
          <title>Link Expired</title>
          <style>
            body { background-color: #0f172a; color: #f8fafc; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background-color: #1e293b; border: 1px solid #334155; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
            h1 { color: #f43f5e; margin-top: 0; }
            p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Link Expired</h1>
            <p>This shortened URL has expired on ${new Date(url.expiresAt).toLocaleString()} and is no longer active.</p>
          </div>
        </body>
      </html>
    `);
  }

  await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });

  const agent = useragent.parse(req.headers['user-agent'] || '');
  const browser = agent.family || 'Unknown';
  const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
  const referrer = req.headers['referer'] || 'Direct';

  Click.create({
    urlId: url._id,
    browser,
    ip,
    referrer
  }).catch((err) => console.error('Click logging error:', err));

  return res.redirect(302, url.originalUrl);
});

export const deleteUrl = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const url = await Url.findById(id);

  if (!url) {
    return res.status(404).json({
      status: 'error',
      message: 'URL mapping not found'
    });
  }

  if (url.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not authorized to delete this URL'
    });
  }

  url.isDeleted = true;
  await url.save();

  res.status(200).json({
    status: 'success',
    message: 'URL deleted successfully'
  });
});

export const updateUrl = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide the new original destination URL'
    });
  }

  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a valid URL starting with http:// or https://'
    });
  }

  const url = await Url.findById(id);

  if (!url || url.isDeleted) {
    return res.status(404).json({
      status: 'error',
      message: 'URL mapping not found'
    });
  }

  if (url.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not authorized to modify this URL'
    });
  }

  url.originalUrl = originalUrl;
  await url.save();

  res.status(200).json({
    status: 'success',
    data: url
  });
});

export const getUrlQRCode = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const url = await Url.findById(id);

  if (!url || url.isDeleted) {
    return res.status(404).json({
      status: 'error',
      message: 'URL mapping not found'
    });
  }

  if (url.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not authorized to access this URL'
    });
  }

  const host = req.get('host');
  const domain = `${req.protocol}://${host}`;
  const shortUrl = `${domain}/${url.shortCode}`;

  const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
    width: 250,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      qrCodeDataUrl,
      shortUrl
    }
  });
});

export const getUrlStats = asyncHandler(async (req, res, next) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode, isDeleted: false });
  if (!url) {
    return res.status(404).json({
      status: 'error',
      message: 'URL mapping not found'
    });
  }

  const recentClicks = await Click.find({ urlId: url._id })
    .sort({ clickedAt: -1 })
    .limit(10);

  const lastAccessed = recentClicks.length > 0 ? recentClicks[0].clickedAt : null;

  const browserStats = await Click.aggregate([
    { $match: { urlId: url._id } },
    { $group: { _id: '$browser', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const referrerStats = await Click.aggregate([
    { $match: { urlId: url._id } },
    { $group: { _id: '$referrer', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      shortCode,
      originalUrl: url.originalUrl,
      clicksCount: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      lastAccessed,
      browsers: browserStats.map(item => ({ browser: item._id || 'Unknown', count: item.count })),
      referrers: referrerStats.map(item => ({ referrer: item._id || 'Direct', count: item.count })),
      recentActivity: recentClicks.map(item => ({
        clickedAt: item.clickedAt,
        browser: item.browser,
        ip: item.ip ? `${item.ip.split('.').slice(0, 2).join('.')}.*.*` : 'Unknown',
        referrer: item.referrer
      }))
    }
  });
});
