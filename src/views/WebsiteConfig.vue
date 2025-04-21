<template>
  <div class="website-config-container">
    <!-- Filter/Search Form -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto">
        <el-form-item label="配置ID:" prop="configId">
          <el-input v-model="searchForm.configId" placeholder="请输入配置ID" clearable />
        </el-form-item>
        <el-form-item label="配置名称:" prop="configName">
          <el-input v-model="searchForm.configName" placeholder="请输入配置名称" clearable />
        </el-form-item>
        <el-form-item label="基础URL:" prop="columnUrl">
          <el-input v-model="searchForm.columnUrl" placeholder="请输入基础URL" clearable />
        </el-form-item>
        <el-form-item label="请求类型:" prop="requestType">
          <el-select v-model="searchForm.requestType" placeholder="请选择请求类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Section -->
    <el-card shadow="never" class="table-card">
      <!-- Table Actions Header -->
      <div class="table-header">
        <div class="table-title">
          动态配置列表
        </div>
        <div class="table-actions">
          <el-button type="primary" :icon="Plus" @click="handleAddConfig">新增配置</el-button>
          <el-button type="success" @click="handleJsonPathTest">JSONPath测试</el-button>
          <el-button type="warning" @click="handleXmlTest">XML测试</el-button>
          <el-button type="info" @click="handleRegexTest">正则表达式测试</el-button>
          <el-button :icon="Refresh" circle @click="handleTableRefresh" />
          <el-button :icon="Setting" circle @click="handleTableSettings" />
        </div>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border height="calc(100vh - 280px)">
        <el-table-column prop="configId" label="配置ID" width="120" align="center" fixed />
        <el-table-column prop="configName" label="配置名称" min-width="150" fixed />
        <el-table-column prop="columnUrl" label="基础URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="requestType" label="请求类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.requestType === 'GET' ? 'success' : 'warning'">
              {{ row.requestType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requestBody" label="请求体" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip :content="row.requestBody" placement="top" :hide-after="2000">
              <span>{{ row.requestBody }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="pageStart" label="起始页码" width="100" align="center" />
        <el-table-column prop="pageLen" label="最大页数" width="100" align="center" />
        <el-table-column prop="nextPage" label="下一页URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="requestHead" label="请求头" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip :content="row.requestHead" placement="top" :hide-after="2000">
              <span>{{ row.requestHead }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="resultType" label="结果类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.resultType === 'json' ? 'primary' : 'info'">
              {{ row.resultType.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resultListRule" label="列表规则" min-width="180" show-overflow-tooltip />
        <el-table-column prop="resultClean" label="结果清洗" min-width="180" show-overflow-tooltip />
        <el-table-column prop="detailUrlRule" label="详情链接" min-width="180" show-overflow-tooltip />
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" :icon="Edit" @click="handleEdit(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row)" />
            </el-tooltip>
            <el-tooltip content="应用" placement="top">
              <el-button link type="success" :icon="Check" @click="handleApply(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- JSONPath测试弹窗 -->
    <el-dialog v-model="jsonPathDialogVisible" title="JSONPath测试工具" width="1000px">
      <div class="jsonpath-container">
        <div class="jsonpath-inputs">
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">JSON数据:</div>
            <el-input v-model="jsonPathForm.jsonData" type="textarea" :rows="10" placeholder="请输入JSON数据"
              class="jsonpath-textarea" />
          </div>
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">JSONPath表达式:</div>
            <el-input v-model="jsonPathForm.jsonPath" placeholder="例如: $.store.book[0].title"
              class="jsonpath-expression" />
            <div class="jsonpath-buttons">
              <el-button type="primary" @click="executeJsonPathTest" class="jsonpath-execute-btn">执行</el-button>
              <el-button type="success" @click="formatJsonData" class="jsonpath-format-btn">格式化</el-button>
            </div>
          </div>
        </div>
        <div class="jsonpath-result-group">
          <div class="jsonpath-label">执行结果:</div>
          <el-input v-model="jsonPathResult" type="textarea" :rows="10" readonly placeholder="执行结果将显示在这里"
            class="jsonpath-result" />
        </div>
      </div>
    </el-dialog>

    <!-- XML测试弹窗 -->
    <el-dialog v-model="xmlDialogVisible" title="XML测试工具" width="1000px">
      <div class="jsonpath-container">
        <div class="jsonpath-inputs">
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">XML数据:</div>
            <el-input v-model="xmlForm.xmlData" type="textarea" :rows="10" placeholder="请输入XML数据"
              class="jsonpath-textarea" />
          </div>
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">XPath表达式:</div>
            <el-input v-model="xmlForm.xpath" placeholder="例如: //book[1]/title" class="jsonpath-expression" />
            <div class="jsonpath-buttons">
              <el-button type="primary" @click="executeXmlTest" class="jsonpath-execute-btn">执行</el-button>
              <el-button type="success" @click="formatXmlData" class="jsonpath-format-btn">格式化</el-button>
            </div>
          </div>
        </div>
        <div class="jsonpath-result-group">
          <div class="jsonpath-label">执行结果:</div>
          <el-input v-model="xmlResult" type="textarea" :rows="10" readonly placeholder="执行结果将显示在这里"
            class="jsonpath-result" />
        </div>
      </div>
    </el-dialog>

    <!-- 正则表达式测试弹窗 -->
    <el-dialog v-model="regexDialogVisible" title="正则表达式测试工具" width="1000px">
      <div class="jsonpath-container">
        <div class="jsonpath-inputs">
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">测试文本:</div>
            <el-input v-model="regexForm.testText" type="textarea" :rows="10" placeholder="请输入要测试的文本"
              class="jsonpath-textarea" />
          </div>
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">正则表达式:</div>
            <el-input v-model="regexForm.pattern" placeholder="例如: \\b\\w+@\\w+\\.\\w+\\b"
              class="jsonpath-expression" />
            <div class="jsonpath-buttons">
              <el-button type="primary" @click="executeRegexTest" class="jsonpath-execute-btn">执行</el-button>
              <el-button type="success" @click="formatRegexPattern" class="jsonpath-format-btn">格式化</el-button>
            </div>
          </div>
        </div>
        <div class="jsonpath-result-group">
          <div class="jsonpath-label">执行结果:</div>
          <el-input v-model="regexResult" type="textarea" :rows="10" readonly placeholder="执行结果将显示在这里"
            class="jsonpath-result" />
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑配置弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑配置' : '新增配置'" width="800px">
      <el-form :model="configForm" ref="configFormRef" label-width="100px" :rules="formRules">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="配置名称:" prop="configName">
              <el-input v-model="configForm.configName" placeholder="请输入配置名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求类型:" prop="requestType">
              <el-select v-model="configForm.requestType" placeholder="请选择请求类型" style="width: 100%">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="基础URL:" prop="columnUrl">
              <el-input v-model="configForm.columnUrl" placeholder="请输入基础URL" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="请求体:" prop="requestBody">
          <el-input v-model="configForm.requestBody" type="textarea" :rows="3"
            placeholder="POST请求时的请求体模板，可包含占位符<pageNum>" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="起始页码:" prop="pageStart">
              <el-input-number v-model="configForm.pageStart" :min="0" placeholder="请输入起始页码" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大页数:" prop="pageLen">
              <el-input-number v-model="configForm.pageLen" :min="1" placeholder="请输入最大页数" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="下一页URL:" prop="nextPage">
          <el-input v-model="configForm.nextPage" placeholder="下一页URL模板，包含占位符<pageNum>" />
        </el-form-item>

        <el-form-item label="请求头:" prop="requestHead">
          <el-input v-model="configForm.requestHead" type="textarea" :rows="3" placeholder="请求头信息，JSON格式字符串" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结果类型:" prop="resultType">
              <el-select v-model="configForm.resultType" placeholder="请选择结果类型" style="width: 100%">
                <el-option label="JSON" value="json" />
                <el-option label="XML" value="xml" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="列表规则:" prop="resultListRule">
              <el-input v-model="configForm.resultListRule" placeholder="列表获取表达式" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="结果清洗:" prop="resultClean">
          <el-input v-model="configForm.resultClean" type="textarea" :rows="2" placeholder="结果清洗正则表达式" />
        </el-form-item>

        <el-form-item label="详情链接:" prop="detailUrlRule">
          <el-input v-model="configForm.detailUrlRule" placeholder="提取详情页链接规则" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitConfigForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormRules, FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { JSONPath } from 'jsonpath-plus';
import { XMLParser } from 'fast-xml-parser';
import * as xpath from 'xpath';
import { DOMParser } from 'xmldom';
import {
  Search,
  Refresh,
  Plus,
  Setting,
  Edit,
  Delete,
  Check,
  Monitor,
  User,
} from '@element-plus/icons-vue';
import { dynamicConfigApi } from '../api/dynamicConfig';
import type { DynamicConfig } from '../types/dynamicConfig';
import { useRoute } from "vue-router";

const websiteId = ref(); 
const route = useRoute();

// 定义配置类型接口
interface WebsiteConfig {
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

onMounted(() => {
  websiteId.value = Number(route.query.websiteId);
  fetchData();
});

// --- State ---
const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  configId: '',
  configName: '',
  columnUrl: '',
  requestType: '',
});

// JSONPath测试相关
const jsonPathDialogVisible = ref(false);
const jsonPathForm = reactive({
  jsonData: '',
  jsonPath: '',
});
const jsonPathResult = ref('');

// XML测试相关
const xmlDialogVisible = ref(false);
const xmlForm = reactive({
  xmlData: '',
  xpath: '',
});
const xmlResult = ref('');

// 正则表达式测试相关
const regexDialogVisible = ref(false);
const regexForm = reactive({
  testText: '',
  pattern: '',
});
const regexResult = ref('');

const loading = ref(false);
const dialogVisible = ref(false);
const isEditMode = ref(false);
const configFormRef = ref<FormInstance>();
const currentConfigId = ref<number | null>(null);

const configForm = reactive<WebsiteConfig>({
  configId: '',
  websiteId: Number(websiteId),
  configName: '',
  columnUrl: '',
  requestType: 'GET',
  requestBody: '',
  pageStart: 1,
  pageLen: 10,
  nextPage: '',
  requestHead: '',
  resultType: 'json',
  resultClean: '',
  resultListRule: '',
  detailUrlRule: ''
});

const formRules = reactive<FormRules>({
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
});


// 表格数据
const tableData = ref<WebsiteConfig[]>([
]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchData();
};

const handleReset = () => {
  searchFormRef.value?.resetFields();
  pagination.currentPage = 1;
  fetchData();
};

const handleAddConfig = () => {
  isEditMode.value = false;
  currentConfigId.value = null;
  configForm.websiteId = 0;
  configForm.configType = '';
  configForm.description = '';
  configForm.content = '';
  dialogVisible.value = true;
};

const handleTableRefresh = () => {
  fetchData();
};

const handleTableSettings = () => {
  ElMessage.info('打开表格设置');
};

// JSONPath测试相关方法
const handleJsonPathTest = () => {
  // 提供一个示例JSON数据
  jsonPathForm.jsonData = JSON.stringify({
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
  }, null, 2);
  jsonPathForm.jsonPath = '$.store.book[0].title';
  jsonPathResult.value = '';
  jsonPathDialogVisible.value = true;
};

// JSON格式化方法
const formatJsonData = () => {
  try {
    // 验证JSON格式
    const jsonObj = JSON.parse(jsonPathForm.jsonData);
    // 格式化JSON
    jsonPathForm.jsonData = JSON.stringify(jsonObj, null, 2);
    ElMessage.success('JSON格式化成功');
  } catch (error) {
    ElMessage.error('JSON格式错误，无法格式化');
  }
};

const executeJsonPathTest = () => {
  try {
    // 验证JSON格式
    const jsonObj = JSON.parse(jsonPathForm.jsonData);

    // 使用jsonpath-plus执行JSONPath查询
    const result = JSONPath({ path: jsonPathForm.jsonPath, json: jsonObj });

    // 显示结果
    jsonPathResult.value = JSON.stringify(result, null, 2);
  } catch (error) {
    if (error instanceof SyntaxError) {
      ElMessage.error('JSON格式错误，请检查输入');
    } else {
      ElMessage.error('JSONPath执行错误: ' + (error as Error).message);
    }
  }
};

// XML测试相关方法
const handleXmlTest = () => {
  // 提供一个示例XML数据
  xmlForm.xmlData = `<?xml version="1.0" encoding="UTF-8"?>
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
</bookstore>`;
  xmlForm.xpath = '//book[1]/title';
  xmlResult.value = '';
  xmlDialogVisible.value = true;
};

// XML格式化方法
const formatXmlData = () => {
  try {
    if (!xmlForm.xmlData.trim()) {
      ElMessage.warning('请输入XML数据');
      return;
    }

    // 使用DOMParser解析XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlForm.xmlData, "text/xml");

    // 检查解析错误
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      throw new Error("XML格式错误");
    }

    // 使用XMLParser格式化XML
    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      format: true,
      indentBy: '  '
    });

    // 将格式化后的XML设置回表单
    // 由于XMLParser不直接支持格式化输出，我们使用原始的XML字符串进行简单的格式化
    // 这里使用一个简单的方法来格式化XML
    const formattedXml = formatXml(xmlForm.xmlData);
    xmlForm.xmlData = formattedXml;

    ElMessage.success('XML格式化成功');
  } catch (error) {
    ElMessage.error('XML格式错误，无法格式化');
  }
};

// 简单的XML格式化函数
const formatXml = (xml: string): string => {
  let formatted = '';
  let indent = '';

  xml.split(/>[\s\r\n]*</).forEach(node => {
    if (node.match(/^\/\w/)) {
      // 如果是结束标签，减少缩进
      indent = indent.substring(2);
    }

    formatted += indent + '<' + node + '>\n';

    if (node.match(/^<\w[^>]*[^/]$/) && !node.startsWith('<?xml')) {
      // 如果是开始标签且不是自闭合标签，增加缩进
      indent += '  ';
    }
  });

  // 处理格式化后可能出现的问题
  return formatted
    .replace(/><\//g, '>\n</')
    .replace(/<\?xml/g, '<?xml')
    .replace(/\n<\?xml/g, '<?xml');
};

// 正则表达式测试相关方法
const handleRegexTest = () => {
  // 提供一个示例文本和正则表达式
  regexForm.testText = 'test@example.com\ncontact@domain.com\ninvalid.email\nsupport@company.net';
  regexForm.pattern = '\\b\\w+@\\w+\\.\\w+\\b';
  regexResult.value = '';
  regexDialogVisible.value = true;
};

const formatRegexPattern = () => {
  try {
    if (!regexForm.pattern.trim()) {
      ElMessage.warning('请输入正则表达式');
      return;
    }
    // 尝试创建正则表达式对象来验证格式
    new RegExp(regexForm.pattern);
    ElMessage.success('正则表达式格式正确');
  } catch (error) {
    ElMessage.error('正则表达式格式错误：' + (error as Error).message);
  }
};

const executeRegexTest = () => {
  try {
    if (!regexForm.testText.trim()) {
      ElMessage.warning('请输入测试文本');
      return;
    }
    if (!regexForm.pattern.trim()) {
      ElMessage.warning('请输入正则表达式');
      return;
    }

    // 创建正则表达式对象
    const regex = new RegExp(regexForm.pattern, 'g');
    const matches = regexForm.testText.match(regex);

    if (matches) {
      regexResult.value = `找到 ${matches.length} 个匹配：\n\n${matches.join('\n')}`;
    } else {
      regexResult.value = '未找到匹配';
    }
  } catch (error) {
    ElMessage.error('正则表达式执行错误：' + (error as Error).message);
    regexResult.value = '执行出错，请检查正则表达式格式';
  }
};

const executeXmlTest = () => {
  try {
    // 验证XML格式
    if (!xmlForm.xmlData.trim()) {
      ElMessage.warning('请输入XML数据');
      return;
    }

    // 使用DOMParser解析XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlForm.xmlData, "text/xml");

    // 检查解析错误
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      throw new Error("XML格式错误");
    }

    // 使用xpath执行XPath查询
    const nodes = xpath.select(xmlForm.xpath, xmlDoc);

    // 处理结果
    if (Array.isArray(nodes)) {
      // 如果结果是节点数组
      if (nodes.length === 0) {
        xmlResult.value = "未找到匹配结果";
        return;
      }

      const result = nodes.map(node => {
        if (node.nodeType === 1) { // 元素节点
          return node.toString();
        } else if (node.nodeType === 2) { // 属性节点
          return node.nodeValue;
        } else if (node.nodeType === 3) { // 文本节点
          return node.nodeValue;
        }
        return node.toString();
      });

      // 格式化输出结果
      if (result.length === 1) {
        xmlResult.value = result[0];
      } else {
        xmlResult.value = JSON.stringify(result, null, 2);
      }
    } else {
      // 如果结果是单个值
      xmlResult.value = String(nodes);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("XML格式错误")) {
      ElMessage.error('XML格式错误，请检查输入');
    } else {
      ElMessage.error('XPath执行错误: ' + (error as Error).message);
    }
    xmlResult.value = "执行出错，请检查XML数据和XPath表达式";
  }
};

const handleEdit = async (row: DynamicConfig) => {
  try {
    const { data } = await dynamicConfigApi.getById(row.id!);
    Object.assign(configForm, data);
    isEditMode.value = true;
    currentConfigId.value = row.id;
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取配置详情失败');
  }
};

const submitConfigForm = async () => {
  if (!configFormRef.value) return;
  await configFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        configForm.websiteId = Number(websiteId.value);
        if (isEditMode.value && currentConfigId.value) {
          await dynamicConfigApi.update(currentConfigId.value, configForm);
          ElMessage.success('更新成功');
        } else {
          await dynamicConfigApi.save(configForm);
          ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        ElMessage.error(isEditMode.value ? '更新失败' : '添加失败');
      }
    }
  });
};

const handleDelete = (row: DynamicConfig) => {
  ElMessageBox.confirm('确认删除该配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await dynamicConfigApi.delete(row.id!);
      ElMessage.success('删除成功');
      fetchData();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  }).catch(() => { });
};

const handleApply = (row: DynamicConfig) => {
  ElMessage.success(`配置 ${row.configName} 已应用`);
};

// Pagination Handlers
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  fetchData();
};

const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await dynamicConfigApi.list({
      page: pagination.currentPage,
      size: pagination.pageSize,
      websiteId: Number(websiteId.value),
    });
    if (data && data.records) {
      tableData.value = data.records;
      pagination.total = data.total || 0;
      pagination.pageSize = data.size || 10;
      pagination.currentPage = data.current || 1;
    }
  } catch (error) {
    ElMessage.error('获取配置列表失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.website-config-container {
  padding: 12px;
  background: #f0f2f5;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-card {
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.el-form--inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 18px;
}

.table-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.table-actions .el-button {
  margin-left: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.el-table .el-button+.el-button {
  margin-left: 8px;
}

.el-select {
  min-width: 180px;
}

/* 添加JSONPath、XML和正则表达式测试工具的样式 */
.jsonpath-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.jsonpath-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.jsonpath-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jsonpath-label {
  font-weight: bold;
  margin-bottom: 4px;
}

.jsonpath-buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
</style>