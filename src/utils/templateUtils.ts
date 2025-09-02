import type { TemplateConfig } from '../types/templateConfig';

// 获取请求类型标签样式
export const getRequestTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    'GET': 'success',
    'POST': 'primary'
  };
  return typeMap[type] || 'default';
};

// 获取结果类型标签样式
export const getResultTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    'json': 'primary',
    'xml': 'success'
  };
  return typeMap[type] || 'default';
};

// 生成基于模板配置的示例代码
export const generateTemplateCode = (template: TemplateConfig): string => {
  return `// 模板配置: ${template.configName}
// 基础URL: ${template.columnUrl}
// 请求类型: ${template.requestType}
// 结果类型: ${template.resultType}

class TemplateProcessor {
  constructor() {
    this.config = {
      name: '${template.configName}',
      baseUrl: '${template.columnUrl}',
      requestType: '${template.requestType}',
      resultType: '${template.resultType}',
      pageStart: ${template.pageStart || 1},
      pageLen: ${template.pageLen || 1},
      nextPage: '${template.nextPage || ''}',
      requestHeaders: ${JSON.stringify(template.requestHead || {}, null, 2)},
      requestBody: '${template.requestBody || ''}',
      resultListRule: '${template.resultListRule || ''}',
      resultClean: '${template.resultClean || ''}'
    };
  }

  // 处理请求数据
  processRequest(requestData) {
    const result = {
      url: this.config.baseUrl,
      method: this.config.requestType,
      headers: this.config.requestHeaders || {}
    };

    // 处理分页
    if (requestData.pageNum && this.config.nextPage) {
      result.url = this.config.nextPage.replace('<pageNum>', requestData.pageNum.toString());
    }

    // 处理请求体
    if (this.config.requestType === 'POST' && this.config.requestBody) {
      let body = this.config.requestBody;
      if (requestData.pageNum) {
        body = body.replace('<pageNum>', requestData.pageNum.toString());
      }
      try {
        result.body = JSON.parse(body);
      } catch (e) {
        result.body = body;
      }
    }

    return result;
  }

  // 处理响应数据
  processResponse(responseData) {
    let result = responseData;

    // 结果清洗
    if (this.config.resultClean) {
      try {
        const regex = new RegExp(this.config.resultClean);
        const match = responseData.match(regex);
        if (match && match[1]) {
          result = match[1];
        }
      } catch (e) {
        console.warn('结果清洗正则表达式无效:', e.message);
      }
    }

    // 根据结果类型处理数据
    if (this.config.resultType === 'json') {
      try {
        result = typeof result === 'string' ? JSON.parse(result) : result;
      } catch (e) {
        console.error('JSON解析失败:', e.message);
        return { error: 'JSON解析失败' };
      }
    }

    // 提取列表数据
    if (this.config.resultListRule && result) {
      try {
        // 简单的JSONPath支持
        if (this.config.resultListRule.startsWith('$.')) {
          const path = this.config.resultListRule.substring(2).split('.');
          let data = result;
          for (const key of path) {
            data = data[key];
            if (!data) break;
          }
          result = data || [];
        }
      } catch (e) {
        console.error('列表提取失败:', e.message);
      }
    }

    // 字段规则处理
    if (Array.isArray(result) && this.config.fieldRules && this.config.fieldRules.length > 0) {
      result = result.map(item => {
        const processedItem = {};
        this.config.fieldRules.forEach(rule => {
          try {
            // 简单的字段提取支持
            if (rule.rule.startsWith('$.')) {
              const path = rule.rule.substring(2).split('.');
              let value = item;
              for (const key of path) {
                value = value[key];
                if (value === undefined) break;
              }
              processedItem[rule.name] = value;
            } else {
              processedItem[rule.name] = item[rule.rule] || null;
            }
          } catch (e) {
            console.error(\`字段 \${rule.name} 提取失败:\`, e.message);
            processedItem[rule.name] = null;
          }
        });
        return processedItem;
      });
    }

    return result;
  }

  // 执行完整的处理流程
  async execute(requestData = {}) {
    try {
      // 1. 准备请求
      const requestConfig = this.processRequest(requestData);
      console.log('请求配置:', requestConfig);

      // 2. 发送请求 (这里需要根据实际情况实现)
      // const response = await fetch(requestConfig.url, {
      //   method: requestConfig.method,
      //   headers: requestConfig.headers,
      //   body: requestConfig.body ? JSON.stringify(requestConfig.body) : undefined
      // });
      // const responseData = await response.text();

      // 3. 模拟响应数据
      const mockResponse = \`{
        "data": {
          "list": [
            {"title": "示例标题1", "url": "http://example.com/1"},
            {"title": "示例标题2", "url": "http://example.com/2"}
          ]
        }
      }\`;

      // 4. 处理响应
      const result = this.processResponse(mockResponse);
      console.log('处理结果:', result);

      return result;
    } catch (error) {
      console.error('执行失败:', error.message);
      return { error: error.message };
    }
  }
}

// 使用示例
const processor = new TemplateProcessor();

// 处理请求
const requestData = { pageNum: 1 };
const request = processor.processRequest(requestData);
console.log('请求配置:', request);

// 执行完整流程
processor.execute({ pageNum: 1 }).then(result => {
  console.log('最终结果:', result);
});`;
};
