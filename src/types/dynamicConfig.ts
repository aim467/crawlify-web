export interface DynamicConfig {
  websiteId: number;
  configId: string;
  configName: string;
  columnUrl: string;
  requestType: string;
  requestBody?: string;
  pageStart: number;
  pageLen: number;
  nextPage?: string;
  requestHead?: string;
  resultType: string;
  resultClean?: string;
  resultListRule: string;
  detailUrlRule: string;
  createdAt?: string;
  updatedAt?: string;
}