import axios from 'axios'
import type { DynamicConfig } from '../types/dynamicConfig';

const baseURL = 'http://localhost:4444'

const request = axios.create({
  baseURL,
  timeout: 5000
})



export const dynamicConfigApi = {
  list: (params?: { page?: number; size?: number, websiteId?: number, configName?: string, columnUrl?: string, requestType?: string }) => {
    return request.get<{
      code: number;
      msg: string;
      data: {
        records: DynamicConfig[];
        total: number;
        size: number;
        current: number;
        pages: number;
      };
    }>('/dynamic-config/list', { params });
  },
  getById: (id: number) => {
    return request.get<DynamicConfig>(`/dynamic-config/${id}`);
  },
  save: (data: DynamicConfig) => {
    return request.post<boolean>('/dynamic-config', data);
  },
  update: (id: number, data: DynamicConfig) => {
    return request.put<boolean>(`/dynamic-config/${id}`, data);
  },
  delete: (id: number) => {
    return request.delete<boolean>(`/dynamic-config/${id}`);
  }
};