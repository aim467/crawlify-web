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
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- Add/Edit Website Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑网站' : '新增网站'" width="90%" class="website-dialog">
      <el-form :model="websiteForm" ref="websiteFormRef" label-width="120px" :rules="formRules" class="website-form">
        <div class="form-container">
          <!-- 左侧基本信息 -->
          <div class="form-left">
            <el-form-item label="网站名称:" prop="name">
              <el-tooltip content="网站的名称，用于标识和区分不同的网站" placement="top" effect="light">
                <el-input v-model="websiteForm.name" placeholder="请输入网站名称，2-50个字符" style="width: 100%" />
              </el-tooltip>
            </el-form-item>
            <el-form-item label="基础URL:" prop="baseUrl">
              <el-tooltip content="网站的基础URL，用于构建完整的请求地址" placement="top" effect="light">
                <el-input v-model="websiteForm.baseUrl" placeholder="请输入基础URL，如https://example.com"
                  style="width: 100%" />
              </el-tooltip>
            </el-form-item>
            <el-form-item label="域名:" prop="domain">
              <el-tooltip content="网站的域名，会根据基础URL自动提取" placement="top" effect="light">
                <el-input v-model="websiteForm.domain" placeholder="请输入域名，如example.com" style="width: 100%" />
              </el-tooltip>
            </el-form-item>
            <el-form-item label="字符编码:" prop="charset">
              <el-tooltip content="网站使用的字符编码，如UTF-8、GBK等" placement="top" effect="light">
                <el-input v-model="websiteForm.charset" placeholder="请输入字符编码，如UTF-8" style="width: 100%" />
              </el-tooltip>
            </el-form-item>
            <el-form-item label="超时时间:" prop="timeOut">
              <el-tooltip content="请求超时时间，单位为秒" placement="top" effect="light">
                <el-input-number v-model="websiteForm.timeOut" :min="1" :max="60" placeholder="请输入超时时间(秒)"
                  style="width: 100%" />
              </el-tooltip>
            </el-form-item>
            <el-form-item label="重试次数:" prop="retryTimes">
              <el-tooltip content="请求失败后的重试次数" placement="top" effect="light">
                <el-input-number v-model="websiteForm.retryTimes" :min="0" :max="10" placeholder="请输入重试次数"
                  style="width: 100%" />
              </el-tooltip>
            </el-form-item>
            <el-form-item label="循环重试次数:" prop="cycleRetryTimes">
              <el-tooltip content="所有重试失败后的循环重试次数" placement="top" effect="light">
                <el-input-number v-model="websiteForm.cycleRetryTimes" :min="0" :max="10" placeholder="请输入循环重试次数"
                  style="width: 100%" />
              </el-tooltip>
            </el-form-item>
          </div>

          <!-- 右侧请求头和Cookie -->
          <div class="form-right">
            <el-form-item label="请求头:" prop="headers">
              <el-input v-model="websiteForm.headers" type="textarea" :rows="15"
                :autosize="{ minRows: 15, maxRows: 20 }" placeholder="请输入请求头，格式如：User-Agent: Mozilla/5.0"
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
                :autosize="{ minRows: 15, maxRows: 20 }" placeholder="请输入Cookie，格式如：name=value; name2=value2"
                resize="vertical">
                <template #prepend>
                  <el-tooltip content="发送请求时携带的Cookie信息，用于模拟登录状态等" placement="top" effect="light">
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>
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
            @change="(val) => columnSettings[option.prop] = val">
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

    <!-- 启动任务选项对话框 -->
    <el-dialog v-model="taskOptionsDialogVisible" title="启动采集任务" width="500px">
      <el-form :model="taskOptionsForm" ref="taskOptionsFormRef" label-width="100px" :rules="taskOptionsRules">
        <el-form-item label="线程数:" prop="threadNum">
          <el-tooltip content="设置爬虫任务的线程数，数值越大爬取速度越快，但可能会增加服务器负载" placement="top" effect="light">
            <el-input-number v-model="taskOptionsForm.threadNum" :min="1" :max="20" placeholder="请输入线程数" />
          </el-tooltip>
        </el-form-item>
      </el-form>
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
import { InfoFilled } from '@element-plus/icons-vue';

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
  timeOut: 5000,
  retryTimes: 0,
  cycleRetryTimes: 0
});

const isDomainAutoFilled = ref(false);

// 任务选项对话框相关
const taskOptionsDialogVisible = ref(false);
const taskOptionsFormRef = ref<FormInstance>();
const currentTaskWebsite = ref<Website | null>(null);
const taskOptionsForm = reactive({
  threadNum: 5
});

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

// 任务选项表单验证规则
const taskOptionsRules = reactive<FormRules>({
  threadNum: [
    { required: true, message: '请输入线程数', trigger: 'blur' },
    { type: 'number', min: 1, max: 20, message: '线程数必须在1-20之间', trigger: 'blur' }
  ]
});


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

// --- Methods ---
// 工具函数：将字符串格式转换为对象格式
const convertToObject = (str: string, separator: string) => {
  if (!str) return {};
  const result = {};
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
const convertToString = (obj: Record<string, string>, separator: string) => {
  if (!obj || typeof obj !== 'object') return '';
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
      domain: searchForm.domain,
      charset: searchForm.charset,
      timeOut: searchForm.timeOut,
      retryTimes: searchForm.retryTimes,
      cycleRetryTimes: searchForm.cycleRetryTimes
    });
    // 转换后端返回的数据格式
    tableData.value = data.records.map(record => ({
      ...record,
      headers: convertToString(record.headers, ': '),
      cookies: convertToString(record.cookies, '=')
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

  await websiteFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const formData = {
          ...websiteForm,
          headers: convertToObject(websiteForm.headers, ': '),
          cookies: convertToObject(websiteForm.cookies, '=')
        };

        if (isEditMode.value && currentWebsiteId.value) {
          await websiteApi.update(currentWebsiteId.value, formData);
          ElMessage.success('更新成功');
        } else {
          await websiteApi.create(formData);
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
    const website = await websiteApi.getById(row.id);
    isEditMode.value = true;
    currentWebsiteId.value = row.id;
    Object.assign(websiteForm, {
      ...website,
      headers: convertToString(website.headers, ': '),
      cookies: convertToString(website.cookies, '=')
    });
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
  isDomainAutoFilled.value = false;
  dialogVisible.value = true;
};
const handleTableRefresh = () => {
  console.log('Table Refresh clicked');
  fetchData(); // Re-fetch data
};
const columnSettingsVisible = ref(false);
const columnSettings = ref({
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
const isUpdatingColumns = ref(false);
watch(
  columnSettings,
  (newSettings) => {
    if (isUpdatingColumns.value) return;

    isUpdatingColumns.value = true;
    visibleColumns.value = Object.entries(newSettings)
      .filter(([_, visible]) => visible)
      .map(([prop]) => prop);

    setTimeout(() => {
      isUpdatingColumns.value = false;
    }, 0);
  },
  { immediate: true, deep: true }
);
watch(
  visibleColumns,
  (newVisibleColumns) => {
    if (isUpdatingColumns.value) return;

    isUpdatingColumns.value = true;
    // 先将所有列设置为不可见
    Object.keys(columnSettings.value).forEach(key => {
      columnSettings.value[key] = false;
    });
    // 再将选中的列设置为可见
    newVisibleColumns.forEach(prop => {
      columnSettings.value[prop] = true;
    });

    setTimeout(() => {
      isUpdatingColumns.value = false;
    }, 0);
  },
  { deep: true }
);
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
  columnOptions.forEach(option => {
    columnSettings.value[option.prop] = true;
  });
  // 更新visibleColumns以匹配重置后的columnSettings
  visibleColumns.value = columnOptions.map(option => option.prop);
  ElMessage.success('已重置为默认设置');
};
const validateColumnSettings = () => {
  // 确保至少选择了ID和网站名称列
  if (!columnSettings.value.id || !columnSettings.value.name) {
    ElMessage.warning('ID和网站名称列为必选项，不能隐藏');
    columnSettings.value.id = true;
    columnSettings.value.name = true;
    // 更新visibleColumns
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
  taskOptionsForm.threadNum = 2; // 默认线程数
  taskOptionsDialogVisible.value = true;
};
// 提交任务选项并启动任务
const submitTaskOptions = async () => {
  if (!taskOptionsFormRef.value || !currentTaskWebsite.value) return;

  await taskOptionsFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true;
        // 调用API启动任务，传入线程数
        await taskApi.run({
          websiteId: currentTaskWebsite.value.id,
          threadNum: taskOptionsForm.threadNum
        });
        ElMessage.success(`已成功启动对网站 '${currentTaskWebsite.value.name}' 的采集任务`);
        taskOptionsDialogVisible.value = false;
      } catch (error) {
        console.error('Failed to start crawl task:', error);
        ElMessage.error('启动采集任务失败');
      } finally {
        loading.value = false;
      }
    }
  });
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

const toggleExpand = (row: any, field: 'headers' | 'cookies') => {
  if (field === 'headers') {
    row.isHeadersExpanded = !row.isHeadersExpanded;
  } else {
    row.isCookiesExpanded = !row.isCookiesExpanded;
  }
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
}

.form-left {
  flex: 3;
  padding-right: 20px;
  border-right: 1px solid #dcdfe6;
}

.form-right {
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 20px;
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

  &:hover {
    text-decoration: underline;
  }
}
</style>
