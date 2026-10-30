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

// Pagination Meta Info
export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// Paginated URL List Response Structure
export interface UrlListResponse {
  status: 'success' | 'error' | 'fail';
  results: number;
  pagination: PaginationInfo;
  data: UrlItem[];
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

// Analytics Breakdown Sub-types
export interface BrowserStat {
  browser: string;
  count: number;
}

export interface ReferrerStat {
  referrer: string;
  count: number;
}

export interface RecentActivityItem {
  clickedAt: string;
  browser: string;
  ip: string;
  referrer: string;
}

// Comprehensive URL Analytics Response Data
export interface UrlStatsResponseData {
  shortCode: string;
  originalUrl: string;
  clicksCount: number;
  createdAt: string;
  expiresAt?: string;
  lastAccessed: string | null;
  browsers: BrowserStat[];
  referrers: ReferrerStat[];
  recentActivity: RecentActivityItem[];
}
