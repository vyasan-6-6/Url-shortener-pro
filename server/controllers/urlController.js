import Url from '../models/Url.js';
import { generateShortCode } from '../utils/generateShortCode.js';

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
