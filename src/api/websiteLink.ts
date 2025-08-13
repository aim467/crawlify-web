import request from '../utils/request';

export interface WebsiteLink {
  id: number
  url: string
  createdAt: string
  updatedAt: string
  websiteId: number
  extLink: boolean
  urlType: number
}

export interface WebsiteLinkQuery {
  page: number
  size: number
  websiteId: number
  url?: string
  urlType?: number
  extLink?: boolean
  startTime?: string
  endTime?: string
}

export interface WebsiteLinkResponse {
  total: number
  records: WebsiteLink[]
}

export const websiteLinkApi = {
  list(query: WebsiteLinkQuery) {
    return request.get<WebsiteLinkResponse>('/websiteLink/list', { params: query })
  },

  getById(id: number) {
    return request.get<WebsiteLink>(`/websiteLink/${id}`)
  },

  delete(id: number) {
    return request.delete(`/websiteLink/${id}`)
  },

  clear(websiteId: number) {
    return request.delete(`/websiteLink/clear/${websiteId}`)
  },

  export(query: Omit<WebsiteLinkQuery, 'page' | 'size'>) {
    return request.post('/websiteLink/export', query, {
      responseType: 'blob'
    })
  }
}