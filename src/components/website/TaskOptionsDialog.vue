<template>
  <el-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="启动采集任务" width="1000px">
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div style="display: flex; align-items: flex-start; width: 100%; gap: 10px;">
        <div class="node-table-container" style="flex: 1; min-width: 0;">
          <el-table
            :data="nodeList"
            style="max-height: 320px; background: #f9f9fb; border: 1px solid #ebeef5;"
            height="320"
            @row-click="handleNodeRowClick"
            :row-class-name="nodeTableRowClassName"
            :empty-text="nodeLoading ? '加载中...' : '暂无节点'"
            :highlight-current-row="true"
            :row-key="getRowKey"
            border
          >
            <el-table-column
              label="选择"
              width="120"
              align="center"
              fixed="left"
            >
              <template #default="{ row }">
                <el-checkbox
                  :model-value="selectedNodeIds.includes(row.nodeId)"
                  :disabled="row.status !== 1"
                  @change="() => toggleNodeSelection(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="nodeId" label="节点ID" width="220" fixed="left" />
            <el-table-column prop="nodeIp" label="节点IP" min-width="120" />
            <el-table-column prop="nodePort" label="端口" min-width="80" />
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                  {{ row.status === 1 ? '正常' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="任务数" min-width="100">
              <template #default="{ row }">
                <el-tag type="warning" size="small">{{ row.taskCount || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="线程数" min-width="120">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.threadNum"
                  :min="1"
                  :max="20"
                  :disabled="row.status !== 1"
                  size="small"
                  style="width: 90px;"
                  placeholder="线程数"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-button @click="handleRefreshNode" :loading="nodeLoading" icon="refresh" circle style="margin-top: 2px;" title="刷新节点" />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认启动</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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
  if (!props.currentWebsite) {
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
    websiteId: props.currentWebsite.id,
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
.selected-node-row {
  background-color: #e6f7ff !important;
}

.node-table-container {
  overflow-x: auto;
  border-radius: 6px;
}

.node-table-container :deep(.el-table) {
  border-radius: 6px;
}

.node-table-container :deep(.el-table__fixed) {
  border-radius: 6px 0 0 6px;
}

.node-table-container :deep(.el-table__fixed-right) {
  border-radius: 0 6px 6px 0;
}
</style> 