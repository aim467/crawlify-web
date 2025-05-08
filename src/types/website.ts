export interface Website {
  id: number
  name: string
  baseUrl: string
  domain: string
  charset?: string
  headers?: string
  cookies?: string
  timeOut?: number
  retryTimes?: number
  cycleRetryTimes?: number
}