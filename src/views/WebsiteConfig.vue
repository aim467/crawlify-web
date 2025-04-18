<template>
  <div class="website-config-container">
    <!-- Filter/Search Form -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto">
        <el-form-item label="网站名称:" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入网站名称" clearable />
        </el-form-item>
        <el-form-item label="配置类型:" prop="configType">
          <el-select v-model="searchForm.configType" placeholder="请选择配置类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="爬虫规则" value="crawler" />
            <el-option label="解析规则" value="parser" />
            <el-option label="过滤规则" value="filter" />
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
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="websiteName" label="网站名称" min-width="150" />
        <el-table-column prop="configType" label="配置类型" min-width="120">
          <template #default="{ row }">
            <el-tag
              :type="row.configType === 'crawler' ? 'primary' : row.configType === 'parser' ? 'success' : 'warning'"
            >
              {{ row.configType === 'crawler' ? '爬虫规则' : row.configType === 'parser' ? '解析规则' : '过滤规则' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="配置描述" min-width="200" />
        <el-table-column prop="updateTime" label="更新时间" min-width="180" />
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
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- JSONPath测试弹窗 -->
    <el-dialog
      v-model="jsonPathDialogVisible"
      title="JSONPath测试工具"
      width="800px"
    >
      <div class="jsonpath-container">
        <div class="jsonpath-inputs">
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">JSON数据:</div>
            <el-input
              v-model="jsonPathForm.jsonData"
              type="textarea"
              :rows="10"
              placeholder="请输入JSON数据"
              class="jsonpath-textarea"
            />
          </div>
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">JSONPath表达式:</div>
            <el-input
              v-model="jsonPathForm.jsonPath"
              placeholder="例如: $.store.book[0].title"
              class="jsonpath-expression"
            />
            <div class="jsonpath-buttons">
              <el-button type="primary" @click="executeJsonPathTest" class="jsonpath-execute-btn">执行</el-button>
              <el-button type="success" @click="formatJsonData" class="jsonpath-format-btn">格式化</el-button>
            </div>
          </div>
        </div>
        <div class="jsonpath-result-group">
          <div class="jsonpath-label">执行结果:</div>
          <el-input
            v-model="jsonPathResult"
            type="textarea"
            :rows="10"
            readonly
            placeholder="执行结果将显示在这里"
            class="jsonpath-result"
          />
        </div>
      </div>
    </el-dialog>
    
    <!-- XML测试弹窗 -->
    <el-dialog
      v-model="xmlDialogVisible"
      title="XML测试工具"
      width="800px"
    >
      <div class="jsonpath-container">
        <div class="jsonpath-inputs">
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">XML数据:</div>
            <el-input
              v-model="xmlForm.xmlData"
              type="textarea"
              :rows="10"
              placeholder="请输入XML数据"
              class="jsonpath-textarea"
            />
          </div>
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">XPath表达式:</div>
            <el-input
              v-model="xmlForm.xpath"
              placeholder="例如: //book[1]/title"
              class="jsonpath-expression"
            />
            <div class="jsonpath-buttons">
              <el-button type="primary" @click="executeXmlTest" class="jsonpath-execute-btn">执行</el-button>
              <el-button type="success" @click="formatXmlData" class="jsonpath-format-btn">格式化</el-button>
            </div>
          </div>
        </div>
        <div class="jsonpath-result-group">
          <div class="jsonpath-label">执行结果:</div>
          <el-input
            v-model="xmlResult"
            type="textarea"
            :rows="10"
            readonly
            placeholder="执行结果将显示在这里"
            class="jsonpath-result"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 正则表达式测试弹窗 -->
    <el-dialog
      v-model="regexDialogVisible"
      title="正则表达式测试工具"
      width="800px"
    >
      <div class="jsonpath-container">
        <div class="jsonpath-inputs">
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">测试文本:</div>
            <el-input
              v-model="regexForm.testText"
              type="textarea"
              :rows="10"
              placeholder="请输入要测试的文本"
              class="jsonpath-textarea"
            />
          </div>
          <div class="jsonpath-input-group">
            <div class="jsonpath-label">正则表达式:</div>
            <el-input
              v-model="regexForm.pattern"
              placeholder="例如: \\b\\w+@\\w+\\.\\w+\\b"
              class="jsonpath-expression"
            />
            <div class="jsonpath-buttons">
              <el-button type="primary" @click="executeRegexTest" class="jsonpath-execute-btn">执行</el-button>
              <el-button type="success" @click="formatRegexPattern" class="jsonpath-format-btn">格式化</el-button>
            </div>
          </div>
        </div>
        <div class="jsonpath-result-group">
          <div class="jsonpath-label">执行结果:</div>
          <el-input
            v-model="regexResult"
            type="textarea"
            :rows="10"
            readonly
            placeholder="执行结果将显示在这里"
            class="jsonpath-result"
          />
        </div>
      </div>
    </el-dialog>
    
    <!-- Add/Edit Config Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑配置' : '新增配置'"
      width="600px"
    >
      <el-form
        :model="configForm"
        ref="configFormRef"
        label-width="100px"
        :rules="formRules"
      >
        <el-form-item label="网站:" prop="websiteId">
          <el-select v-model="configForm.websiteId" placeholder="请选择网站" style="width: 100%">
            <el-option
              v-for="site in websiteOptions"
              :key="site.id"
              :label="site.name"
              :value="site.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="配置类型:" prop="configType">
          <el-select v-model="configForm.configType" placeholder="请选择配置类型" style="width: 100%">
            <el-option label="爬虫规则" value="crawler" />
            <el-option label="解析规则" value="parser" />
            <el-option label="过滤规则" value="filter" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置描述:" prop="description">
          <el-input v-model="configForm.description" placeholder="请输入配置描述" />
        </el-form-item>
        <el-form-item label="配置内容:" prop="content">
          <el-input
            v-model="configForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入配置内容（JSON格式）"
          />
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
} from '@element-plus/icons-vue';
import { websiteApi } from '../api/website';
import type { Website } from '../types/website';

// 定义配置类型接口
interface WebsiteConfig {
  id?: number;
  websiteId: number;
  websiteName?: string;
  configType: string;
  description: string;
  content: string;
  updateTime?: string;
}

onMounted(() => {
  fetchData();
  fetchWebsites();
});

// --- State ---
const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  name: '',
  configType: '',
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
  websiteId: 0,
  configType: '',
  description: '',
  content: '',
});

const formRules = reactive<FormRules>({
  websiteId: [
    { required: true, message: '请选择网站', trigger: 'change' },
  ],
  configType: [
    { required: true, message: '请选择配置类型', trigger: 'change' },
  ],
  description: [
    { required: true, message: '请输入配置描述', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入配置内容', trigger: 'blur' },
  ]
});

// 网站选项
const websiteOptions = ref<Website[]>([]);

// 表格数据
const tableData = ref<WebsiteConfig[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// --- Methods ---
const fetchData = async () => {
  try {
    loading.value = true;
    // 这里应该调用实际的API获取配置列表
    // 模拟数据
    setTimeout(() => {
      tableData.value = [
        {
          id: 1,
          websiteId: 1,
          websiteName: '示例网站',
          configType: 'crawler',
          description: '首页爬虫规则',
          content: '{"selector": ".article", "attribute": "href"}',
          updateTime: '2023-05-15 14:30:00'
        },
        {
          id: 2,
          websiteId: 1,
          websiteName: '示例网站',
          configType: 'parser',
          description: '文章内容解析规则',
          content: '{"title": ".article-title", "content": ".article-content"}',
          updateTime: '2023-05-16 09:15:00'
        },
      ];
      pagination.total = 2;
      loading.value = false;
    }, 500);
  } catch (error) {
    ElMessage.error('获取配置列表失败');
    loading.value = false;
  }
};

const fetchWebsites = async () => {
  try {
    // 这里应该调用实际的API获取网站列表
    const { data } = await websiteApi.list({
      page: 1,
      size: 100
    });
    websiteOptions.value = data.records;
  } catch (error) {
    ElMessage.error('获取网站列表失败');
  }
};

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

const handleEdit = (row: WebsiteConfig) => {
  isEditMode.value = true;
  currentConfigId.value = row.id;
  configForm.websiteId = row.websiteId;
  configForm.configType = row.configType;
  configForm.description = row.description;
  configForm.content = row.content;
  dialogVisible.value = true;
};

const submitConfigForm = async () => {
  try {
    await configFormRef.value?.validate();
    
    // 这里应该调用实际的API保存配置
    if (isEditMode.value && currentConfigId.value) {
      // 更新配置
      ElMessage.success('配置更新成功');
    } else {
      // 创建配置
      ElMessage.success('配置创建成功');
    }
    
    dialogVisible.value = false;
    fetchData();
  } catch (error) {
    console.error('Failed to submit config form:', error);
    ElMessage.error('操作失败');
  }
};

const handleDelete = (row: WebsiteConfig) => {
  ElMessageBox.confirm(`确定要删除配置 '${row.description}' 吗?`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        // 这里应该调用实际的API删除配置
        ElMessage({ type: 'success', message: '删除成功' });
        fetchData();
      } catch (error) {
        console.error('Failed to delete config:', error);
        ElMessage.error('删除配置失败');
      }
    })
    .catch(() => {
      ElMessage({ type: 'info', message: '已取消删除' });
    });
};

const handleApply = (row: WebsiteConfig) => {
  ElMessageBox.confirm(`确定要应用配置 '${row.description}' 吗?`, '提示', {
    confirmButtonText: '确定应用',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(async () => {
      try {
        // 这里应该调用实际的API应用配置
        ElMessage({ type: 'success', message: '配置应用成功' });
      } catch (error) {
        console.error('Failed to apply config:', error);
        ElMessage.error('应用配置失败');
      }
    })
    .catch(() => {
      ElMessage({ type: 'info', message: '已取消应用' });
    });
};

// Pagination Handlers
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  pagination.currentPage = 1;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  fetchData();
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
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
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

.el-table .el-button + .el-button {
  margin-left: 8px;
}

.el-select {
  min-width: 180px;
}

/* JSONPath测试相关样式 */
.jsonpath-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.jsonpath-inputs {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.jsonpath-textarea {
  font-family: monospace;
}

.jsonpath-expression {
  margin-bottom: 8px;
}

.jsonpath-buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.jsonpath-execute-btn,
.jsonpath-format-btn {
  align-self: flex-start;
}

.jsonpath-result-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jsonpath-result {
  font-family: monospace;
  background-color: #f5f7fa;
}
</style>