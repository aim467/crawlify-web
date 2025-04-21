import axios from 'axios'
import type { DynamicConfig, TestConfigResponse } from '../types/dynamicConfig';

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
  getById: (configId: number) => {
    return request.get<DynamicConfig>(`/dynamic-config/${configId}`);
  },
  save: (data: DynamicConfig) => {
    return request.post<boolean>('/dynamic-config', data);
  },
  update: (data: DynamicConfig) => {
    return request.put<boolean>(`/dynamic-config`, data);
  },
  delete: (configId: number) => {
    return request.delete<boolean>(`/dynamic-config/${configId}`);
  },
  testConfig: (configId: string) => {
    return request.get<TestConfigResponse>('/dynamic-config/test', {
      params: { configId }
    });
  }
};