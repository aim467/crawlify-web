<template>
  <div class="website-list-container">
    <!-- Filter/Search Form -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto"
        class="search-form">
        <div class="form-row">
          <el-form-item label="网站名称:" prop="name">
            <el-input v-model="searchForm.name" placeholder="请输入网站名称" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item label="基础URL:" prop="baseUrl">
            <el-input v-model="searchForm.baseUrl" placeholder="请输入基础URL" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item label="域名:" prop="domain">
            <el-input v-model="searchForm.domain" placeholder="请输入域名" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item label="字符编码:" prop="charset">
            <el-input v-model="searchForm.charset" placeholder="请输入字符编码" clearable style="width: 220px" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="超时时间:" prop="timeOut">
            <el-input-number v-model="searchForm.timeOut" :min="1" :max="60" placeholder="请输入超时时间(秒)" clearable
              style="width: 220px" />
          </el-form-item>
          <el-form-item label="重试次数:" prop="retryTimes">
            <el-input-number v-model="searchForm.retryTimes" :min="0" :max="10" placeholder="请输入重试次数" clearable
              style="width: 220px" />
          </el-form-item>
          <el-form-item label="循环重试次数:" prop="cycleRetryTimes">
            <el-input-number v-model="searchForm.cycleRetryTimes" :min="0" :max="10" placeholder="请输入循环重试次数" clearable
              style="width: 220px" />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" icon="search" @click="handleSearch">查询</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- Table Section -->
    <el-card shadow="never" class="table-card">
      <!-- Table Actions Header -->
      <div class="table-header">
        <div class="table-title">
          网站列表
        </div>
        <div class="table-actions">
          <el-button type="primary" icon="plus" @click="handleAddWebsite">新增网站</el-button>
          <el-button icon="refresh" circle @click="handleTableRefresh" />
          <el-button icon="setting" circle @click="handleTableSettings" />
        </div>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" align="center" fixed="left" v-if="columnSettings.id" />
        <el-table-column prop="name" label="网站名称" min-width="150" fixed="left" v-if="columnSettings.name" />
        <el-table-column prop="baseUrl" label="基础URL" min-width="200" v-if="columnSettings.baseUrl" />
        <el-table-column prop="domain" label="域名" min-width="180" v-if="columnSettings.domain" />
        <el-table-column prop="charset" label="字符编码" min-width="180" v-if="columnSettings.charset" />
        <el-table-column prop="headers" label="请求头" min-width="180" v-if="columnSettings.headers">
          <template #default="{ row }">
            <el-tooltip :content="row.headers" placement="top" :hide-after="0">
              <div class="truncated-text" @click="toggleExpand(row, 'headers')">
                {{ row.isHeadersExpanded ? row.headers : truncateText(row.headers, 50) }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="cookies" label="cookie" min-width="180" v-if="columnSettings.cookies">
          <template #default="{ row }">
            <el-tooltip :content="row.cookies" placement="top" :hide-after="0">
              <div class="truncated-text" @click="toggleExpand(row, 'cookies')">
                {{ row.isCookiesExpanded ? row.cookies : truncateText(row.cookies, 50) }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="timeOut" label="超时时间" min-width="180" v-if="columnSettings.timeOut" />
        <el-table-column prop="retryTimes" label="重试次数" min-width="180" v-if="columnSettings.retryTimes" />
        <el-table-column prop="cycleRetryTimes" label="循环重试次数" min-width="180" v-if="columnSettings.cycleRetryTimes" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="edit" @click="handleEdit(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="delete" @click="handleDelete(row)" />
            </el-tooltip>
            <el-tooltip content="启动采集" placement="top">
              <el-button link type="success" icon="videoPlay" @click="handleStartCrawl(row)" />
            </el-tooltip>
            <el-tooltip content="动态配置" placement="top">
              <el-button link type="warning" icon="setting" @click="handleConfig(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination :current-page="pagination.currentPage" :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" @update:current-page="pagination.currentPage = $event" @update:page-size="pagination.pageSize = $event" />
      </div>
    </el-card>

    <!-- Add/Edit Website Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑网站' : '新增网站'" width="90%" class="website-dialog">
      <el-form :model="websiteForm" ref="websiteFormRef" label-width="120px" :rules="formRules" class="website-form">
        <div class="form-container">
          <!-- 左侧配置信息 -->
          <div class="form-left">
            <!-- 基本信息组 -->
            <div class="form-group">
              <div class="form-group-title">
                <el-icon><InfoFilled /></el-icon>
                <span>基本信息</span>
              </div>
              <el-form-item label="网站名称:" prop="name">
                <el-tooltip content="网站的名称，用于标识和区分不同的网站" placement="top" effect="light">
                  <el-input v-model="websiteForm.name" placeholder="请输入网站名称，2-50个字符" />
                </el-tooltip>
              </el-form-item>
              <el-form-item label="基础URL:" prop="baseUrl">
                <el-tooltip content="网站的基础URL，用于构建完整的请求地址" placement="top" effect="light">
                  <el-input v-model="websiteForm.baseUrl" placeholder="请输入基础URL，如https://example.com" />
                </el-tooltip>
              </el-form-item>
              <el-form-item label="域名:" prop="domain">
                <el-tooltip content="网站的域名，会根据基础URL自动提取" placement="top" effect="light">
                  <el-input v-model="websiteForm.domain" placeholder="请输入域名，如example.com" />
                </el-tooltip>
              </el-form-item>
              <el-form-item label="字符编码:" prop="charset">
                <el-tooltip content="网站使用的字符编码，如UTF-8、GBK等" placement="top" effect="light">
                  <el-input v-model="websiteForm.charset" placeholder="请输入字符编码，如UTF-8" />
                </el-tooltip>
              </el-form-item>
            </div>

            <!-- 请求配置组 -->
            <div class="form-group">
              <div class="form-group-title">
                <el-icon><Setting /></el-icon>
                <span>请求配置</span>
              </div>
              <div class="form-row">
                <el-form-item label="超时时间:" prop="timeOut" class="form-item-half">
                  <el-tooltip content="请求超时时间，单位为秒" placement="top" effect="light">
                    <el-input-number v-model="websiteForm.timeOut" :min="1" :max="60" placeholder="超时(秒)" 
                      style="width: 100%" />
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="重试次数:" prop="retryTimes" class="form-item-half">
                  <el-tooltip content="请求失败后的重试次数" placement="top" effect="light">
                    <el-input-number v-model="websiteForm.retryTimes" :min="0" :max="10" placeholder="重试次数"
                      style="width: 100%" />
                  </el-tooltip>
                </el-form-item>
              </div>
              <el-form-item label="循环重试次数:" prop="cycleRetryTimes">
                <el-tooltip content="所有重试失败后的循环重试次数" placement="top" effect="light">
                  <el-input-number v-model="websiteForm.cycleRetryTimes" :min="0" :max="10" 
                    placeholder="循环重试次数" style="width: 180px" />
                </el-tooltip>
              </el-form-item>
            </div>
          </div>

          <!-- 右侧请求头和Cookie -->
          <div class="form-right">
            <div class="form-group">
              <div class="form-group-title">
                <el-icon><Connection /></el-icon>
                <span>HTTP配置</span>
                <div class="form-group-actions">
                  <el-radio-group v-model="httpConfigMode" @change="switchHttpConfigMode" size="small">
                    <el-radio-button label="text">文本模式</el-radio-button>
                    <el-radio-button label="table">表格模式</el-radio-button>
                  </el-radio-group>
                </div>
              </div>

              <!-- 文本模式 -->
              <template v-if="httpConfigMode === 'text'">
                <el-form-item label="请求头:" prop="headers">
                  <el-input v-model="websiteForm.headers" type="textarea" :rows="15"
                    :autosize="{ minRows: 15, maxRows: 20 }" placeholder="请输入请求头，格式如：User-Agent: Mozilla/5.0&#10;Accept: text/html,application/xhtml+xml&#10;Accept-Language: zh-CN,zh;q=0.9"
                    resize="vertical">
                    <template #prepend>
                      <el-tooltip content="发送请求时使用的HTTP请求头，可以设置User-Agent等信息" placement="top" effect="light">
                        <el-icon><InfoFilled /></el-icon>
                      </el-tooltip>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="Cookie:" prop="cookies">
                  <el-input v-model="websiteForm.cookies" type="textarea" :rows="15"
                    :autosize="{ minRows: 15, maxRows: 20 }" placeholder="请输入Cookie，格式如：name=value; name2=value2&#10;sessionId=abc123; userId=456"
                    resize="vertical">
                    <template #prepend>
                      <el-tooltip content="发送请求时携带的Cookie信息，用于模拟登录状态等" placement="top" effect="light">
                        <el-icon><InfoFilled /></el-icon>
                      </el-tooltip>
                    </template>
                  </el-input>
                </el-form-item>
              </template>

              <!-- 表格模式 -->
              <template v-else>
                <!-- 请求头表格 -->
                <div class="table-section">
                  <div class="table-section-header">
                    <div class="table-section-title">
                      <el-icon><InfoFilled /></el-icon>
                      <span>请求头配置</span>
                    </div>
                    <div class="table-section-actions">
                      <el-button type="primary" size="small" :icon="Plus" @click="addTableRow('headers')">添加</el-button>
                      <el-button type="success" size="small" :icon="Upload" @click="handleImport('headers')">导入</el-button>
                    </div>
                  </div>
                  <el-table 
                    :data="headersTableData" 
                    class="config-table" 
                    empty-text="暂无请求头配置"
                    :height="200"
                    border
                    stripe>
                    <el-table-column label="Header名称" width="180">
                      <template #default="{ row }">
                        <el-input v-model="row.key" placeholder="如：User-Agent" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="Header值">
                      <template #default="{ row }">
                        <el-input v-model="row.value" placeholder="如：Mozilla/5.0 (Windows NT 10.0; Win64; x64)" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="60" align="center">
                      <template #default="{ row }">
                        <el-button type="danger" size="small" :icon="Delete" circle @click="removeTableRow('headers', row.id)" />
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <!-- Cookie表格 -->
                <div class="table-section">
                  <div class="table-section-header">
                    <div class="table-section-title">
                      <el-icon><InfoFilled /></el-icon>
                      <span>Cookie配置</span>
                    </div>
                    <div class="table-section-actions">
                      <el-button type="primary" size="small" :icon="Plus" @click="addTableRow('cookies')">添加</el-button>
                      <el-button type="success" size="small" :icon="Upload" @click="handleImport('cookies')">导入</el-button>
                    </div>
                  </div>
                  <el-table 
                    :data="cookiesTableData" 
                    class="config-table" 
                    empty-text="暂无Cookie配置"
                    :height="200"
                    border
                    stripe>
                    <el-table-column label="Cookie名称" width="180">
                      <template #default="{ row }">
                        <el-input v-model="row.key" placeholder="如：sessionId" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="Cookie值">
                      <template #default="{ row }">
                        <el-input v-model="row.value" placeholder="如：abc123def456" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="60" align="center">
                      <template #default="{ row }">
                        <el-button type="danger" size="small" :icon="Delete" circle @click="removeTableRow('cookies', row.id)" />
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWebsiteForm">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 表格列设置对话框 -->
    <el-dialog v-model="columnSettingsVisible" title="表格列设置" width="500px">
      <div class="column-settings-container">
        <p class="settings-tip">请选择要显示的列：</p>
        <el-checkbox-group v-model="visibleColumns" class="column-checkbox-group">
          <el-checkbox v-for="option in columnOptions" :key="option.prop" :label="option.prop"
            @change="(val: boolean) => changeColumnSetting(option.prop, val)">
            {{ option.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetColumnSettings">重置</el-button>
          <el-button @click="columnSettingsVisible = false">取消</el-button>
          <el-button type="primary" @click="saveColumnSettings">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入HTTP配置对话框 -->
    <el-dialog v-model="importDialogVisible" :title="`导入${importType === 'headers' ? '请求头' : 'Cookie'}配置`" width="600px">
      <div class="import-dialog-content">
        <div class="import-tip">
          <el-alert 
            :title="`请输入${importType === 'headers' ? '请求头' : 'Cookie'}配置，每行一条记录`" 
            type="info" 
            show-icon 
            :closable="false">
            <template #default>
              <p>格式示例：</p>
              <p v-if="importType === 'headers'">User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)</p>
              <p v-if="importType === 'headers'">Accept: text/html,application/xhtml+xml</p>
              <p v-if="importType === 'cookies'">sessionId=abc123def456</p>
              <p v-if="importType === 'cookies'">userId=789</p>
            </template>
          </el-alert>
        </div>
        <el-input 
          v-model="importText" 
          type="textarea" 
          :rows="12"
          :placeholder="`请输入${importType === 'headers' ? '请求头' : 'Cookie'}配置`"
          resize="vertical"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport">确认导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 启动任务选项对话框 -->
    <el-dialog v-model="taskOptionsDialogVisible" title="启动采集任务" width="1000px">
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; align-items: flex-start; width: 100%; gap: 10px;">
          <div class="node-table-container" style="flex: 1; min-width: 0;">
            <el-table
              :data="nodeList"
              style="max-height: 320px; background: #f9f9fb; border: 1px solid #ebeef5;"
              height="320"
              @row-click="handleNodeRowClick"
              :row-class-name="nodeTableRowClassName"
              :empty-text="nodeLoading ? '加载中...' : '暂无节点'"
              :highlight-current-row="true"
              :row-key="(row: any) => row.nodeId"
              border
            >
            <el-table-column
              label="选择"
              width="120"
              align="center"
              fixed="left"
            >
              <template #default="{ row }">
                <el-checkbox
                  :model-value="selectedNodeIds.includes(row.nodeId)"
                  :disabled="row.status !== 1"
                  @change="() => toggleNodeSelection(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="nodeId" label="节点ID" width="220" fixed="left" />
            <el-table-column prop="nodeIp" label="节点IP" min-width="120" />
            <el-table-column prop="nodePort" label="端口" min-width="80" />
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                  {{ row.status === 1 ? '正常' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="任务数" min-width="100">
              <template #default="{ row }">
                <el-tag type="warning" size="small">{{ row.taskCount}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="线程数" min-width="120">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.threadNum"
                  :min="1"
                  :max="20"
                  :disabled="row.status !== 1"
                  size="small"
                  style="width: 90px;"
                  placeholder="线程数"
                />
              </template>
            </el-table-column>
          </el-table>
            </div>
          <el-button @click="handleRefreshNode" :loading="nodeLoading" icon="refresh" circle style="margin-top: 2px;" title="刷新节点" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="taskOptionsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTaskOptions">
            确认启动
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormRules } from 'element-plus';
import type { Website } from '../types/website';
import { websiteApi } from '../api/website';
import { taskApi } from '../api/task';
import { useRouter } from 'vue-router';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus'; // For delete confirmation
import { onMounted, watch } from 'vue';
import { InfoFilled, Setting, Connection, Plus, Upload, Delete } from '@element-plus/icons-vue';
import { nodeApi } from '../api/node';

const router = useRouter();

onMounted(() => {
  fetchData();
  initColumnSettings();

  // Watch baseUrl changes and extract domain
  watch(
    () => websiteForm.baseUrl,
    (newUrl) => {
      if (newUrl && !isDomainAutoFilled.value) {
        try {
          const urlObj = new URL(newUrl);
          websiteForm.domain = urlObj.hostname;
          isDomainAutoFilled.value = true;
        } catch {
          websiteForm.domain = '';
          isDomainAutoFilled.value = false;
        }
      }
    }
  );

  // Watch domain changes to reset auto-fill flag
  watch(
    () => websiteForm.domain,
    (newDomain) => {
      if (newDomain !== websiteForm.domain) {
        isDomainAutoFilled.value = false;
      }
    }
  );

  // Watch table data changes to sync with form data in table mode
  watch(
    [() => headersTableData.value, () => cookiesTableData.value],
    () => {
      if (httpConfigMode.value === 'table') {
        websiteForm.headers = tableDataToText(headersTableData.value, ': ');
        websiteForm.cookies = tableDataToText(cookiesTableData.value, '=');
      }
    },
    { deep: true }
  );
});

// --- State ---

const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  name: '',
  baseUrl: '',
  domain: '',
  charset: '',
  timeOut: null as number | null,
  retryTimes: null as number | null,
  cycleRetryTimes: null as number | null
});
const loading = ref(false); // For table loading state
const dialogVisible = ref(false);
const isEditMode = ref(false);
const websiteFormRef = ref<FormInstance>();
const currentWebsiteId = ref<number | null>(null);
const websiteForm = reactive({
  name: '',
  baseUrl: '',
  domain: '',
  charset: '',
  headers: '',
  cookies: '',
  timeOut: 3, // Default to 3 seconds (will be converted to ms in submit)
  retryTimes: 0,
  cycleRetryTimes: 0
});

const isDomainAutoFilled = ref(false);

// HTTP配置模式切换
const httpConfigMode = ref<'text' | 'table'>('text');
const headersTableData = ref<Array<{key: string, value: string, id: string}>>([]);
const cookiesTableData = ref<Array<{key: string, value: string, id: string}>>([]);
const importDialogVisible = ref(false);
const importType = ref<'headers' | 'cookies'>('headers');
const importText = ref('');

// 任务选项对话框相关
const taskOptionsDialogVisible = ref(false);
const taskOptionsFormRef = ref<FormInstance>();
const currentTaskWebsite = ref<Website | null>(null);

const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入网站名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  baseUrl: [
    { required: true, message: '请输入基础URL', trigger: 'blur' },
    {
      pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/ \w \.-]*)*\/?$/,
      message: '请输入有效的URL', trigger: 'blur'
    }
  ],
  domain: [
    { required: true, message: '请输入域名', trigger: 'blur' },
    {
      pattern: /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/,
      message: '请输入有效的域名', trigger: 'blur'
    }
  ],
  charset: [
    { pattern: /^[a-zA-Z0-9-]+$/, message: '请输入有效的字符编码', trigger: 'blur' }
  ],
  timeOut: [
    { type: 'number', min: 1, max: 60, message: '超时时间必须在1-60秒之间', trigger: 'blur' }
  ],
  retryTimes: [
    { type: 'number', min: 0, max: 10, message: '重试次数必须在0-10次之间', trigger: 'blur' }
  ],
  cycleRetryTimes: [
    { type: 'number', min: 0, max: 10, message: '循环重试次数必须在0-10次之间', trigger: 'blur' }
  ]
});

// 任务选项表单验证规则（移除线程数相关）
const taskOptionsRules = reactive<FormRules>({});

// Table data
const tableData = ref<Website[]>([
  {
    id: 1,
    name: '示例网站',
    baseUrl: 'https://example.com',
    domain: 'example.com',
  },
  // Add more sample data rows if needed
]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 1, // Total items based on the image
});

type SpiderNodeWithThread = {
  nodeId: string;
  nodeIp: string;
  nodePort: number;
  status: number;
  taskCount: number;
  threadNum: number;
};

const nodeList = ref<SpiderNodeWithThread[]>([]);
const nodeLoading = ref(false);
const selectedNodeIds = ref<string[]>([]);
const selectedNodes = ref<SpiderNodeWithThread[]>([]);


// --- Methods ---

// HTTP配置相关方法
const switchHttpConfigMode = (mode: 'text' | 'table') => {
  if (mode === 'table' && httpConfigMode.value === 'text') {
    // 从文本模式切换到表格模式，转换数据
    const convertedHeaders = textToTableData(websiteForm.headers, ': ');
    const convertedCookies = textToTableData(websiteForm.cookies, '=');
    
    // 如果没有数据，添加一些示例行
    headersTableData.value = convertedHeaders.length > 0 ? convertedHeaders : [
      { id: `${Date.now()}-1`, key: '', value: '' }
    ];
    cookiesTableData.value = convertedCookies.length > 0 ? convertedCookies : [
      { id: `${Date.now()}-2`, key: '', value: '' }
    ];
  } else if (mode === 'text' && httpConfigMode.value === 'table') {
    // 从表格模式切换到文本模式，转换数据
    websiteForm.headers = tableDataToText(headersTableData.value, ': ');
    websiteForm.cookies = tableDataToText(cookiesTableData.value, '=');
  }
  httpConfigMode.value = mode;
};

const textToTableData = (text: string, separator: string) => {
  if (!text) return [];
  return text.split('\n')
    .filter(line => line.trim())
    .map((line, index) => {
      const separatorIndex = line.indexOf(separator);
      if (separatorIndex === -1) {
        return {
          id: `${Date.now()}-${index}`,
          key: line.trim(),
          value: ''
        };
      }
      return {
        id: `${Date.now()}-${index}`,
        key: line.substring(0, separatorIndex).trim(),
        value: line.substring(separatorIndex + separator.length).trim()
      };
    });
};

const tableDataToText = (tableData: Array<{key: string, value: string}>, separator: string) => {
  return tableData
    .filter(item => item.key.trim())
    .map(item => `${item.key}${separator} ${item.value}`)
    .join('\n');
};

const addTableRow = (type: 'headers' | 'cookies') => {
  const newRow = {
    id: `${Date.now()}-${Math.random()}`,
    key: '',
    value: ''
  };
  if (type === 'headers') {
    headersTableData.value.push(newRow);
  } else {
    cookiesTableData.value.push(newRow);
  }
};

const removeTableRow = (type: 'headers' | 'cookies', id: string) => {
  if (type === 'headers') {
    headersTableData.value = headersTableData.value.filter(item => item.id !== id);
  } else {
    cookiesTableData.value = cookiesTableData.value.filter(item => item.id !== id);
  }
};

const handleImport = (type: 'headers' | 'cookies') => {
  importType.value = type;
  importText.value = '';
  importDialogVisible.value = true;
};

const confirmImport = () => {
  if (!importText.value.trim()) {
    ElMessage.warning('请输入要导入的内容');
    return;
  }
  
  const separator = importType.value === 'headers' ? ':' : '=';
  const importedData = textToTableData(importText.value, separator);
  
  if (importType.value === 'headers') {
    headersTableData.value = [...headersTableData.value, ...importedData];
  } else {
    cookiesTableData.value = [...cookiesTableData.value, ...importedData];
  }
  
  ElMessage.success(`成功导入 ${importedData.length} 条${importType.value === 'headers' ? '请求头' : 'Cookie'}记录`);
  importDialogVisible.value = false;
};

// 工具函数：将字符串格式转换为对象格式
const convertToObject = (str: string | undefined, separator: string) => {
  if (!str) return '';
  const result: Record<string, string> = {};
  str.split('\n')
    .filter(line => line.trim())
    .forEach(line => {
      const [key, value] = line.split(separator).map(item => item.trim());
      if (key && value) {
        result[key] = value;
      }
    });
  return result;
};

// 工具函数：将对象格式转换为字符串格式
const convertToString = (obj: Record<string, string> | string | undefined, separator: string) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return Object.entries(obj)
    .map(([key, value]) => `${key}${separator}${value}`)
    .join('\n');
};

const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await websiteApi.list({
      page: pagination.currentPage,
      size: pagination.pageSize,
      name: searchForm.name,
      baseUrl: searchForm.baseUrl,
      domain: searchForm.domain
    });
    // 转换后端返回的数据格式
    tableData.value = data.records.map(record => ({
      ...record,
      headers: convertToString(record.headers, ': '),
      cookies: convertToString(record.cookies, '='),
      timeOut: record.timeOut ? record.timeOut / 1000 : undefined
    }));
    pagination.total = data.total;
  } catch (error) {
    ElMessage.error('获取网站列表失败');
  } finally {
    loading.value = false;
  }
};

// 修改submitWebsiteForm函数
const submitWebsiteForm = async () => {
  if (!websiteFormRef.value) return;

  // 如果是表格模式，先同步数据到表单
  if (httpConfigMode.value === 'table') {
    websiteForm.headers = tableDataToText(headersTableData.value, ': ');
    websiteForm.cookies = tableDataToText(cookiesTableData.value, '=');
  }

  await websiteFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const formData: any = {
          ...websiteForm,
          timeOut: websiteForm.timeOut * 1000, // Convert seconds to milliseconds
          headers: websiteForm.headers,
          cookies: websiteForm.cookies
        };

        if (isEditMode.value && currentWebsiteId.value) {
          formData.id = currentWebsiteId.value;
          await websiteApi.update(formData);
          ElMessage.success('更新成功');
        } else {
          const { id, ...createData } = formData;
          await websiteApi.create(createData);
          ElMessage.success('创建成功');
        }

        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        ElMessage.error(isEditMode.value ? '更新失败' : '创建失败');
      }
    }
  });
};

// 修改handleEdit函数
const handleEdit = async (row: Website) => {
  try {
    loading.value = true;
    const response = await websiteApi.getById(row.id);
    const website = response.data || response; // Handle both response formats
    isEditMode.value = true;
    currentWebsiteId.value = row.id;
    Object.assign(websiteForm, {
      ...website,
      timeOut: website.timeOut ? website.timeOut / 1000 : 3, // Convert milliseconds to seconds for display
      headers: convertToString(website.headers, ': '),
      cookies: convertToString(website.cookies, '=')
    });
    
    // 同时更新表格数据
    headersTableData.value = textToTableData(websiteForm.headers, ': ');
    cookiesTableData.value = textToTableData(websiteForm.cookies, '=');
    
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取网站信息失败');
  } finally {
    loading.value = false;
  }
};
const handleSearch = () => {
  pagination.currentPage = 1; // Reset to first page on search
  fetchData(); // Call API or filter local data
};
const handleReset = () => {
  searchFormRef.value?.resetFields();
  // Reset status specifically if not handled by resetFields or if you want a different default
  pagination.currentPage = 1;
  fetchData(); // Fetch data with default filters
};
const handleAddWebsite = () => {
  isEditMode.value = false;
  currentWebsiteId.value = null;
  websiteForm.name = '';
  websiteForm.baseUrl = '';
  websiteForm.domain = '';
  websiteForm.charset = '';
  websiteForm.headers = '';
  websiteForm.cookies = '';
  websiteForm.timeOut = 3;
  websiteForm.retryTimes = 0;
  websiteForm.cycleRetryTimes = 0;
  isDomainAutoFilled.value = false;
  
  // 重置HTTP配置
  httpConfigMode.value = 'text';
  headersTableData.value = [];
  cookiesTableData.value = [];
  
  dialogVisible.value = true;
};
const handleTableRefresh = () => {
  console.log('Table Refresh clicked');
  fetchData(); // Re-fetch data
};
const columnSettingsVisible = ref(false);
const columnSettings = ref<Record<string, boolean>>({
  id: true,
  name: true,
  baseUrl: true,
  domain: true,
  charset: true,
  headers: true,
  cookies: true,
  timeOut: true,
  retryTimes: true,
  cycleRetryTimes: true
});
const visibleColumns = ref<string[]>([]);

const columnOptions = [
  { label: 'ID', prop: 'id' },
  { label: '网站名称', prop: 'name' },
  { label: '基础URL', prop: 'baseUrl' },
  { label: '域名', prop: 'domain' },
  { label: '字符编码', prop: 'charset' },
  { label: '请求头', prop: 'headers' },
  { label: 'Cookie', prop: 'cookies' },
  { label: '超时时间', prop: 'timeOut' },
  { label: '重试次数', prop: 'retryTimes' },
  { label: '循环重试次数', prop: 'cycleRetryTimes' }
];
const initColumnSettings = () => {
  try {
    const savedSettings = localStorage.getItem('websiteTableColumnSettings');
    if (savedSettings) {
      columnSettings.value = JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Failed to load column settings:', error);
  }
};
const saveColumnSettings = () => {
  // 从 visibleColumns 更新 columnSettings
  Object.keys(columnSettings.value).forEach(key => {
    columnSettings.value[key] = visibleColumns.value.includes(key);
  });

  // 先验证设置
  if (!validateColumnSettings()) {
    return;
  }

  try {
    localStorage.setItem('websiteTableColumnSettings', JSON.stringify(columnSettings.value));
    columnSettingsVisible.value = false;
    ElMessage.success('表格设置已保存');
  } catch (error) {
    console.error('Failed to save column settings:', error);
    ElMessage.error('保存设置失败');
  }
};
const resetColumnSettings = () => {
  visibleColumns.value = columnOptions.map(option => option.prop);
  ElMessage.success('已重置为默认设置');
};
const validateColumnSettings = () => {
  // 确保至少选择了ID和网站名称列
  if (!visibleColumns.value.includes('id') || !visibleColumns.value.includes('name')) {
    ElMessage.warning('ID和网站名称列为必选项，不能隐藏');
    // 自动勾选
    if (!visibleColumns.value.includes('id')) {
      visibleColumns.value.push('id');
    }
    if (!visibleColumns.value.includes('name')) {
      visibleColumns.value.push('name');
    }
    return false;
  }
  return true;
};
const handleTableSettings = () => {
  // 打开对话框时，根据当前的 columnSettings 初始化 visibleColumns
  visibleColumns.value = Object.entries(columnSettings.value)
    .filter(([_, visible]) => visible)
    .map(([prop]) => prop);
  columnSettingsVisible.value = true;
};
const handleDelete = (row: Website) => {
  ElMessageBox.confirm(`确定要删除网站 '${row.name}' 吗?`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await websiteApi.delete(row.id);
        ElMessage({ type: 'success', message: '删除成功' });
        fetchData();
      } catch (error) {
        console.error('Failed to delete website:', error);
        ElMessage.error('删除网站失败');
      }
    })
    .catch(() => {
      ElMessage({ type: 'info', message: '已取消删除' });
    });
};
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
  pagination.pageSize = val;
  pagination.currentPage = 1; // Go to first page when size changes
  fetchData();
};
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`);
  pagination.currentPage = val;
  fetchData();
};
// 启动采集功能 - 显示选项对话框
const handleStartCrawl = (row: Website) => {
  currentTaskWebsite.value = row;
  taskOptionsDialogVisible.value = true;
  selectedNodeIds.value = [];
  fetchNodeList();
};
// 提交任务选项并启动任务
const submitTaskOptions = async () => {
  if (!currentTaskWebsite.value) return;
  if (selectedNodeIds.value.length === 0) {
    ElMessage.warning('请选择至少一个节点');
    return;
  }
  
  // 验证所有选中节点的线程数
  const selectedNodes = nodeList.value.filter(node => selectedNodeIds.value.includes(node.nodeId));
  for (const node of selectedNodes) {
    if (!node.threadNum || node.threadNum < 1 || node.threadNum > 20) {
      ElMessage.warning(`节点 ${node.nodeId} 的线程数必须在1-20之间`);
      return;
    }
  }
  
  try {
    loading.value = true;
    const website = currentTaskWebsite.value;

    await taskApi.run({
      websiteId: website.id,
      spiderNodes: selectedNodes
    });

    ElMessage.success(`已成功启动对网站 '${website.name}' 的采集任务，共选择 ${selectedNodeIds.value.length} 个节点`);
    taskOptionsDialogVisible.value = false;
  } catch (error) {
    ElMessage.error((error as Error).message || '操作失败');
  } finally {
    loading.value = false;
  }
};
// 跳转到动态配置页面
const handleConfig = (row: Website) => {
  router.push({
    name: 'website-config',
    query: {
      websiteId: row.id,
      websiteName: encodeURIComponent(row.name)
    }
  }
  )
};

// 在script部分添加以下方法
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const toggleExpand = (row: Website & { isHeadersExpanded?: boolean, isCookiesExpanded?: boolean }, field: 'headers' | 'cookies') => {
  if (field === 'headers') {
    row.isHeadersExpanded = !row.isHeadersExpanded;
  } else {
    row.isCookiesExpanded = !row.isCookiesExpanded;
  }
};

const fetchNodeList = async () => {
  nodeLoading.value = true;
  try {
    const { data } = await nodeApi.getNodeList();
    // 为每个节点添加 threadNum 字段，默认 2
    nodeList.value = data.map((node: any) => ({ ...node, threadNum: 1 }));

    // 遍历 nodeList，如果 taskCount 为 null，初始化为 0
    nodeList.value.forEach(node => {
      if (node.taskCount === null) {
        node.taskCount = 0;
      }
    });
  } catch (e) {
    ElMessage.error('获取节点列表失败');
  } finally {
    nodeLoading.value = false;
  }
};

const handleRefreshNode = async () => {
  nodeLoading.value = true;
  try {
    await nodeApi.refreshNode();
    await fetchNodeList();
    ElMessage.success('节点列表已刷新');
  } catch (e) {
    ElMessage.error('刷新节点失败');
  } finally {
    nodeLoading.value = false;
  }
};

const changeColumnSetting = (prop: string, val: boolean) => {
  // 这个函数现在可以被简化或移除，因为我们直接操作 visibleColumns
  const index = visibleColumns.value.indexOf(prop);
  if (val && index === -1) {
    visibleColumns.value.push(prop);
  } else if (!val && index > -1) {
    visibleColumns.value.splice(index, 1);
  }
};

// 统一的节点选择/取消选择处理函数
const toggleNodeSelection = (node: SpiderNodeWithThread) => {
  if (node.status !== 1) return; // 离线节点不可选

  const index = selectedNodeIds.value.indexOf(node.nodeId);
  if (index > -1) {
    // 如果已选中，则取消选择
    selectedNodeIds.value.splice(index, 1);
    selectedNodes.value = selectedNodes.value.filter(n => n.nodeId !== node.nodeId);
  } else {
    // 如果未选中，则添加选择
    selectedNodeIds.value.push(node.nodeId);
    selectedNodes.value.push(node);
  }
};

// 节点表格多选逻辑
const handleNodeSelectionChange = (node: SpiderNodeWithThread, val: boolean) => {
  // 此函数保留为空，因为所有逻辑都由 toggleNodeSelection 通过 @change 事件处理
};

const handleNodeRowClick = (row: SpiderNodeWithThread) => {
  toggleNodeSelection(row);
};
// 高亮选中行
const nodeTableRowClassName = ({ row }: { row: SpiderNodeWithThread }) => {
  return selectedNodeIds.value.includes(row.nodeId) ? 'selected-node-row' : '';
};

</script>

<style scoped>
.website-list-container {
  padding: 12px;
  background: #f0f2f5;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.search-card {
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.search-form .form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.search-form .form-row:last-child {
  margin-bottom: 0;
}

.el-form--inline .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}

.el-input-number {
  width: 100%;
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

.info-icon {
  margin-left: 8px;
  color: #909399;
  cursor: help;
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

.website-form .form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.form-container {
  display: flex;
  gap: 30px;
  min-height: 600px;
}

.form-left {
  flex: 5;
  padding-right: 20px;
  border-right: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-right {
  flex: 8;
  display: flex;
  flex-direction: column;
}

/* 分组样式 */
.form-group {
  background: #fafbfc;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.form-group-title .el-icon {
  color: #409eff;
}

.form-group-actions {
  margin-left: auto;
}

/* 行内布局 */
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.form-item-half {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .form-left {
    border-right: none;
    border-bottom: 1px solid #dcdfe6;
    padding-right: 0;
    padding-bottom: 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-item-half {
    flex: none;
  }
  
  .table-section-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .table-section-actions {
    justify-content: center;
  }
  
  .config-table :deep(.el-table) {
    font-size: 13px;
  }
}

.form-right :deep(.el-form-item__content) {
  width: 100%;
}

.form-right :deep(.el-textarea__inner) {
  font-family: monospace;
  white-space: pre-wrap;
}

.website-form .form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

.website-form .el-input-number {
  width: 100%;
}

.website-form .el-tooltip {
  width: 100%;
  display: block;
}

.column-settings-container {
  padding: 10px;
}

.settings-tip {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

.column-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.column-checkbox-group .el-checkbox {
  margin-right: 0;
  min-width: 120px;
}

/*
在style部分添加以下样式
*/

.truncated-text {
  cursor: pointer;
  color: var(--el-color-primary);
  white-space: pre-wrap;
}
.truncated-text:hover {
  text-decoration: underline;
}

.selected-node-row {
  background-color: #e6f7ff !important;
}
.el-table__body .el-radio {
  margin: 0 auto;
}
.el-table__body .el-input-number {
  margin: 0 auto;
}

/* 节点表格滚动优化 */
.node-table-container {
  overflow-x: auto;
  border-radius: 6px;
}

.node-table-container :deep(.el-table) {
  border-radius: 6px;
}

.node-table-container :deep(.el-table__fixed) {
  border-radius: 6px 0 0 6px;
}

.node-table-container :deep(.el-table__fixed-right) {
  border-radius: 0 6px 6px 0;
}

/* HTTP配置表格样式 */
.table-section {
  max-width:99%;
  margin-bottom: 20px;
}

.table-section:last-child {
  margin-bottom: 0;
}

.table-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #dcdfe6;
  border-radius: 6px 6px 0 0;
  border-bottom: none;
}

.table-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #495057;
}

.table-section-title .el-icon {
  color: #409eff;
}

.table-section-actions {
  display: flex;
  gap: 8px;
}

.config-table {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-top: none;
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}

.config-table :deep(.el-table) {
  border: none;
  border-radius: 0 0 6px 6px;
}

.config-table :deep(.el-table__border-left-patch) {
  display: none;
}

.config-table :deep(.el-table__border-right-patch) {
  display: none;
}

.config-table :deep(.el-table__empty-text) {
  color: #909399;
  font-size: 14px;
}

/* 导入对话框样式 */
.import-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-tip {
  margin-bottom: 8px;
}

.import-tip :deep(.el-alert__content) {
  line-height: 1.6;
}

.import-tip p {
  margin: 4px 0;
  font-family: monospace;
  font-size: 13px;
  color: #666;
}

.import-tip p:first-child {
  font-family: inherit;
  color: #333;
  font-weight: 500;
}
</style>
