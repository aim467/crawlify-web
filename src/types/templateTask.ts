export interface TemplateTask {
  taskId?: string;
  configId: string;
  configName?: string; // 显示用，关联配置名称
  createdAt?: string;
  updatedAt?: string;
  pid?: number;
  status: '1' | '2' | '3' | '4'; // 1-运行中, 2-停止, 3-运行完成, 4-运行失败
}

export interface TemplateTaskQuery {
  page: number;
  size: number;
  taskId?: string;
  configId?: string;
  status?: string;
}

export interface TemplateTaskResponse {
  records: TemplateTask[];
  total: number;
  size: number;
  current: number;
}

// 任务状态枚举
export const TASK_STATUS = {
  RUNNING: '1',
  STOPPED: '2',
  COMPLETED: '3',
  FAILED: '4'
} as const;

// 任务状态标签映射
export const TASK_STATUS_MAP = {
  '1': { label: '运行中', type: 'warning' },
  '2': { label: '已停止', type: 'info' },
  '3': { label: '运行完成', type: 'success' },
  '4': { label: '运行失败', type: 'danger' }
} as const;

// 任务状态选项
export const TASK_STATUS_OPTIONS = [
  { label: '运行中', value: '1' },
  { label: '已停止', value: '2' },
  { label: '运行完成', value: '3' },
  { label: '运行失败', value: '4' }
];
