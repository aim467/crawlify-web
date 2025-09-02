<template>
  <div class="template-management-container">
    <!-- Tab 导航 -->
    <el-card shadow="never" class="tab-card">
      <el-tabs v-model="activeTab" class="template-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="模板配置" name="config">
          <template #label>
            <div class="tab-label">
              <el-icon><Setting /></el-icon>
              <span>模板配置</span>
            </div>
          </template>
        </el-tab-pane>
        <el-tab-pane label="模板任务" name="task">
          <template #label>
            <div class="tab-label">
              <el-icon><Timer /></el-icon>
              <span>模板任务</span>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 模板配置页面 -->
    <div v-show="activeTab === 'config'" class="tab-content">
      <TemplateConfigTab 
        ref="configTabRef"
        :table-height="configTableHeight"
        @code-edit="handleCodeEdit"
      />
    </div>

    <!-- 模板任务页面 -->
    <div v-show="activeTab === 'task'" class="tab-content">
      <TemplateTaskTab 
        ref="taskTabRef"
        :table-height="taskTableHeight"
        :config-options="configOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Setting, Timer } from '@element-plus/icons-vue';
import { templateConfigApi } from '../api/templateConfig';
import type { TemplateConfig } from '../types/templateConfig';
import TemplateConfigTab from '../components/template/TemplateConfigTab.vue';
import TemplateTaskTab from '../components/template/TemplateTaskTab.vue';

// Tab 管理
const activeTab = ref('config');

// 引用
const configTabRef = ref();
const taskTabRef = ref();

// 配置选项列表（用于任务表单）
const configOptions = ref<TemplateConfig[]>([]);

// 窗口高度响应式数据
const windowHeight = ref(0);

// 配置表格高度计算
const configTableHeight = computed(() => {
  if (windowHeight.value > 0) {
    const headerHeight = 60;  // 页面头部
    const tabHeight = 60;     // Tab导航高度
    const searchHeight = 80;  // 搜索表单高度
    const tableHeaderHeight = 80; // 表格头部操作区高度
    const paginationHeight = 60; // 分页高度
    const padding = 40;       // 各种边距
    
    const availableHeight = windowHeight.value - headerHeight - tabHeight - searchHeight - tableHeaderHeight - paginationHeight - padding;
    return Math.max(300, Math.min(availableHeight, 700)); // 最小300px，最大700px
  }
  return 450; // 默认高度
});

// 任务表格高度计算  
const taskTableHeight = computed(() => {
  if (windowHeight.value > 0) {
    const headerHeight = 60;  // 页面头部
    const tabHeight = 60;     // Tab导航高度
    const searchHeight = 120; // 任务搜索表单高度（任务搜索字段更多）
    const tableHeaderHeight = 80; // 表格头部操作区高度
    const paginationHeight = 60; // 分页高度
    const padding = 40;       // 各种边距
    
    const availableHeight = windowHeight.value - headerHeight - tabHeight - searchHeight - tableHeaderHeight - paginationHeight - padding;
    return Math.max(300, Math.min(availableHeight, 700)); // 最小300px，最大700px
  }
  return 400; // 默认高度
});

// 更新窗口高度
const updateWindowHeight = () => {
  if (typeof window !== 'undefined') {
    windowHeight.value = window.innerHeight;
  }
};

// 获取配置选项列表
const fetchConfigOptions = async () => {
  try {
    const { data } = await templateConfigApi.list({
      page: 1,
      size: 1000, // 获取所有配置作为选项
    });
    
    if (data?.records) {
      configOptions.value = data.records;
    }
  } catch (error) {
    console.error('获取配置选项失败:', error);
  }
};

// Tab 切换处理
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
  if (tabName === 'task') {
    taskTabRef.value?.refresh();
    fetchConfigOptions(); // 获取配置选项
  } else if (tabName === 'config') {
    configTabRef.value?.refresh();
  }
};

// 代码编辑处理
const handleCodeEdit = (template: TemplateConfig) => {
  // 这里可以根据需要添加额外的代码编辑逻辑
  console.log('代码编辑:', template);
};

// 初始化
onMounted(() => {
  fetchConfigOptions(); // 初始化时就加载配置选项
  
  // 初始化窗口高度
  updateWindowHeight();
  
  // 监听窗口大小变化
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateWindowHeight);
  }
});

// 清理监听器
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWindowHeight);
  }
});
</script>

<style scoped>
.template-management-container {
  padding: 12px;
  background: #f0f2f5;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-card {
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.tab-card :deep(.el-card__body) {
  padding: 0;
}

.template-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 6px 6px 0 0;
}

.template-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

.template-tabs :deep(.el-tabs__nav-scroll) {
  display: flex;
}

.template-tabs :deep(.el-tabs__item) {
  height: 60px;
  line-height: 60px;
  font-size: 15px;
  font-weight: 500;
  color: #6c757d;
  border: none;
  margin-right: 30px;
  padding: 0 15px;
  position: relative;
  transition: all 0.3s ease;
}

.template-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

.template-tabs :deep(.el-tabs__item:hover) {
  color: #667eea;
}

.template-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 3px;
  border-radius: 2px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-label .el-icon {
  font-size: 16px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .template-management-container {
    padding: 8px;
    height: 100vh;
    max-height: 100vh;
  }
  
  .template-tabs :deep(.el-tabs__item) {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    margin-right: 15px;
    padding: 0 10px;
  }
  
  .template-tabs :deep(.el-tabs__nav-wrap) {
    padding: 0 15px;
  }
  
  .tab-label {
    gap: 6px;
  }
  
  .tab-label .el-icon {
    font-size: 14px;
  }
  
  .tab-card {
    margin-bottom: 8px;
  }
}

/* 确保表格容器不会溢出 */
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>
