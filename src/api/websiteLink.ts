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

  create(link: Omit<WebsiteLink, 'id' | 'createdTime' | 'updatedTime'>) {
    return request.post<WebsiteLink>('/websiteLink', link)
  },

  update(link: Partial<WebsiteLink> & { id: number }) {
    return request.put<WebsiteLink>('/websiteLink', link)
  },

  delete(id: number) {
    return request.delete(`/websiteLink/${id}`)
  }
}