import service from '../utils/request';
import type { Task } from '../types/task';

export interface TaskQuery {
  page: number
  size: number
  websiteName?: string,
  status?: number,
  startTime?: string,
  endTime?: string
}

export interface SubTask {
  nodeId: string
  taskId: string
  status: number
  websiteId: number
  threadNum: string
  node_url: string
  createdAt: string
  updatedAt: string | null
}

export interface TaskResponse {
  total: number
  records: Task[]
  current: number
  pages: number
  size: number
}

export const taskApi = {
  list(query: TaskQuery) {
    return service.get<TaskResponse>('/spiderTask/list', { params: query })
  },

  getById(id: number) {
    return service.get<Task>(`/spiderTask/${id}`)
  },

  create(task: Omit<Task, 'id' | 'createdTime' | 'updatedTime'>) {
    return service.post<Task>('/spiderTask', task)
  },

  update(task: Partial<Task> & { id: number }) {
    return service.put<Task>('/spiderTask', task)
  },

  delete(id: number) {
    return service.delete(`/spiderTask/${id}`)
  },

  run(params: { websiteId: number, threadNum?: number }) {
    return service.post(`/spiderTask/run`, {
      websiteId: params.websiteId,
      threadNum: params.threadNum || 5 // 默认线程数为5
    })
  },

  stop(taskId: number) {
    return service.get(`/spiderTask/stop`, { params: { taskId } })
  },

  getSubTasks(taskId: string) {
    return service.get<SubTask[]>(`/taskNode/list?taskId=${taskId}`)
  }
}