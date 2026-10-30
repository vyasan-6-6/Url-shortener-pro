import api from '../api/axios';
import type { ApiResponse } from '../types';

/**
 * Service to handle Google Gemini AI integrations API endpoints
 */
export const getAiAliases = async (originalUrl: string): Promise<ApiResponse<string[]>> => {
  const response = await api.post<ApiResponse<string[]>>('/ai/aliases', { originalUrl });
  return response.data;
};

export const getAiInsights = async (urlId: string): Promise<ApiResponse<string>> => {
  const response = await api.post<ApiResponse<string>>('/ai/insights', { urlId });
  return response.data;
};
