<template>
  <el-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)" 
    title="启动采集任务" 
    width="65%"
    class="task-options-dialog"
    :close-on-click-modal="false"
  >
    <div class="dialog-content">
      <!-- 顶部信息卡片 -->
      <div class="info-card" v-if="currentWebsite">
        <div class="info-header">
          <div class="website-info">
            <h4 class="website-name">{{ currentWebsite?.name }}</h4>
            <p class="website-url">{{ currentWebsite?.baseUrl }}</p>
          </div>
          <el-tag type="primary" size="large" class="task-tag">
            <i class="el-icon-collection-tag"></i>
            采集任务配置
          </el-tag>
        </div>
      </div>

      <!-- 节点选择区域 -->
      <div class="node-selection-section">
        <div class="section-header">
          <div class="section-title">
            <i class="el-icon-server"></i>
            <span>选择执行节点</span>
            <el-tag v-if="selectedNodeIds.length > 0" type="success" size="small" class="selected-count">
              已选择 {{ selectedNodeIds.length }} 个节点
            </el-tag>
          </div>
          <el-button 
            @click="handleRefreshNode" 
            :loading="nodeLoading" 
            icon="Refresh" 
            type="primary" 
            plain
            size="small"
            class="refresh-btn"
          >
            刷新节点
          </el-button>
        </div>
        
        <div class="table-wrapper">
          <el-table
            :data="nodeList"
            class="nodes-table"
            height="360"
            @row-click="handleNodeRowClick"
            :row-class-name="nodeTableRowClassName"
            :empty-text="nodeLoading ? '加载中...' : '暂无可用节点'"
            :highlight-current-row="true"
            :row-key="getRowKey"
            stripe
          >
            <el-table-column
              label="选择"
              width="80"
              align="center"
              fixed="left"
            >
              <template #default="{ row }">
                <el-checkbox
                  :model-value="selectedNodeIds.includes(row.nodeId)"
                  :disabled="row.status !== 1"
                  @change="() => toggleNodeSelection(row)"
                  size="large"
                />
              </template>
            </el-table-column>
            
            <el-table-column prop="nodeId" label="节点ID" width="250" fixed="left">
              <template #default="{ row }">
                <div class="node-id-cell">
                  <i class="el-icon-cpu"></i>
                  <span class="node-id-text">{{ row.nodeId }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="节点信息" min-width="180">
              <template #default="{ row }">
                <div class="node-info-cell">
                  <div class="node-address">
                    <i class="el-icon-location"></i>
                    {{ row.nodeIp }}:{{ row.nodePort }}
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.status === 1 ? 'success' : 'danger'" 
                  :effect="row.status === 1 ? 'light' : 'plain'"
                  size="small"
                  class="status-tag"
                >
                  <i :class="row.status === 1 ? 'el-icon-check' : 'el-icon-close'"></i>
                  {{ row.status === 1 ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="当前任务" width="100" align="center">
              <template #default="{ row }">
                <div class="task-count-cell">
                  <el-badge :value="row.taskCount || 0" :max="99" class="task-badge">
                    <i class="el-icon-document"></i>
                  </el-badge>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="线程配置" width="200" align="center">
              <template #default="{ row }">
                <div class="thread-config-cell">
                  <el-input-number
                    v-model="row.threadNum"
                    :min="1"
                    :max="20"
                    :disabled="row.status !== 1"
                    size="small"
                    class="thread-input"
                    controls-position="right"
                  />
                  <span class="thread-unit">线程</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-info">
          <div class="selection-summary" v-if="selectedNodeIds.length > 0">
            <i class="el-icon-info"></i>
            <span>将在 {{ selectedNodeIds.length }} 个节点上启动采集任务</span>
          </div>
        </div>
        <div class="footer-actions">
          <el-button 
            @click="$emit('update:modelValue', false)"
            size="large"
            class="cancel-btn"
          >
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            size="large"
            class="submit-btn"
            :disabled="selectedNodeIds.length === 0"
          >
            <i class="el-icon-video-play"></i>
            确认启动任务
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { Website } from '../../types/website';
import { nodeApi } from '../../api/node';

interface SpiderNodeWithThread {
  nodeId: string;
  nodeIp: string;
  nodePort: number;
  status: number;
  taskCount: number;
  threadNum: number;
}

interface Props {
  modelValue: boolean;
  currentWebsite: Website | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const nodeList = ref<SpiderNodeWithThread[]>([]);
const nodeLoading = ref(false);
const selectedNodeIds = ref<string[]>([]);

// 计算属性
const currentWebsite = computed(() => props.currentWebsite);

// 获取行键
const getRowKey = (row: SpiderNodeWithThread) => row.nodeId;

// 节点表格行类名
const nodeTableRowClassName = ({ row }: { row: SpiderNodeWithThread }) => {
  return selectedNodeIds.value.includes(row.nodeId) ? 'selected-node-row' : '';
};

// 切换节点选择状态
const toggleNodeSelection = (node: SpiderNodeWithThread) => {
  if (node.status !== 1) return; // 离线节点不可选

  const index = selectedNodeIds.value.indexOf(node.nodeId);
  if (index > -1) {
    selectedNodeIds.value.splice(index, 1);
  } else {
    selectedNodeIds.value.push(node.nodeId);
  }
};

// 点击行选择节点
const handleNodeRowClick = (row: SpiderNodeWithThread) => {
  toggleNodeSelection(row);
};

// 获取节点列表
const fetchNodeList = async () => {
  nodeLoading.value = true;
  try {
    const { data } = await nodeApi.getNodeList();
    nodeList.value = data.map((node: any) => ({ 
      ...node, 
      threadNum: 1,
      taskCount: node.taskCount || 0
    }));
  } catch (error) {
    ElMessage.error('获取节点列表失败');
  } finally {
    nodeLoading.value = false;
  }
};

// 刷新节点
const handleRefreshNode = async () => {
  nodeLoading.value = true;
  try {
    await nodeApi.refreshNode();
    await fetchNodeList();
    ElMessage.success('节点列表已刷新');
  } catch (error) {
    ElMessage.error('刷新节点失败');
  } finally {
    nodeLoading.value = false;
  }
};

// 提交任务
const handleSubmit = () => {
  if (!currentWebsite.value) {
    ElMessage.warning('请选择网站');
    return;
  }
  
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

  emit('submit', {
    websiteId: currentWebsite.value.id,
    spiderNodes: selectedNodes
  });
};

// 监听对话框打开状态
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedNodeIds.value = [];
      fetchNodeList();
    }
  }
);
</script>

<style scoped>
/* 对话框整体样式 */
.task-options-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.task-options-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.task-options-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.task-options-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 20px;
}

.task-options-dialog :deep(.el-dialog__body) {
  padding: 0;
}

/* 对话框内容区域 */
.dialog-content {
  padding: 24px;
  background: #f8fafc;
}

/* 信息卡片样式 */
.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.website-info {
  flex: 1;
}

.website-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.website-url {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  word-break: break-all;
}

.task-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-weight: 500;
}

/* 节点选择区域 */
.node-selection-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.section-title i {
  color: #6366f1;
}

.selected-count {
  margin-left: 12px;
}

.refresh-btn {
  border-radius: 8px;
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
  color: white !important;
}

.refresh-btn:hover {
  background-color: var(--el-color-primary-dark-2) !important;
  border-color: var(--el-color-primary-dark-2) !important;
}

/* 表格样式 */
.table-wrapper {
  overflow: hidden;
}

.nodes-table {
  border: none;
}

.nodes-table :deep(.el-table__header) {
  background: #f8fafc;
}

.nodes-table :deep(.el-table th.el-table__cell) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  padding: 16px 12px;
}

.nodes-table :deep(.el-table td.el-table__cell) {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
}

.nodes-table :deep(.el-table__row:hover) {
  background-color: #f0f9ff;
  cursor: pointer;
}

.selected-node-row {
  background-color: #eff6ff !important;
}

.selected-node-row:hover {
  background-color: #dbeafe !important;
}

/* 表格单元格样式 */
.node-id-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-id-cell i {
  color: #6366f1;
  font-size: 16px;
}

.node-id-text {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #374151;
}

.node-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.node-address i {
  color: #10b981;
  font-size: 14px;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.task-count-cell {
  display: flex;
  justify-content: center;
}

.task-badge :deep(.el-badge__content) {
  background: #f59e0b;
  border: none;
}

.thread-config-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.thread-input {
  width: 80px;
}

.thread-unit {
  font-size: 12px;
  color: #6b7280;
}

/* 底部样式 */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.footer-info {
  flex: 1;
}

.selection-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.selection-summary i {
  color: #3b82f6;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  border-radius: 8px;
  padding: 12px 24px;
}

.submit-btn {
  border-radius: 8px;
  padding: 12px 24px;
  background: var(--el-color-primary) !important;
  border: none !important;
  color: white !important;
  display: flex;
  align-items: center;
  gap: 6px;
}

.submit-btn:hover {
  background: var(--el-color-primary-dark-2) !important;
}

.submit-btn:disabled {
  background: var(--el-color-info-light-5) !important;
  color: var(--el-color-info-light-3) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-options-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
  
  .info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .footer-actions {
    justify-content: stretch;
  }
  
  .footer-actions .el-button {
    flex: 1;
  }
}
</style>