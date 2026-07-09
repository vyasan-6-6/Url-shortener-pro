import Url from '../models/Url.js';
import Click from '../models/Click.js';
import { generateShortCode } from '../utils/generateShortCode.js';
import useragent from 'useragent';
import QRCode from 'qrcode';

/**
 * Helper to validate URL structure
 */
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * @desc    Create a short URL
 * @route   POST /urls
 * @access  Private (Requires Authentication)
 */
export const createShortUrl = async (req, res, next) => {
  const { originalUrl, customAlias, expiresAt } = req.body;

  try {
    // 1. Validate Original URL
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

    let code = customAlias ? customAlias.trim() : '';

    // 2. Validate Custom Alias (if provided)
    if (code) {
      // Allow only alphanumeric characters, dashes, and underscores
      const aliasRegex = /^[a-zA-Z0-9-_]+$/;
      if (!aliasRegex.test(code)) {
        return res.status(400).json({
          status: 'error',
          message: 'Custom alias must contain only letters, numbers, dashes, or underscores'
        });
      }

      // Check if alias is already taken
      const aliasTaken = await Url.findOne({ shortCode: code, isDeleted: false });
      if (aliasTaken) {
        return res.status(400).json({
          status: 'error',
          message: 'This custom alias is already taken. Please choose another one.'
        });
      }
    } else {
      // 3. Generate random code if no custom alias is provided (ensure uniqueness)
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

    // 4. Validate Expiration Date (if provided)
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

    // 5. Create URL document in database
    const url = await Url.create({
      originalUrl,
      shortCode: code,
      userId: req.user._id, // Set the owner from the JWT middleware
      expiresAt: expirationDate
    });

    res.status(201).json({
      status: 'success',
      data: url
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all URLs created by the authenticated user
 * @route   GET /urls
 * @access  Private (Requires Authentication)
 */
export const getUserUrls = async (req, res, next) => {
  try {
    // 1. Extract query parameters for Search and Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // 2. Build search query object
    const query = {
      userId: req.user._id,
      isDeleted: false
    };

    // If search term exists, search in originalUrl or shortCode
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Query Database for count and data
    const totalCount = await Url.countDocuments(query);
    const urls = await Url.find(query)
      .sort({ createdAt: -1 }) // Show newly created links first
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
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Redirect short URL to original destination & log click analytics
 * @route   GET /:shortCode
 * @access  Public
 */
export const redirectToOriginal = async (req, res, next) => {
  const { shortCode } = req.params;

  try {
    // 1. Database Lookup: find the URL that is not deleted
    const url = await Url.findOne({ shortCode, isDeleted: false });

    // 2. Fallback: if URL does not exist
    if (!url) {
      // Redirect to the client-side 404 page
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/404`);
    }

    // 3. Conditional Check: check if URL has expired
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

    // 4. Atomic Update: Increment clicks in database using MongoDB $inc operator
    await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });

    // 5. Gather analytical details from request headers
    const agent = useragent.parse(req.headers['user-agent'] || '');
    const browser = agent.family || 'Unknown';
    const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
    const referrer = req.headers['referer'] || 'Direct';

    // 6. Asynchronously save click analytics to database (non-blocking)
    Click.create({
      urlId: url._id,
      browser,
      ip,
      referrer
    }).catch((err) => console.error('Click logging error:', err));

    // 7. HTTP Redirect: 302 Temporary Redirect to the original URL
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a URL (Soft Delete)
 * @route   DELETE /urls/:id
 * @access  Private (Requires Authentication)
 */
export const deleteUrl = async (req, res, next) => {
  const { id } = req.params;

  try {
    const url = await Url.findById(id);

    if (!url) {
      return res.status(404).json({
        status: 'error',
        message: 'URL mapping not found'
      });
    }

    // Authorization: Check ownership
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to delete this URL'
      });
    }

    // Soft delete: set isDeleted to true
    url.isDeleted = true;
    await url.save();

    res.status(200).json({
      status: 'success',
      message: 'URL deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update destination URL
 * @route   PUT /urls/:id
 * @access  Private (Requires Authentication)
 */
export const updateUrl = async (req, res, next) => {
  const { id } = req.params;
  const { originalUrl } = req.body;

  try {
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

    // Authorization: Check ownership
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to modify this URL'
      });
    }

    // Update fields
    url.originalUrl = originalUrl;
    await url.save();

    res.status(200).json({
      status: 'success',
      data: url
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate QR Code for a short URL
 * @route   GET /urls/:id/qrcode
 * @access  Private (Requires Authentication)
 */
export const getUrlQRCode = async (req, res, next) => {
  const { id } = req.params;

  try {
    const url = await Url.findById(id);

    if (!url || url.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'URL mapping not found'
      });
    }

    // Authorization: Check ownership
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access this URL'
      });
    }

    // Construct the short URL based on host domain
    const host = req.get('host');
    const domain = `${req.protocol}://${host}`;
    const shortUrl = `${domain}/${url.shortCode}`;

    // Generate QR Code data URL (Base64 PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
      width: 250,
      margin: 2,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff' // white
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        qrCodeDataUrl,
        shortUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get analytics statistics for a short URL
 * @route   GET /stats/:shortCode
 * @access  Public
 */
export const getUrlStats = async (req, res, next) => {
  const { shortCode } = req.params;

  try {
    // 1. Find URL in database
    const url = await Url.findOne({ shortCode, isDeleted: false });
    if (!url) {
      return res.status(404).json({
        status: 'error',
        message: 'URL mapping not found'
      });
    }

    // 2. Fetch the most recent clicks to determine lastAccessed timestamp and get recent log details
    const recentClicks = await Click.find({ urlId: url._id })
      .sort({ clickedAt: -1 })
      .limit(10);

    const lastAccessed = recentClicks.length > 0 ? recentClicks[0].clickedAt : null;

    // 3. Aggregate Click statistics by Browser
    const browserStats = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Aggregate Click statistics by Referrer
    const referrerStats = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 5. Structure stats output payload
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
          ip: item.ip ? `${item.ip.split('.').slice(0, 2).join('.')}.*.*` : 'Unknown', // Anonymize IP for compliance
          referrer: item.referrer
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
