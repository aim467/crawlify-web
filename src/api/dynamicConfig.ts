import service from '../utils/request';
import type { DynamicConfig, TestConfigResponse } from '../types/dynamicConfig';

export const dynamicConfigApi = {
  list: (params?: { page?: number; size?: number, websiteId?: number, configName?: string, columnUrl?: string, requestType?: string }) => {
    return service.get<{
      records: DynamicConfig[];
      total: number;
      size: number;
      current: number;
      pages: number;
    }>('/dynamic-config/list', { params });
  },
  getById: (configId: string) => {
    return service.get<DynamicConfig>(`/dynamic-config/${configId}`);
  },
  save: (data: DynamicConfig) => {
    return service.post<boolean>('/dynamic-config', data);
  },
  update: (data: DynamicConfig) => {
    return service.put<boolean>(`/dynamic-config`, data);
  },
  delete: (configId: string) => {
    return service.delete<boolean>(`/dynamic-config/${configId}`);
  },
  testConfig: (configId: string) => {
    return service.get<TestConfigResponse>('/dynamic-config/test', {
      params: { configId }
    });
  }
};