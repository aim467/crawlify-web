<template>
  <el-card shadow="never" class="table-card">
    <!-- Table Actions Header -->
    <div class="table-header">
      <div class="table-title">网站列表</div>
      <div class="table-actions">
        <el-button type="primary" icon="plus" @click="$emit('add')">新增网站</el-button>
        <el-button icon="refresh" circle @click="$emit('refresh')" />
        <el-button icon="setting" circle @click="handleTableSettings" />
      </div>
    </div>

    <!-- Table -->
    <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
      <el-table-column 
        prop="id" 
        label="ID" 
        width="80" 
        align="center" 
        fixed="left" 
        v-if="columnSettings.id" 
      />
      <el-table-column 
        prop="name" 
        label="网站名称" 
        min-width="150" 
        fixed="left" 
        v-if="columnSettings.name" 
      />
      <el-table-column 
        prop="baseUrl" 
        label="基础URL" 
        min-width="200" 
        v-if="columnSettings.baseUrl" 
      />
      <el-table-column 
        prop="domain" 
        label="域名" 
        min-width="180" 
        v-if="columnSettings.domain" 
      />
      <el-table-column 
        prop="charset" 
        label="字符编码" 
        min-width="180" 
        v-if="columnSettings.charset" 
      />
      <el-table-column 
        prop="headers" 
        label="请求头" 
        min-width="180" 
        v-if="columnSettings.headers"
      >
        <template #default="{ row }">
          <el-tooltip :content="row.headers" placement="top" :hide-after="0">
            <div class="truncated-text" @click="toggleExpand(row, 'headers')">
              {{ row.isHeadersExpanded ? row.headers : truncateText(row.headers, 50) }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column 
        prop="cookies" 
        label="cookie" 
        min-width="180" 
        v-if="columnSettings.cookies"
      >
        <template #default="{ row }">
          <el-tooltip :content="row.cookies" placement="top" :hide-after="0">
            <div class="truncated-text" @click="toggleExpand(row, 'cookies')">
              {{ row.isCookiesExpanded ? row.cookies : truncateText(row.cookies, 50) }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column 
        prop="timeOut" 
        label="超时时间" 
        min-width="180" 
        v-if="columnSettings.timeOut" 
      />
      <el-table-column 
        prop="retryTimes" 
        label="重试次数" 
        min-width="180" 
        v-if="columnSettings.retryTimes" 
      />
      <el-table-column 
        prop="cycleRetryTimes" 
        label="循环重试次数" 
        min-width="180" 
        v-if="columnSettings.cycleRetryTimes" 
      />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-tooltip content="编辑" placement="top">
            <el-button link type="primary" icon="edit" @click="$emit('edit', row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="danger" icon="delete" @click="$emit('delete', row)" />
          </el-tooltip>
          <el-tooltip content="启动采集" placement="top">
            <el-button link type="success" icon="videoPlay" @click="$emit('start-crawl', row)" />
          </el-tooltip>
          <el-tooltip content="动态配置" placement="top">
            <el-button link type="warning" icon="setting" @click="$emit('config', row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination 
        :current-page="pagination.currentPage" 
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" 
        :total="pagination.total" 
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('size-change', $event)" 
        @current-change="$emit('current-change', $event)" 
        @update:current-page="$emit('update:current-page', $event)" 
        @update:page-size="$emit('update:page-size', $event)" 
      />
    </div>

    <!-- 表格列设置对话框 -->
    <el-dialog v-model="columnSettingsVisible" title="表格列设置" width="500px">
      <div class="column-settings-container">
        <p class="settings-tip">请选择要显示的列：</p>
        <el-checkbox-group v-model="visibleColumns" class="column-checkbox-group">
          <el-checkbox 
            v-for="option in columnOptions" 
            :key="option.prop" 
            :label="option.prop"
            @change="(val: boolean) => changeColumnSetting(option.prop, val)"
          >
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
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { Website } from '../../types/website';
import type { Pagination } from '../../composables/useWebsiteList';

interface Props {
  tableData: Website[];
  loading: boolean;
  pagination: Pagination;
}

interface Emits {
  (e: 'add'): void;
  (e: 'edit', row: Website): void;
  (e: 'delete', row: Website): void;
  (e: 'start-crawl', row: Website): void;
  (e: 'config', row: Website): void;
  (e: 'refresh'): void;
  (e: 'size-change', size: number): void;
  (e: 'current-change', page: number): void;
  (e: 'update:current-page', page: number): void;
  (e: 'update:page-size', size: number): void;
}

defineProps<Props>();
defineEmits<Emits>();

// 列设置相关
const columnSettingsVisible = ref(false);
const columnSettings = ref<Record<string, boolean>>({
  id: true,
  name: true,
  baseUrl: true,
  domain: true,
  charset: true,
  headers: false,
  cookies: false,
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

// 工具函数
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

// 列设置相关方法
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

const handleTableSettings = () => {
  visibleColumns.value = Object.entries(columnSettings.value)
    .filter(([_, visible]) => visible)
    .map(([prop]) => prop);
  columnSettingsVisible.value = true;
};

const saveColumnSettings = () => {
  Object.keys(columnSettings.value).forEach(key => {
    columnSettings.value[key] = visibleColumns.value.includes(key);
  });

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
  if (!visibleColumns.value.includes('id') || !visibleColumns.value.includes('name')) {
    ElMessage.warning('ID和网站名称列为必选项，不能隐藏');
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

const changeColumnSetting = (prop: string, val: boolean) => {
  const index = visibleColumns.value.indexOf(prop);
  if (val && index === -1) {
    visibleColumns.value.push(prop);
  } else if (!val && index > -1) {
    visibleColumns.value.splice(index, 1);
  }
};

onMounted(() => {
  initColumnSettings();
});
</script>

<style scoped>
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

.truncated-text {
  cursor: pointer;
  color: var(--el-color-primary);
  white-space: pre-wrap;
}

.truncated-text:hover {
  text-decoration: underline;
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
</style> 