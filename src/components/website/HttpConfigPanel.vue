<template>
  <div class="form-group">
    <div class="form-group-title">
      <el-icon><Connection /></el-icon>
      <span>HTTP配置</span>
      <div class="form-group-actions">
        <el-radio-group v-model="httpConfigMode" @change="handleModeChange" size="small">
          <el-radio-button label="text">文本模式</el-radio-button>
          <el-radio-button label="table">表格模式</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 文本模式 -->
    <template v-if="httpConfigMode === 'text'">
      <el-form-item label="请求头:" prop="headers">
        <el-input 
          :model-value="headers" 
          @update:model-value="$emit('update:headers', $event)"
          type="textarea" 
          :rows="15"
          :autosize="{ minRows: 15, maxRows: 20 }" 
          placeholder="请输入请求头，格式如：User-Agent: Mozilla/5.0&#10;Accept: text/html,application/xhtml+xml&#10;Accept-Language: zh-CN,zh;q=0.9"
          resize="vertical"
        >
          <template #prepend>
            <el-tooltip content="发送请求时使用的HTTP请求头，可以设置User-Agent等信息" placement="top" effect="light">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="Cookie:" prop="cookies">
        <el-input 
          :model-value="cookies" 
          @update:model-value="$emit('update:cookies', $event)"
          type="textarea" 
          :rows="15"
          :autosize="{ minRows: 15, maxRows: 20 }" 
          placeholder="请输入Cookie，格式如：name=value; name2=value2&#10;sessionId=abc123; userId=456"
          resize="vertical"
        >
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
          stripe
        >
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
          stripe
        >
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

    <!-- 导入HTTP配置对话框 -->
    <el-dialog v-model="importDialogVisible" :title="`导入${importType === 'headers' ? '请求头' : 'Cookie'}配置`" width="600px">
      <div class="import-dialog-content">
        <div class="import-tip">
          <el-alert 
            :title="`请输入${importType === 'headers' ? '请求头' : 'Cookie'}配置，每行一条记录`" 
            type="info" 
            show-icon 
            :closable="false"
          >
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
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { InfoFilled, Connection, Plus, Upload, Delete } from '@element-plus/icons-vue';
import { useHttpConfig } from '../../composables/useHttpConfig';

interface Props {
  headers: string;
  cookies: string;
}

interface Emits {
  (e: 'update:headers', value: string): void;
  (e: 'update:cookies', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const {
  httpConfigMode,
  headersTableData,
  cookiesTableData,
  importDialogVisible,
  importType,
  importText,
  headersText,
  cookiesText,
  switchHttpConfigMode,
  addTableRow,
  removeTableRow,
  handleImport,
  confirmImport
} = useHttpConfig();

const handleModeChange = (mode: 'text' | 'table') => {
  switchHttpConfigMode(mode, props.headers, props.cookies);
};

// 监听表格数据变化，同步到父组件
watch([headersText, cookiesText], () => {
  if (httpConfigMode.value === 'table') {
    emit('update:headers', headersText.value);
    emit('update:cookies', cookiesText.value);
  }
}, { deep: true });
</script>

<style scoped>
.form-group {
  background: #fafbfc;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
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

.table-section {
  max-width: 99%;
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

.config-table :deep(.el-table__empty-text) {
  color: #909399;
  font-size: 14px;
}

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

@media (max-width: 1200px) {
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
</style> 