<template>
  <el-drawer
    v-model="internalVisible"
    title="代码编辑器"
    direction="rtl"
    :size="codeEditorSize"
    :close-on-click-modal="false"
    class="code-editor-drawer"
    destroy-on-close
  >
    <template #header>
      <div class="code-editor-header">
        <div class="header-title">
          <el-icon><DocumentCopy /></el-icon>
          <span>代码编辑器</span>
        </div>
        <div class="header-info" v-if="templateData">
          <el-tag type="info" size="small">{{ templateData.configName }}</el-tag>
        </div>
      </div>
    </template>
    
    <div class="code-editor-content">
      <CodeEditor 
        v-model="internalContent"
        :language="codeLanguage"
        :theme="codeTheme"
        placeholder="开始编写或上传代码文件..."
        @change="handleCodeChange"
      />
    </div>
    
    <template #footer>
      <div class="code-editor-footer">
        <el-button @click="internalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">
          保存代码
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DocumentCopy } from '@element-plus/icons-vue';
import type { TemplateConfig } from '../../types/templateConfig';
import { CodeEditor } from '../index';

// Props
interface Props {
  visible: boolean;
  content: string;
  templateData?: TemplateConfig | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean];
  'update:content': [content: string];
  save: [];
}>();

// Computed
const internalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const internalContent = computed({
  get: () => props.content,
  set: (value) => emit('update:content', value)
});

// 代码编辑器配置
const codeLanguage = 'javascript';
const codeTheme = 'light';

// 代码编辑器抽屉大小
const codeEditorSize = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 768) return '100%';     // 手机端全屏
    if (width < 1200) return '90%';     // 平板端
    return '80%';                       // 桌面端
  }
  return '80%';
});

// Methods
const handleCodeChange = (content: string) => {
  emit('update:content', typeof content === 'string' ? content : '');
};

const handleSave = () => {
  emit('save');
};
</script>

<style scoped>
/* 代码编辑器抽屉样式 */
.code-editor-drawer :deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.code-editor-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  margin-bottom: 0;
}

.code-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.header-title .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.header-info {
  display: flex;
  align-items: center;
}

.code-editor-content {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  overflow: hidden;
}

.code-editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border-top: 1px solid #e4e7ed;
}

.code-editor-drawer :deep(.el-drawer__close-btn) {
  color: white;
  font-size: 20px;
}

.code-editor-drawer :deep(.el-drawer__close-btn):hover {
  color: rgba(255, 255, 255, 0.8);
}

/* 代码编辑器响应式设计 */
@media (max-width: 768px) {
  .code-editor-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .code-editor-content {
    padding: 10px;
  }
  
  .code-editor-footer {
    padding: 15px;
    gap: 8px;
  }
  
  .code-editor-drawer :deep(.el-drawer__header) {
    padding: 15px;
  }
}

/* 代码编辑器内容区域 */
.code-editor-content :deep(.code-editor-container) {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
