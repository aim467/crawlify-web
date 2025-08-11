<template>
  <div class="website-config-container">
    <!-- Filter/Search Form -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto">
        <el-form-item label="配置ID:" prop="configId">
          <el-input
            v-model="searchForm.configId"
            placeholder="请输入配置ID"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="配置名称:" prop="configName">
          <el-input
            v-model="searchForm.configName"
            placeholder="请输入配置名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="基础URL:" prop="columnUrl">
          <el-input
            v-model="searchForm.columnUrl"
            placeholder="请输入基础URL"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <!-- 父页面链接 -->
         <el-form-item label="父页面链接:" prop="parentLink">
          <el-input
            v-model="searchForm.parentLink"
            placeholder="请输入父页面链接"
            clearable
            @keyup.enter="handleSearch"
          />  
         </el-form-item>
        <el-form-item label="请求类型:" prop="requestType">
          <el-select
            v-model="searchForm.requestType"
            placeholder="请选择请求类型"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button
            type="primary"
            icon="search"
            @click="handleSearch"
            :loading="loading"
          >
            查询
          </el-button>
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
          <el-button type="primary" icon="plus" @click="handleAddConfig">新增配置</el-button>
          <el-button type="success" @click="handleJsonPathTest">JSONPath测试</el-button>
          <el-button type="warning" @click="handleXmlTest">XML测试</el-button>
          <el-button type="info" @click="handleRegexTest">正则表达式测试</el-button>
          <el-button icon="refresh" circle @click="handleTableRefresh" />
        </div>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border height="calc(100vh - 280px)">
        <el-table-column prop="configId" label="配置ID" width="200" align="center" fixed />
        <el-table-column prop="configName" label="配置名称" min-width="150" fixed />
        <!-- 设置父页面能打开 -->
        <el-table-column prop="parentLink" label="父页面链接" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <a :href="row.parentLink" target="_blank">{{ row.parentLink }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="columnUrl" label="基础URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="requestType" label="请求类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.requestType === 'GET' ? 'success' : 'warning'">
              {{ row.requestType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pageStart" label="起始页码" width="100" align="center" />
        <el-table-column prop="pageLen" label="最大页数" width="100" align="center" />
        <el-table-column prop="nextPage" label="下一页URL" min-width="200" show-overflow-tooltip />
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
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="edit" @click="handleEdit(row)" />
            </el-tooltip>
            <el-tooltip content="复制" placement="top">
              <el-button link type="success" icon="copy-document" @click="handleCopy(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="delete" @click="handleDelete(row)" />
            </el-tooltip>
            <el-tooltip content="配置测试" placement="top">
              <el-button link type="warning" icon="monitor" @click="handleConfigTest(row)" />
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

    <!-- 统一测试弹窗 -->
    <TestDialog
      v-model:visible="testDialogVisible"
      :type="currentTestType"
      v-model:inputData="testForm.inputData"
      v-model:expressionData="testForm.expressionData"
    />

            <!-- 配置表单抽屉 -->
    <el-drawer
      v-model="dialogVisible"
      :title="isEditMode ? '编辑配置' : '新增配置'"
      direction="rtl"
      size="80%"
      class="config-drawer"
      :close-on-click-modal="false"
    >
      <div class="drawer-content">
        <!-- 导入命令区域 -->
        <div class="import-section">
          <h3>快速导入</h3>
          <p class="section-desc">支持 curl 或 fetch 命令一键导入配置</p>
          <el-input
            v-model="importCommand"
            type="textarea"
            :rows="4"
            placeholder="请输入curl或fetch命令，例如: curl -X GET 'https://example.com/api' -H 'Content-Type: application/json'"
            class="import-input"
          />
          <el-button type="primary" class="import-btn" @click="handleImport">
            <el-icon><Upload /></el-icon>
            导入配置
          </el-button>
        </div>

        <!-- 表单区域 -->
        <ConfigForm :form="configForm" ref="configFormRef" />

        <!-- 操作按钮 -->
        <div class="drawer-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitConfigForm">确认</el-button>
        </div>
      </div>
    </el-drawer>
    <!-- 配置测试弹窗 -->
    <el-dialog v-model="configTestDialogVisible" title="配置测试结果" width="900px">
      <div v-if="configTestResults.length === 0" class="empty-result">
        <el-empty description="暂无测试数据" />
      </div>
      <template v-else>
        <el-tabs v-model="activeTestTab" type="card">
          <el-tab-pane label="原始数据" name="raw">
            <el-table :data="paginatedTestResults" style="width: 100%" border>
              <el-table-column prop="" label="测试结果">
                <template #default="{ row }">
                  <el-tooltip :content="row" placement="top" :hide-after="2000">
                    <template v-if="isValidUrl(row)">
                      <a :href="row" target="_blank" class="link-text">
                        {{ row.length > 100 ? row.substring(0, 100) + '...' : row }}
                      </a>
                    </template>
                    <template v-else>
                      <span>{{ row.length > 100 ? row.substring(0, 100) + '...' : row }}</span>
                    </template>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="格式化视图" name="formatted" v-if="hasJsonData">
            <json-viewer
              :value="formattedTestResults"
              :expand-depth="3"
              copyable
              boxed
              sort
            />
          </el-tab-pane>
        </el-tabs>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="testPagination.currentPage"
            v-model:page-size="testPagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="testPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleTestSizeChange"
            @current-change="handleTestCurrentChange"
          />
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import { dynamicConfigApi } from '../api/dynamicConfig';
import type { DynamicConfig } from '../types/dynamicConfig';
import { useRoute } from "vue-router";
import TestDialog, { TestType } from '../components';
import ConfigForm from '../components/website/ConfigForm.vue';
import { parseCommand } from '../utils/commandParser';
import { TEST_EXAMPLES } from '../constants/configFormConstants';
import { convertToObject, convertToString } from '@/utils/httpConfigUtils';

const websiteId = ref<number>();
const route = useRoute();



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
  parentLink: '',
});

// 统一测试弹窗相关
const testDialogVisible = ref(false);
const currentTestType = ref<TestType>(TestType.JSON);
const testForm = reactive({
  inputData: '',
  expressionData: '',
});

const loading = ref(false);
const dialogVisible = ref(false);
const importCommand = ref('');
const isEditMode = ref(false);
const configFormRef = ref();
const currentConfigId = ref<string | number | null>(null);

// 配置测试相关
const configTestDialogVisible = ref(false);
const configTestResults = ref<string[]>([]);
const testPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const paginatedTestResults = computed(() => {
  const start = (testPagination.currentPage - 1) * testPagination.pageSize;
  const end = start + testPagination.pageSize;
  return configTestResults.value.slice(start, end);
});

const configForm = reactive<DynamicConfig>({
  configId: '',
  websiteId: Number(websiteId),
  configName: '',
  columnUrl: '',
  requestType: 'GET',
  requestBody: '',
  pageStart: 1,
  pageLen: 10,
  nextPage: '',
  requestHead: {} as Record<string, string>,
  resultType: 'json',
  resultClean: '',
  resultListRule: '',
  detailUrlRule: '',
  parentLink: '',
  requestHeadStr: '',
});

// 表格数据
const tableData = ref<DynamicConfig[]>([
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
  configForm.websiteId = Number(websiteId.value);
  dialogVisible.value = true;
};

const handleTableRefresh = () => {
  fetchData();
};

// 测试相关方法
const openTestDialog = (type: TestType) => {
  currentTestType.value = type;
  const example = TEST_EXAMPLES[type];
  testForm.inputData = example.inputData;
  testForm.expressionData = example.expressionData;
  testDialogVisible.value = true;
};

const handleJsonPathTest = () => openTestDialog(TestType.JSON);
const handleXmlTest = () => openTestDialog(TestType.XML);
const handleRegexTest = () => openTestDialog(TestType.REGEX);

const handleEdit = async (row: DynamicConfig) => {
  try {
    const { data } = await dynamicConfigApi.getById(row.configId!);
    Object.assign(configForm, data);
    // 处理 requestHead 字段，将逗号分隔的格式替换为换行符
    configForm.requestHeadStr = convertToString(data.requestHead, ': ');
    isEditMode.value = true;
    currentConfigId.value = row.configId;
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取配置详情失败');
  }
};

const handleCopy = (row: DynamicConfig) => {
  // 复制配置数据到表单
  Object.assign(configForm, { ...row, configId: '' }); // 清空配置ID以创建新配置
  isEditMode.value = false; // 设置为新增模式
  // 清空configForm.configName
  configForm.configName = '';
  configForm.requestHeadStr = convertToString(configForm.requestHead, ': ');
  currentConfigId.value = null;
  dialogVisible.value = true;
  
  // 显示醒目的提示信息
  ElMessage({
    message: '您正在复制配置，请修改必要信息后保存',
    type: 'warning',
    duration: 5000,
    showClose: true
  });
};

const submitConfigForm = async () => {
  if (!configFormRef.value) return;
  await configFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        configForm.websiteId = Number(websiteId.value);
        // requestHead 字段处理，将换行符替换为逗号分隔的格式
        configForm.requestHead = convertToObject(configForm.requestHeadStr, ':');
        if (isEditMode.value && currentConfigId.value) {
          await dynamicConfigApi.update(configForm);
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
      await dynamicConfigApi.delete(row.configId!);
      ElMessage.success('删除成功');
      fetchData();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  }).catch(() => { });
};

const handleImport = async () => {
  if (!importCommand.value.trim()) {
    ElMessage.warning('请输入curl或fetch命令');
    return;
  }

  try {
    const result = parseCommand(importCommand.value);
    
    // 更新表单字段
    configForm.columnUrl = result.url;
    configForm.nextPage = result.url;
    configForm.requestType = result.method;

    // 处理请求头
    if (result.headers && Object.keys(result.headers).length > 0) {
      const headers = Object.entries(result.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      configForm.requestHeadStr = headers;
    } else {
      configForm.requestHeadStr = '';
    }

    // 处理请求体
    configForm.requestBody = typeof result.body === 'string' 
      ? result.body 
      : JSON.stringify(result.body, null, 2);

    ElMessage.success('导入成功');
  } catch (error) {
    ElMessage.error(`导入失败: ${(error as Error).message}`);
  }
};

const activeTestTab = ref('raw');
const hasJsonData = ref(false);
const formattedTestResults = ref<any[]>([]);

const handleConfigTest = async (row: DynamicConfig) => {
  try {
    loading.value = true;
    const { data } = await dynamicConfigApi.testConfig(row.configId);
    
    // 处理测试结果
    configTestResults.value = Array.isArray(data) ? data : [];
    testPagination.total = configTestResults.value.length;
    testPagination.currentPage = 1;
    
    // 尝试解析JSON数据
    formattedTestResults.value = configTestResults.value.map(item => {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    });
    
    hasJsonData.value = formattedTestResults.value.some(
      item => typeof item === 'object' && !Array.isArray(item)
    );
    
    configTestDialogVisible.value = true;
    ElMessage.success({
      message: '测试完成',
      duration: 2000
    });
  } catch (error) {
    ElMessage.error({
      message: `配置测试失败: ${(error as Error).message}`,
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
};

const handleTestSizeChange = (val: number) => {
  testPagination.pageSize = val;
  testPagination.currentPage = 1;
};

const handleTestCurrentChange = (val: number) => {
  testPagination.currentPage = val;
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

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await dynamicConfigApi.list({
      page: pagination.currentPage,
      size: pagination.pageSize,
      websiteId: Number(websiteId.value),
      configId: searchForm.configId || undefined,
      configName: searchForm.configName || undefined,
      columnUrl: searchForm.columnUrl || undefined,
      requestType: searchForm.requestType || undefined,
    });
    if (data?.records) {
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

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 导入区域 */
.import-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
  padding: 24px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.15);
  position: relative;
  z-index: 2;
}

.import-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, transparent 100%);
  border-radius: 0 0 2px 2px;
}

.import-section h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  position: relative;
  display: flex;
  align-items: center;
}

.import-section h3::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-right: 10px;
  flex-shrink: 0;
}

.section-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.import-input {
  margin-bottom: 12px;
}

.import-input :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  border-radius: 6px;
}

.import-btn {
  border-radius: 6px;
  font-weight: 500;
}



/* 底部按钮 */
.drawer-footer {
  padding: 20px 24px;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.drawer-footer .el-button {
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 500;
}

/* 表格现代化样式优化 */
.table-card :deep(.el-card__body) {
  padding: 24px;
}

.table-header {
  background: white;
  padding: 20px 0;
  border-radius: 12px 12px 0 0;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.table-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-right: 12px;
}

.table-actions .el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.table-actions .el-button:hover {
  transform: translateY(-1px);
}

.table-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table th.el-table__cell) {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

/* 搜索卡片样式优化 */
.search-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-card :deep(.el-card__body) {
  padding: 20px 24px;
}

/* 测试工具的样式已移至TestDialog.vue组件中 */
</style>