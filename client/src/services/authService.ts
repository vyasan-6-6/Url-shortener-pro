import api from '../api/axios';
import type { ApiResponse, AuthResponseData } from '../types';

/**
 * Service to handle authentication API endpoints
 */
export const login = async (email: string, password: string): Promise<ApiResponse<AuthResponseData>> => {
  const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', { email, password });
  return response.data;
};

export const register = async (
  name: string, 
  email: string, 
  password: string
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await api.post<ApiResponse<AuthResponseData>>('/auth/register', { name, email, password });
  return response.data;
};
