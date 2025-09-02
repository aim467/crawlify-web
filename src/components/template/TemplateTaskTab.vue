<template>
  <div class="template-task-tab">
    <!-- 任务搜索表单 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto">
        <el-form-item label="任务ID:" prop="taskId">
          <el-input
            v-model="searchForm.taskId"
            placeholder="请输入任务ID"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="配置ID:" prop="configId">
          <el-input
            v-model="searchForm.configId"
            placeholder="请输入配置ID"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="任务状态:" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 160px">
            <el-option 
              v-for="item in TASK_STATUS_OPTIONS" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button
            type="primary"
            icon="Search"
            @click="handleSearch"
            :loading="loading"
          >
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务表格区域 -->
    <el-card shadow="never" class="table-card">
      <!-- 表格操作头部 -->
      <div class="table-header">
        <div class="table-title">
          模板任务列表
        </div>
        <div class="table-actions">
          <el-button type="primary" icon="Plus" @click="handleAdd">新增任务</el-button>
          <el-button icon="Refresh" circle @click="handleRefresh" />
        </div>
      </div>

      <!-- 任务表格 -->
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading" 
        border 
        :height="tableHeight"
      >
        <el-table-column prop="taskId" label="任务ID" width="280" align="center" fixed />
        <el-table-column prop="configId" label="配置ID" width="280" align="center" />
        <el-table-column prop="configName" label="配置名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="任务状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTaskStatusTag(row.status)" size="default">
              {{ getTaskStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pid" label="线程ID" width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.pid || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <!-- 运行中任务 -->
            <template v-if="row.status === '1'">
              <el-tooltip content="停止任务" placement="top">
                <el-button link type="warning" icon="VideoPause" @click="handleStop(row)" />
              </el-tooltip>
            </template>
            <!-- 已停止/失败任务 -->
            <template v-else-if="row.status === '2' || row.status === '4'">
              <el-tooltip content="启动任务" placement="top">
                <el-button link type="success" icon="VideoPlay" @click="handleStart(row)" />
              </el-tooltip>
              <el-tooltip content="重新启动" placement="top">
                <el-button link type="primary" icon="RefreshRight" @click="handleRestart(row)" />
              </el-tooltip>
            </template>
            <!-- 已完成任务 -->
            <template v-else-if="row.status === '3'">
              <el-tooltip content="重新启动" placement="top">
                <el-button link type="primary" icon="RefreshRight" @click="handleRestart(row)" />
              </el-tooltip>
            </template>
            
            <!-- 通用操作 -->
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEdit(row)" />
            </el-tooltip>
            <el-tooltip content="查看" placement="top">
              <el-button link type="info" icon="View" @click="handleView(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button 
                link 
                type="danger" 
                icon="Delete" 
                @click="handleDelete(row)"
                :disabled="row.status === '1'"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination 
          :current-page="pagination.currentPage" 
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" 
          :total="pagination.total" 
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange" 
          @current-change="handlePageCurrentChange" 
        />
      </div>
    </el-card>

    <!-- 任务表单抽屉 -->
    <TemplateTaskForm
      v-model:visible="taskFormDialog.dialogVisible.value"
      v-model:form-data="taskFormDialog.form"
      :is-edit-mode="taskFormDialog.isEditMode.value"
      :loading="taskFormDialog.submitLoading.value"
      :config-options="configOptions"
      @submit="submitTaskForm"
    />

    <!-- 查看任务详情弹窗 -->
    <TaskViewDialog
      v-model:visible="viewDialogVisible"
      :task-data="viewTask"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useTemplateTask } from '../../composables/useTemplateTask';
import { TASK_STATUS_OPTIONS, TASK_STATUS_MAP } from '../../types/templateTask';
import type { TemplateTask } from '../../types/templateTask';
import type { TemplateConfig } from '../../types/templateConfig';
import TemplateTaskForm from './TemplateTaskForm.vue';
import TaskViewDialog from './TaskViewDialog.vue';

// Props
interface Props {
  tableHeight?: number;
  configOptions?: TemplateConfig[];
}

const props = withDefaults(defineProps<Props>(), {
  tableHeight: 400,
  configOptions: () => []
});

// 使用模板任务逻辑
const {
  loading,
  tableData,
  searchForm,
  searchFormRef,
  pagination,
  taskFormDialog,
  viewDialogVisible,
  viewTask,
  fetchData,
  handleSearch,
  handleReset,
  handleRefresh,
  handleAdd,
  handleEdit,
  handleView,
  handleDelete,
  handleStart,
  handleStop,
  handleRestart,
  submitTaskForm,
  handlePageSizeChange,
  handlePageCurrentChange,
  setConfigOptions,
} = useTemplateTask();

// 获取任务状态标签样式
const getTaskStatusTag = (status: string) => {
  return TASK_STATUS_MAP[status as keyof typeof TASK_STATUS_MAP]?.type || 'default';
};

// 获取任务状态标签文本
const getTaskStatusLabel = (status: string) => {
  return TASK_STATUS_MAP[status as keyof typeof TASK_STATUS_MAP]?.label || '未知状态';
};

// 监听配置选项变化
watch(() => props.configOptions, (newOptions) => {
  setConfigOptions(newOptions);
}, { immediate: true });

// 初始化
onMounted(() => {
  fetchData();
});

// 暴露给父组件的方法
defineExpose({
  refresh: fetchData,
});
</script>

<style scoped>
.template-task-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  overflow: hidden;
  min-height: 0;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
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

/* 任务状态相关样式 */
.el-tag.el-tag--warning {
  background: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.el-tag.el-tag--success {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.el-tag.el-tag--danger {
  background: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.el-tag.el-tag--info {
  background: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}

/* 表格操作按钮样式优化 */
.el-table .el-button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
