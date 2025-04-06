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
    /**
     * {
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 9,
        "name": "dedsec2z",
        "baseUrl": "https://dedsec2z.top/",
        "domain": "dedsec2z.top",
        "createdAt": "2025-03-31T13:42:28",
        "updatedAt": null
    }
}
     */
    // 获取data里面的数据
    return api.get<Website>(`/websiteInfo/${id}`).then(res => res.data.data);
  },

  create(website: Omit<Website, 'id'>) {
    return api.post<Website>('/websiteInfo', website)
  },

  update(website: Website) {
    return api.put<Website>('/websiteInfo', website)
  },

  delete(id: number) {
    return api.delete(`/websiteInfo/${id}`)
  }
}