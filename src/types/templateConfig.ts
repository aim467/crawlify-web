// 字段规则接口
export interface FieldRule {
  name: string;        // 字段名
  rule: string;        // 提取规则
  desc: string;        // 字段描述
}

// 模板配置接口
export interface TemplateConfig {
  configId?: string;                              // 配置标识，用于唯一追踪某个爬虫配置
  configName: string;                             // 列名，通常用于标识数据列或分类
  columnUrl: string;                              // 基础 URL，第一页或无分页时的请求地址（必填）
  requestType: string;                            // 请求类型，支持 GET 或 POST（必填）
  requestBody?: string;                           // POST 请求时的请求体模板，可包含占位符 <pageNum>（可选）
  pageStart: number;                              // 起始页码，通常是 0 或 1（必填）
  pageLen: number;                                // 最大页码或总页数，用于控制分页循环条件（必填）
  nextPage?: string;                              // 下一页 URL 模板，包含占位符 <pageNum>，主要用于 GET 请求（可选）
  requestHead?: Record<string, any>;              // 请求头信息，JSON 格式对象（可选）
  resultType: string;                             // 结果类型 json/xml
  resultClean?: string;                           // 结果清洗正则表达式
  resultListRule?: string;                        // 列表获取表达式
  parentLink?: string;                            // 父页面链接
  fieldRules?: FieldRule[];                       // 字段规则数组
  createdAt?: string;                             // 创建时间
  updatedAt?: string;                             // 更新时间
  useScript?: number;                               // 是否使用脚本
}

// 分页查询参数接口
export interface TemplateConfigSearchParams {
  page?: number;
  size?: number;
  configName?: string;
}

// 分页查询响应接口
export interface TemplateConfigPageResponse {
  records: TemplateConfig[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 请求类型常量
export const REQUEST_TYPES = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' }
] as const;

// 结果类型常量
export const RESULT_TYPES = [
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' }
] as const;

// 占位符常量
export const PAGE_NUM_PLACEHOLDER = '<pageNum>';