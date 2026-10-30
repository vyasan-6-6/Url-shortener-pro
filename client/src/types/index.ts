// Core User Model Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

// Authentication Response Structure
export interface AuthResponseData {
  user: User;
  token: string;
}

// Standard API Response Envelope
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data: T;
}

// Shortened URL Model Interface
export interface UrlItem {
  _id: string;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  clicks: number;
  qrCode?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
  user?: string;
}

// Paginated URL List Response Structure
export interface UrlListResponse {
  urls: UrlItem[];
  totalPages: number;
  currentPage: number;
  totalUrls: number;
}

// Create URL Request Payload
export interface CreateUrlPayload {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: string;
}

// QR Code API Response Data
export interface QrCodeResponseData {
  qrCodeDataUrl: string;
  shortUrl: string;
}

// Click Record for Analytics
export interface ClickItem {
  _id?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
}

// Comprehensive URL Analytics Response Data
export interface UrlStatsResponseData {
  url: UrlItem;
  totalClicks: number;
  clicks: ClickItem[];
  analytics?: {
    devices?: Record<string, number>;
    browsers?: Record<string, number>;
    referrers?: Record<string, number>;
  };
}
