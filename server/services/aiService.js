import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client (graceful fallback if API key is not set)
let genAI = null;
let model = null;

const initAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      console.log('Google Gemini AI Service Initialized successfully');
    } catch (err) {
      console.error('Failed to initialize Google Gemini AI:', err.message);
    }
  } else {
    console.log('Gemini API Key is not set or placeholder. Running AI services in mock fallback mode.');
  }
};

/**
 * AI check to determine if a URL is malicious, suspicious, or contains safety threats
 * @param {string} url - The original destination URL to check
 * @returns {Promise<{isSafe: boolean, reason: string}>} Safety status object
 */
export const checkUrlSafety = async (url) => {
  if (!genAI || !model) {
    // Mock Safety Verification Fallback (Always returns safe unless it contains a dummy malicious keyword)
    const isMockMalicious = url.includes('malicious') || url.includes('phishing') || url.includes('hack-site');
    return {
      isSafe: !isMockMalicious,
      reason: isMockMalicious 
        ? '[MOCK SAFETY SHIELD] Detected keyword patterns matching known phishing/malware domains.' 
        : 'Safe URL'
    };
  }

  try {
    initAI(); // Ensure initialized (useful if env loads dynamically)
    if (!model) throw new Error('Model not initialized');

    const prompt = `Analyze this destination URL: "${url}". 
Determine if it is a safe link, or a malicious/suspicious link (e.g. phishing, spam, malware, spyware, scams).
You must return your response in raw JSON format, conforming strictly to this structure:
{
  "isSafe": true or false,
  "reason": "a brief explanation of your decision"
}
Do not return any markdown formatting, backticks, or extra commentary. Just return raw JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean potential markdown codeblock formatting if Gemini ignores instructions
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const data = JSON.parse(cleanJson);
    return {
      isSafe: typeof data.isSafe === 'boolean' ? data.isSafe : true,
      reason: data.reason || 'Safe URL'
    };
  } catch (error) {
    console.error('Gemini URL Safety Check Error:', error.message);
    // Graceful fallback: permit URL if AI is temporarily unreachable
    return { isSafe: true, reason: 'AI Safety verification bypassed due to query error.' };
  }
};

/**
 * AI generation of 3 catchy and relevant short aliases based on a long URL
 * @param {string} url - The long URL to generate aliases for
 * @returns {Promise<string[]>} List of 3 suggested aliases
 */
export const generateAliases = async (url) => {
  if (!genAI || !model) {
    // Mock Alias Generation Fallback
    try {
      const hostname = new URL(url).hostname.replace('www.', '').split('.')[0];
      return [`${hostname}-link`, `${hostname}-go`, `visit-${hostname}`];
    } catch (_) {
      return ['custom-link', 'go-link', 'my-shortcut'];
    }
  }

  try {
    const prompt = `Given this long URL: "${url}", suggest 3 short, catchy, alphanumeric and URL-friendly custom aliases for a URL shortener.
The suggested aliases must contain only letters, numbers, and dashes.
You must return your response in raw JSON format, conforming strictly to this structure:
["alias-one", "alias-two", "alias-three"]
Do not return any markdown formatting, backticks, or extra commentary. Just return raw JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini Alias Generation Error:', error.message);
    return ['quick-url', 'go-shortcut', 'short-link'];
  }
};

/**
 * AI generation of summaries and traffic analytics recommendations
 * @param {object} url - The URL database object details
 * @param {object[]} clicks - The list of visitor click documents
 * @returns {Promise<string>} Natural language analytical insights
 */
export const generateAnalyticsInsights = async (url, clicks) => {
  if (!genAI || !model) {
    // Mock Insights Fallback
    return `[MOCK AI INSIGHTS] Your link "/${url.shortCode}" directing to "${new URL(url.originalUrl).hostname}" has recorded ${url.clicks} total clicks. Most traffic appears to originate from direct channels. We recommend sharing the short link across social platforms like LinkedIn and Twitter during high-engagement hours (9 AM - 11 AM) to track browser variations.`;
  }

  try {
    const clickSummary = clicks.map(c => ({
      browser: c.browser,
      referrer: c.referrer,
      clickedAt: c.clickedAt
    }));

    const prompt = `You are a professional marketing and web traffic analyst.
We have a short URL with code "/${url.shortCode}" that redirects to "${url.originalUrl}".
It was created on ${url.createdAt} and has received ${url.clicks} total clicks.
Here is the raw visitor click history logs: ${JSON.stringify(clickSummary.slice(0, 50))}

Write a highly professional, engaging, and actionable traffic report. 
Summarize who the audience is, which browsers/referrers dominate, any traffic patterns over time, and a specific recommendation on how to maximize future engagement.
Your response must be written in a single natural paragraph (maximum 4 sentences). Do not use bullet points or lists.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini Analytics Insights Error:', error.message);
    return 'Unable to generate AI analytical insights at this time. Please ensure click logs are populated and try again.';
  }
};

// Trigger initial configuration check on startup
initAI();
