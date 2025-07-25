import type { FormRules } from 'element-plus';
import { TestType } from '../components/types';

// 表单验证规则
export const CONFIG_FORM_RULES: FormRules = {
  configName: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  columnUrl: [
    { required: true, message: '请输入基础URL', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入有效的URL', trigger: 'blur' }
  ],
  requestType: [
    { required: true, message: '请选择请求类型', trigger: 'change' },
  ],
  pageStart: [
    { required: true, message: '请输入起始页码', trigger: 'blur' },
    { type: 'number', message: '页码必须为数字', trigger: 'blur' }
  ],
  pageLen: [
    { required: true, message: '请输入最大页数', trigger: 'blur' },
    { type: 'number', message: '页数必须为数字', trigger: 'blur' }
  ],
  resultType: [
    { required: true, message: '请选择结果类型', trigger: 'change' },
  ],
  resultListRule: [
    { required: true, message: '请输入列表获取表达式', trigger: 'blur' },
  ],
  detailUrlRule: [
    { required: true, message: '请输入详情页链接规则', trigger: 'blur' },
  ]
};

// 测试示例数据
export const TEST_EXAMPLES = {
  [TestType.JSON]: {
    inputData: JSON.stringify({
      "store": {
        "book": [
          {
            "category": "reference",
            "author": "Nigel Rees",
            "title": "Sayings of the Century",
            "price": 8.95
          },
          {
            "category": "fiction",
            "author": "Evelyn Waugh",
            "title": "Sword of Honour",
            "price": 12.99
          }
        ],
        "bicycle": {
          "color": "red",
          "price": 19.95
        }
      }
    }, null, 2),
    expressionData: '$.store.book[0].title'
  },
  [TestType.XML]: {
    inputData: `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="reference">
    <title>XML开发指南</title>
    <author>张三</author>
    <year>2020</year>
    <price>29.99</price>
  </book>
  <book category="fiction">
    <title>小说集</title>
    <author>李四</author>
    <year>2021</year>
    <price>39.95</price>
  </book>
</bookstore>`,
    expressionData: '//book[1]/title'
  },
  [TestType.REGEX]: {
    inputData: 'test@example.com\ncontact@domain.com\ninvalid.email\nsupport@company.net',
    expressionData: '\\b\\w+@\\w+\\.\\w+\\b'
  }
}; 