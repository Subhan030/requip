import axios from 'axios';
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ApiResponse,
  PaginatedApiResponse,
  UserStats,
  GetUsersParams,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const userApi = {
  getAll: async (params: GetUsersParams = {}): Promise<PaginatedApiResponse<User>> => {
    const { data } = await api.get<PaginatedApiResponse<User>>('/users', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data;
  },

  create: async (payload: CreateUserPayload): Promise<ApiResponse<User>> => {
    const { data } = await api.post<ApiResponse<User>>('/users', payload);
    return data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> => {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return data;
  },

  restore: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await api.post<ApiResponse<User>>(`/users/${id}/restore`);
    return data;
  },

  getStats: async (): Promise<ApiResponse<UserStats>> => {
    const { data } = await api.get<ApiResponse<UserStats>>('/users/stats');
    return data;
  },
};
