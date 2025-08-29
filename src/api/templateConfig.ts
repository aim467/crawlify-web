import service from '../utils/request';
import type { 
  TemplateConfig, 
  TemplateConfigSearchParams, 
  TemplateConfigPageResponse 
} from '../types/templateConfig';

export const templateConfigApi = {
  // 分页查询模板配置
  list: (params: TemplateConfigSearchParams) => {
    return service.post<TemplateConfigPageResponse>('/template/config/list', params);
  },

  // 根据configId查询模板配置
  getById: (configId: string) => {
    return service.get<TemplateConfig>(`/template/config/${configId}`);
  },

  // 新增模板配置
  create: (data: Omit<TemplateConfig, 'configId' | 'createdAt' | 'updatedAt'>) => {
    return service.post<boolean>('/template/config', data);
  },

  // 更新模板配置
  update: (data: TemplateConfig) => {
    return service.put<boolean>('/template/config', data);
  },

  // 删除模板配置
  delete: (configId: string) => {
    return service.delete<boolean>(`/templateconfig/${configId}`);
  }
};