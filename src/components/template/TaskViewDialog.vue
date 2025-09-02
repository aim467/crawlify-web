<template>
  <el-dialog 
    v-model="internalVisible" 
    title="查看任务详情" 
    width="800px"
    class="task-view-dialog"
  >
    <div class="task-view-container">
      <!-- 任务信息卡片 -->
      <el-card shadow="never" class="view-info-card">
        <template #header>
          <div class="card-header">
            <i class="el-icon-info-filled"></i>
            <span>任务信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="任务ID" label-align="right">
            <el-tag type="info">{{ taskData.taskId }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="配置ID" label-align="right">
            <el-tag type="primary">{{ taskData.configId }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="配置名称" label-align="right" :span="2">
            <span class="config-name">{{ taskData.configName || '未知配置' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="任务状态" label-align="right">
            <el-tag :type="getTaskStatusTag(taskData.status)" size="default">
              {{ getTaskStatusLabel(taskData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="父任务ID" label-align="right">
            <span>{{ taskData.pid || '无' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" label-align="right">
            <span class="time-info">{{ taskData.createdAt }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" label-align="right">
            <span class="time-info">{{ taskData.updatedAt }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TemplateTask } from '../../types/templateTask';
import { TASK_STATUS_MAP } from '../../types/templateTask';

// Props
interface Props {
  visible: boolean;
  taskData: TemplateTask;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean];
}>();

// Computed
const internalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 获取任务状态标签样式
const getTaskStatusTag = (status: string) => {
  return TASK_STATUS_MAP[status as keyof typeof TASK_STATUS_MAP]?.type || 'default';
};

// 获取任务状态标签文本
const getTaskStatusLabel = (status: string) => {
  return TASK_STATUS_MAP[status as keyof typeof TASK_STATUS_MAP]?.label || '未知状态';
};
</script>

<style scoped>
/* 任务查看详情样式 */
.task-view-dialog :deep(.el-dialog__body) {
  padding: 20px;
  background: #f8fafc;
}

.task-view-container {
  padding: 0;
}

.view-info-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.view-info-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  font-size: 15px;
}

.card-header i {
  margin-right: 8px;
  color: #6366f1;
  font-size: 16px;
}

.view-info-card :deep(.el-card__body) {
  padding: 20px;
}

.config-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}

.time-info {
  color: #6b7280;
  font-size: 13px;
  font-family: 'Monaco', monospace;
}
</style>
