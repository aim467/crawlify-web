import axios from 'axios'

const baseURL = 'http://localhost:4444'

const api = axios.create({
  baseURL,
  timeout: 5000
})

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
    return api.get<WebsiteLinkResponse>('/websiteLink/list', { params: query })
  },

  getById(id: number) {
    return api.get<WebsiteLink>(`/websiteLink/${id}`)
  },

  create(link: Omit<WebsiteLink, 'id' | 'createdTime' | 'updatedTime'>) {
    return api.post<WebsiteLink>('/websiteLink', link)
  },

  update(link: Partial<WebsiteLink> & { id: number }) {
    return api.put<WebsiteLink>('/websiteLink', link)
  },

  delete(id: number) {
    return api.delete(`/websiteLink/${id}`)
  }
}