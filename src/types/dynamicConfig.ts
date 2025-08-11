export interface DynamicConfig {
  id?: number;
  websiteId: number;
  configId: string;
  configName: string;
  columnUrl: string;
  requestType: string;
  requestBody?: string;
  pageStart: number;
  pageLen: number;
  nextPage?: string;
  requestHead?: Record<string, string>;
  resultType: string;
  resultClean?: string;
  resultListRule: string;
  detailUrlRule: string;
  createdAt?: string;
  updatedAt?: string;
  parentLink?: string;
  requestHeadStr: string;
}

export interface TestConfigResponse {
  data: string[];
}