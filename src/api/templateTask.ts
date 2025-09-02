import service from '../utils/request';
import type { TemplateTask, TemplateTaskQuery, TemplateTaskResponse } from '../types/templateTask';

export const templateTaskApi = {
  // 创建任务
  create: (data: TemplateTask) => {
    return service<boolean>({
      url: '/template/task',
      method: 'POST',
      data
    });
  },

  // 更新任务
  update: (data: TemplateTask) => {
    return service<boolean>({
      url: '/template/task',
      method: 'PUT',
      data
    });
  },

  // 删除任务
  delete: (id: string) => {
    return service<boolean>({
      url: `/template/task/${id}`,
      method: 'DELETE'
    });
  },

  // 根据ID获取任务
  getById: (id: string) => {
    return service<TemplateTask>({
      url: `/template/task/${id}`,
      method: 'GET'
    });
  },

  // 获取任务列表（分页）
  list: (params: TemplateTaskQuery) => {
    return service<TemplateTaskResponse>({
      url: '/template/task/list',
      method: 'POST',
      data: params
    });
  },

  // 启动任务
  start: (taskId: string) => {
    return service<boolean>({
      url: `/template/task/${taskId}/start`,
      method: 'POST'
    });
  },

  // 停止任务
  stop: (taskId: string) => {
    return service<boolean>({
      url: `/template/task/${taskId}/stop`,
      method: 'POST'
    });
  },

  // 重新启动任务
  restart: (taskId: string) => {
    return service<boolean>({
      url: `/template/task/${taskId}/restart`,
      method: 'POST'
    });
  }
};
