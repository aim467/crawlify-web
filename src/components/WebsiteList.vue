<template>
  <div class="website-list-container">
    <!-- 搜索表单 -->
    <WebsiteSearchForm 
      ref="searchFormRef"
      :search-form="searchForm" 
      @search="handleSearch" 
      @reset="handleReset" 
    />

    <!-- 表格 -->
    <template v-if="!loading">
      <WebsiteTable 
        :table-data="tableData" 
        :loading="loading" 
        :pagination="pagination"
        @add="handleAddWebsite"
        @edit="handleEdit"
        @delete="handleDelete"
        @start-crawl="handleStartCrawl"
        @config="handleConfig"
        @refresh="fetchData"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </template>
    <template v-else>
      <el-skeleton :rows="5" animated />
    </template>

    <!-- 新增/编辑网站对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑网站' : '新增网站'" width="95%">
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

          <!-- 右侧HTTP配置 -->
          <div class="form-right">
            <HttpConfigPanel 
              v-model:headers="websiteForm.headers"
              v-model:cookies="websiteForm.cookies"
            />
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWebsiteForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 启动任务选项对话框 -->
    <TaskOptionsDialog 
      v-model="taskOptionsDialogVisible"
      :current-website="currentTaskWebsite"
      @submit="submitTaskOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import type { FormRules, FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

import type { Website } from '../types/website';
import { websiteApi } from '../api/website';
import { taskApi } from '../api/task';
import { convertToString, convertToObject } from '../utils/httpConfigUtils';
import { useWebsiteList } from '../composables/useWebsiteList';
import WebsiteSearchForm from '@/components/website/WebsiteSearchForm.vue';
import WebsiteTable from './website/WebsiteTable.vue';
import HttpConfigPanel from './website/HttpConfigPanel.vue';
import TaskOptionsDialog from '@/components/website/TaskOptionsDialog.vue';

const router = useRouter();



// 使用composable管理列表相关逻辑
const {
  loading,
  tableData,
  searchForm,
  pagination,
  fetchData,
  handleSearch,
  handleReset: originalHandleReset,
  handleDelete,
  handleSizeChange,
  handleCurrentChange
} = useWebsiteList();

// 搜索表单引用
const searchFormRef = ref<InstanceType<typeof WebsiteSearchForm>>();

// 重置方法，传递搜索表单引用
const handleReset = () => {
  originalHandleReset(searchFormRef.value?.searchFormRef);
};

// 对话框相关状态
const dialogVisible = ref(false);
const isEditMode = ref(false);
const websiteFormRef = ref<FormInstance>();
const currentWebsiteId = ref<number | null>(null);
const isDomainAutoFilled = ref(false);

// 网站表单数据
const websiteForm = reactive({
  name: '',
  baseUrl: '',
  domain: '',
  charset: '',
  headers: '',
  cookies: '',
  timeOut: 3,
  retryTimes: 0,
  cycleRetryTimes: 0
});

// 任务选项对话框相关
const taskOptionsDialogVisible = ref(false);
const currentTaskWebsite = ref<Website | null>(null);

// 表单验证规则
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

// 域名自动填充逻辑
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

watch(
  () => websiteForm.domain,
  () => {
    isDomainAutoFilled.value = false;
  }
);

// 新增网站
const handleAddWebsite = () => {
  isEditMode.value = false;
  currentWebsiteId.value = null;
  Object.assign(websiteForm, {
    name: '',
    baseUrl: '',
    domain: '',
    charset: '',
    headers: '',
    cookies: '',
    timeOut: 3,
    retryTimes: 0,
    cycleRetryTimes: 0
  });
  isDomainAutoFilled.value = false;
  dialogVisible.value = true;
};

// 编辑网站
const handleEdit = async (row: Website) => {
  try {
    loading.value = true;
    const response = await websiteApi.getById(row.id);
    const website = response.data || response;
    isEditMode.value = true;
    currentWebsiteId.value = row.id;
    Object.assign(websiteForm, {
      ...website,
      timeOut: website.timeOut ? website.timeOut / 1000 : 3,
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

// 提交网站表单
const submitWebsiteForm = async () => {
  if (!websiteFormRef.value) return;

  await websiteFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const formData: any = {
          ...websiteForm,
          timeOut: websiteForm.timeOut * 1000,
          headers: websiteForm.headers,
          cookies: websiteForm.cookies
        };
        // 将文本格式转换为对象格式供API使用
        formData.headers = convertToObject(formData.headers, ':');
        formData.cookies = convertToObject(formData.cookies, '=');
        
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

// 启动采集
const handleStartCrawl = (row: Website) => {
  currentTaskWebsite.value = row;
  taskOptionsDialogVisible.value = true;
};

// 提交任务选项
const submitTaskOptions = async (taskData: any) => {
  try {
    loading.value = true;
    await taskApi.run(taskData);
    ElMessage.success('任务启动成功');
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
  });
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.website-list-container {
  padding: 12px;
  background: #f0f2f5;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog) {
  margin: 0 !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

/* .website-form {
  max-height: 70vh;
  overflow-y: auto;
} */

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

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.form-item-half {
  flex: 1;
}

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
}
</style>
