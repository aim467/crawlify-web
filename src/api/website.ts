import axios from 'axios'
import type { Website } from '../types/website'

const baseURL = 'http://localhost:4444'

const api = axios.create({
  baseURL,
  timeout: 5000
})

export interface WebsiteQuery {
  page: number
  size: number
  name?: string
  baseUrl?: string
  domain?: string
}

export interface WebsiteResponse {
  total: number
  records: Website[]
}

export const websiteApi = {
  list(query: WebsiteQuery) {
    return api.get<WebsiteResponse>('/websiteInfo/list', { params: query })
  },

  getById(id: number) {
    // 只能用 res.data.data 拿到数据
    return api.get<{ data: Website }>(`/websiteInfo/${id}`).then(res => res.data.data);
  },

  create(website: Omit<Website, 'id'>) {
    return api.post<Website>('/websiteInfo', website).then(res => res.data);
  },

  update(website: Website) {
    return api.put<Website>('/websiteInfo', website).then(res => res.data);
  },

  delete(id: number) {
    return api.delete(`/websiteInfo/${id}`).then(res => res.data);
  }
}