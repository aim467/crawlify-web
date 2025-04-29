import request from '../utils/request';
import type { Website } from '../types/website';

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
    return request.get<WebsiteResponse>('/websiteInfo/list', { params: query })
  },

  getById(id: number) {
    // 假设 request 返回的数据结构与 axios 一致，如果 request 做了处理，这里可能需要调整
    return request.get<{ data: Website }>(`/websiteInfo/${id}`).then(res => res.data); // 注意：如果 request 拦截器处理了 data 嵌套，这里可能需要改为 res => res
  },

  create(website: Omit<Website, 'id'>) {
    return request.post<Website>('/websiteInfo', website); // 假设 request 返回处理后的 data
  },

  update(website: Website) {
    return request.put<Website>('/websiteInfo', website); // 假设 request 返回处理后的 data
  },

  delete(id: number) {
    return request.delete(`/websiteInfo/${id}`); // 假设 request 返回处理后的 data
  }
}