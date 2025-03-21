import axios from 'axios'
import type { Task } from '../types/task'

const baseURL = 'http://localhost:4444'

const api = axios.create({
  baseURL,
  timeout: 5000
})

export interface TaskQuery {
  page: number
  size: number
}

export interface TaskResponse {
  total: number
  records: Task[]
}

export const taskApi = {
  list(query: TaskQuery) {
    return api.get<TaskResponse>('/spiderTask/list', { params: query })
  },

  getById(id: number) {
    return api.get<Task>(`/spiderTask/${id}`)
  },

  create(task: Omit<Task, 'id' | 'createdTime' | 'updatedTime'>) {
    return api.post<Task>('/spiderTask', task)
  },

  update(task: Partial<Task> & { id: number }) {
    return api.put<Task>('/spiderTask', task)
  },

  delete(id: number) {
    return api.delete(`/spiderTask/${id}`)
  },

  run(params: { websiteId: number }) {
    return api.post(`/spiderTask/run`, { websiteId: params.websiteId })
  }
}