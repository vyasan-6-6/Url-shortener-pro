import api from '../api/axios';
import type { 
  ApiResponse, 
  UrlItem, 
  UrlListResponse, 
  CreateUrlPayload, 
  QrCodeResponseData, 
  UrlStatsResponseData 
} from '../types';

/**
 * Service to handle short URL management and analytics API endpoints
 */
export const createUrl = async (urlData: CreateUrlPayload): Promise<ApiResponse<UrlItem>> => {
  const response = await api.post<ApiResponse<UrlItem>>('/urls', urlData);
  return response.data;
};

export const getUrls = async (
  page: number, 
  limit: number, 
  search?: string
): Promise<ApiResponse<UrlListResponse>> => {
  const response = await api.get<ApiResponse<UrlListResponse>>('/urls', {
    params: { page, limit, search }
  });
  return response.data;
};

export const deleteUrl = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/urls/${id}`);
  return response.data;
};

export const updateUrl = async (id: string, originalUrl: string): Promise<ApiResponse<UrlItem>> => {
  const response = await api.put<ApiResponse<UrlItem>>(`/urls/${id}`, { originalUrl });
  return response.data;
};

export const getQrCode = async (id: string): Promise<ApiResponse<QrCodeResponseData>> => {
  const response = await api.get<ApiResponse<QrCodeResponseData>>(`/urls/${id}/qrcode`);
  return response.data;
};

export const getUrlStats = async (code: string): Promise<ApiResponse<UrlStatsResponseData>> => {
  const response = await api.get<ApiResponse<UrlStatsResponseData>>(`/stats/${code}`);
  return response.data;
};
