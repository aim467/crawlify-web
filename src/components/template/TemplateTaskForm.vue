<template>
  <el-drawer
    v-model="internalVisible"
    :title="isEditMode ? '编辑模板任务' : '新增模板任务'"
    direction="rtl"
    :size="drawerSize"
    :close-on-click-modal="false"
    class="task-drawer"
    destroy-on-close
  >
    <div class="drawer-content">
      <!-- 表单区域 -->
      <div class="form-content">
        <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
          <!-- 基础配置区域 -->
          <el-card shadow="never" class="form-section-card">
            <template #header>
              <div class="section-header">
                <i class="el-icon-setting"></i>
                <span>任务配置</span>
              </div>
            </template>
            
            <el-row :gutter="24">
              <el-col :span="24">
                <el-form-item label="关联配置" prop="configId">
                  <el-select 
                    v-model="formData.configId" 
                    placeholder="请选择模板配置" 
                    style="width: 100%"
                    filterable
                  >
                    <el-option 
                      v-for="config in configOptions" 
                      :key="config.configId" 
                      :label="`${config.configName} (${config.configId})`" 
                      :value="config.configId" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="父任务ID" prop="pid">
                  <el-input-number 
                    v-model="formData.pid" 
                    :min="0" 
                    style="width: 100%"
                    placeholder="可选，用于任务层级管理"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="任务状态" prop="status">
                  <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                    <el-option 
                      v-for="item in TASK_STATUS_OPTIONS" 
                      :key="item.value" 
                      :label="item.label" 
                      :value="item.value" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
        </el-form>
      </div>
      
      <!-- 抽屉底部操作栏 -->
      <div class="drawer-footer">
        <el-button @click="internalVisible = false" size="large">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
          {{ isEditMode ? '更新' : '创建' }}
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FormInstance } from 'element-plus';
import type { TemplateTask } from '../../types/templateTask';
import type { TemplateConfig } from '../../types/templateConfig';
import { TASK_STATUS_OPTIONS } from '../../types/templateTask';
import { templateTaskFormRules } from '../../utils/formValidators';

// Props
interface Props {
  visible: boolean;
  formData: TemplateTask;
  isEditMode: boolean;
  loading: boolean;
  configOptions: TemplateConfig[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean];
  'update:form-data': [formData: TemplateTask];
  submit: [];
}>();

// Refs
const formRef = ref<FormInstance>();

// Computed
const internalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const formRules = templateTaskFormRules;

// 任务抽屉大小
const drawerSize = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 768) return '95%';      // 手机端
    if (width < 1200) return '70%';     // 平板端
    return '50%';                       // 桌面端（任务表单相对简单）
  }
  return '60%';
});

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    emit('submit');
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};
</script>

<style scoped>
/* 任务抽屉样式 */
.task-drawer :deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.task-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 20px;
  margin-bottom: 0;
}

.task-drawer :deep(.el-drawer__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.task-drawer :deep(.el-drawer__close-btn) {
  color: white;
  font-size: 20px;
}

.task-drawer :deep(.el-drawer__close-btn):hover {
  color: rgba(255, 255, 255, 0.8);
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.drawer-footer {
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  padding: 20px;
  margin: 0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.form-section-card {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.form-section-card :deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 15px 20px;
}

.form-section-card :deep(.el-card__body) {
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.section-header i {
  margin-right: 8px;
  color: #409eff;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .task-drawer :deep(.el-drawer__header) {
    padding: 15px;
  }
  
  .form-content {
    padding: 15px;
  }
  
  .drawer-footer {
    padding: 15px;
  }
}
</style>
