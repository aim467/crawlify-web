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
    return api.get<Website>(`/websiteInfo/${id}`)
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