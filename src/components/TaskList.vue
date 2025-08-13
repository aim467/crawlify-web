<template>
  <div class="task-list-container">
    <!-- Filter/Search Form -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto">
        <el-form-item label="任务状态:" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择任务状态" 
          style="width: 200px"
          clearable>
            <el-option label="全部" value="" />
            <el-option label="初始化" value="1" />
            <el-option label="运行中" value="2" />
            <el-option label="已完成" value="3" />
            <el-option label="已停止" value="4" />
            <el-option label="异常" value="5" />
            <el-option label="部分完成" value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="网站名称:" prop="websiteName">
          <el-input v-model="searchForm.websiteName" placeholder="请输入网站名称" clearable />
        </el-form-item>

        <el-form-item label="创建时间:" prop="startTime">
          <el-date-picker
            v-model="searchForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="至" prop="endTime">
          <el-date-picker
            v-model="searchForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" icon="search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- Task Statistics Cards -->
    <div class="stats-container">
      <el-card v-for="(stat, index) in taskStats" :key="index" shadow="hover" :class="['stat-card', stat.className]">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="24" :color="stat.color">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-count" :style="{color: stat.color}">{{ stat.count }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Table Section -->
    <el-card shadow="never" class="table-card">
      <!-- Table Actions Header -->
      <div class="table-header">
        <div class="table-title">
          爬虫任务列表
        </div>
        <div class="table-actions">
          <el-button icon="refresh" circle @click="handleTableRefresh" />
          <el-button icon="setting" circle @click="handleTableSettings" />
        </div>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
        <el-table-column label="操作" width="80" align="center" fixed="left">
          <template #default="{ row }">
            <el-tooltip content="查看子任务" placement="top">
              <el-button link type="primary" icon="view" @click="handleViewSubTasks(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="taskId" label="任务ID" min-width="280" align="center" />
        <el-table-column prop="websiteName" label="关联网站" width="220" align="center" />
        <el-table-column label="开始时间" width="200">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="200">
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="运行状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <!-- 只有当status=1/2 时才显示停止按钮 -->
            <el-tooltip content="停止" placement="top" v-if="row.status === 1 || row.status === 2">
              <el-button link type="danger" icon="videoPlay" @click="handleStop(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="delete" @click="handleDelete(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 子任务详情弹窗 -->
      <el-dialog
        v-model="subTaskDialogVisible"
        title="子任务详情"
        width="80%"
        :destroy-on-close="true"
        class="subtask-dialog"
      >
        <div v-if="currentTask" v-loading="currentTask.subTasksLoading">
          <div v-if="currentTask.subTasks && currentTask.subTasks.length > 0">
            <!-- 子任务统计卡片 -->
            <div class="subtask-stats-container">
              <el-card shadow="hover" class="subtask-stat-card subtask-init-stat">
                <div class="subtask-stat-content">
                  <div class="subtask-stat-icon">
                    <el-icon :size="20" color="#909399"><loading /></el-icon>
                  </div>
                  <div class="subtask-stat-info">
                    <div class="subtask-stat-title">初始化</div>
                    <div class="subtask-stat-count">{{ currentTask.subTasks.filter(task => task.status === 1).length }}</div>
                  </div>
                </div>
              </el-card>
              <el-card shadow="hover" class="subtask-stat-card subtask-warning-stat">
                <div class="subtask-stat-content">
                  <div class="subtask-stat-icon">
                    <el-icon :size="20" color="#E6A23C"><video-play /></el-icon>
                  </div>
                  <div class="subtask-stat-info">
                    <div class="subtask-stat-title">运行中</div>
                    <div class="subtask-stat-count">{{ currentTask.subTasks.filter(task => task.status === 2).length }}</div>
                  </div>
                </div>
              </el-card>
              <el-card shadow="hover" class="subtask-stat-card subtask-success-stat">
                <div class="subtask-stat-content">
                  <div class="subtask-stat-icon">
                    <el-icon :size="20" color="#67C23A"><circle-check /></el-icon>
                  </div>
                  <div class="subtask-stat-info">
                    <div class="subtask-stat-title">已完成</div>
                    <div class="subtask-stat-count">{{ currentTask.subTasks.filter(task => task.status === 3).length }}</div>
                  </div>
                </div>
              </el-card>
              <el-card shadow="hover" class="subtask-stat-card subtask-danger-stat">
                <div class="subtask-stat-content">
                  <div class="subtask-stat-icon">
                    <el-icon :size="20" color="#909399"><video-pause /></el-icon>
                  </div>
                  <div class="subtask-stat-info">
                    <div class="subtask-stat-title">已停止</div>
                    <div class="subtask-stat-count">{{ currentTask.subTasks.filter(task => task.status === 4).length }}</div>
                  </div>
                </div>
              </el-card>
              <el-card shadow="hover" class="subtask-stat-card subtask-error-stat">
                <div class="subtask-stat-content">
                  <div class="subtask-stat-icon">
                    <el-icon :size="20" color="#F56C6C"><warning /></el-icon>
                  </div>
                  <div class="subtask-stat-info">
                    <div class="subtask-stat-title">异常</div>
                    <div class="subtask-stat-count">{{ currentTask.subTasks.filter(task => task.status === 5).length }}</div>
                  </div>
                </div>
              </el-card>
            </div>
            
            <!-- 子任务表格 -->
            <el-divider content-position="center">详细子任务列表</el-divider>
            <el-table :data="currentTask.subTasks" border style="width: 100%">
              <el-table-column prop="taskNodeId" label="子任务ID" min-width="280" align="center" />
              <el-table-column prop="nodeUrl" label="节点URL" min-width="200" align="center" />
              <el-table-column prop="threadNum" label="线程数" width="100" align="center" />
              <el-table-column label="状态" width="120" align="center">
                <template #default="{ row: subTask }">
                  <el-tag :type="getStatusType(subTask.status)">
                    {{ getStatusText(subTask.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" width="180" align="center">
                <template #default="{ row: subTask }">
                  {{ formatDateTime(subTask.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="更新时间" width="180" align="center">
                <template #default="{ row: subTask }">
                  {{ formatDateTime(subTask.updatedAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="暂无子任务数据" />
        </div>
      </el-dialog>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import type { Task, SubTask } from '@/types/task';

// 子任务弹窗相关
const subTaskDialogVisible = ref(false);
const currentTask = ref<Task | null>(null);
import { taskApi } from '@/api/task';
import { websiteApi } from '@/api/website';
import {
  VideoPlay,
  VideoPause,
  CircleCheck,
  Warning,
  Loading,
  PartlyCloudy
} from '@element-plus/icons-vue';

// Task statistics
const taskStats = ref([
  { title: '初始化', count: 0, icon: Loading, className: 'init-stat', color: '#909399' },
  { title: '运行中', count: 0, icon: VideoPlay, className: 'running-stat', color: '#E6A23C' },
  { title: '已完成', count: 0, icon: CircleCheck, className: 'completed-stat', color: '#67C23A' },
  { title: '已停止', count: 0, icon: VideoPause, className: 'stopped-stat', color: '#909399' },
  { title: '部分完成', count: 0, icon: PartlyCloudy, className: 'partial-stat', color: '#409EFF' },
  { title: '异常', count: 0, icon: Warning, className: 'error-stat', color: '#F56C6C' }
]);

import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- State ---
const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  status: null,
  websiteName: '',
  startTime: null,
  endTime: null,
});

const loading = ref(false);
const tableData = ref<(Task & { subTasks?: SubTask[], subTasksLoading?: boolean })[]>([]);
const websiteOptions = ref<{label: string, value: string | number}[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pages: 0
});

// --- Lifecycle Hooks ---
onMounted(() => {
  loadWebsiteOptions();
  fetchData();
});

// 加载网站选项列表
const loadWebsiteOptions = async () => {
  try {
    // response 转换成 WebsiteResponse 类型
    const { data } = await websiteApi.list({
      page: 1,
      size: 100 // 获取足够多的网站数据
    });
    
    if (data && data.records) {
      websiteOptions.value = data.records.map(website => ({
        label: website.name,
        value: website.id
      }));
    }
  } catch (error) {
    console.error('Failed to load website options:', error);
    ElMessage.error('加载网站列表失败');
  }
};

// --- Methods ---
const fetchData = async () => {
  try {
    loading.value = true;
    const response = await taskApi.list({
      page: pagination.currentPage,
      size: pagination.pageSize,
      websiteName: searchForm.websiteName,
      status: searchForm.status || undefined,
      startTime: searchForm.startTime || undefined,
      endTime: searchForm.endTime || undefined
    });
    
    // Handle the API response format
    const { pageResult, taskStatusCount } = response.data;
    
    // 处理数据，确保websiteName字段存在
    const tasks = pageResult.records;
    if (tasks && tasks.length > 0 && !tasks[0].websiteName) {
      // 如果没有websiteName字段，则需要根据websiteId查找对应的网站名称
      const websiteMap = new Map();
      
      // 从已加载的网站选项中获取网站名称
      websiteOptions.value.forEach(option => {
        websiteMap.set(option.value, option.label);
      });
      
      // 为每个任务添加websiteName字段
      tasks.forEach((task: Task) => {
        task.websiteName = websiteMap.get(task.websiteId) || `未知网站(ID:${task.websiteId})`;
      });
    }
    
    // 更新表格数据和分页信息
    tableData.value = tasks;
    pagination.total = pageResult.total;
    pagination.currentPage = pageResult.current;
    pagination.pages = pageResult.pages;
    pagination.pageSize = pageResult.size;
    
    // 直接使用返回的任务统计数据
    taskStats.value[0].count = taskStatusCount.initCount;
    taskStats.value[1].count = taskStatusCount.runningCount;
    taskStats.value[2].count = taskStatusCount.completedCount;
    taskStats.value[3].count = taskStatusCount.stoppedCount;
    taskStats.value[4].count = taskStatusCount.partialCount;
    taskStats.value[5].count = taskStatusCount.failedCount;
  } catch (error) {
    console.error('Failed to fetch task list:', error);
    ElMessage.error('获取任务列表失败');
  } finally {
    loading.value = false;
  }
};

// Format date time string
const formatDateTime = (dateTimeStr: string | null) => {
  if (!dateTimeStr) return '-';
  return new Date(dateTimeStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Map status number to text
const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '初始化';
    case 2:
      return '运行中';
    case 3:
      return '已完成';
    case 4:
      return '已停止';
    case 5:
      return '异常';
    case 6:
      return '部分完成';
  }
};

// Get status tag type based on status number
const getStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'info';
    case 2:
      return 'warning';
    case 3:
      return 'success';
    case 4:
      return 'danger';
    case 5:
      return 'primary';
  }
};

const handleSearch = () => {
  pagination.currentPage = 1; // Reset to first page on search
  fetchData();
};

const handleReset = () => {
  searchFormRef.value?.resetFields();
  pagination.currentPage = 1;
  fetchData();
};

const handleTableRefresh = () => {
  fetchData();
};

const handleTableSettings = () => {
  ElMessage.info('表格设置功能待实现');
};

const handleViewSubTasks = async (row: Task & { subTasks?: SubTask[], subTasksLoading?: boolean }) => {
  try {
    row.subTasksLoading = true;
    const response = await taskApi.getSubTasks(row.taskId);
    row.subTasks = response.data;
    currentTask.value = row;
    subTaskDialogVisible.value = true;
  } catch (error) {
    console.error('Failed to fetch subtasks:', error);
    ElMessage.error('获取子任务列表失败');
  } finally {
    row.subTasksLoading = false;
  }
};

// 获取子任务完成率
const getSubtaskCompletionRate = (subTasks: SubTask[]) => {
  if (!subTasks || subTasks.length === 0) return 0;
  const completedTasks = subTasks.filter(task => task.status === 3).length;
  return Math.round((completedTasks / subTasks.length) * 100);
};

// 获取进度颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 30) return '#F56C6C';
  if (percentage < 70) return '#E6A23C';
  return '#67C23A';
};

// 获取最近更新的子任务（最多5个）
const getRecentSubTasks = (subTasks: SubTask[]) => {
  if (!subTasks || subTasks.length === 0) return [];
  
  // 按更新时间或创建时间排序，取最近的5个
  return [...subTasks]
    .sort((a, b) => {
      const aTime = a.updatedAt || a.createdAt;
      const bTime = b.updatedAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
    .slice(0, 5);
};

const getProgressStatus = (status: number): '' | 'success' | 'exception' | 'warning' => {
  switch (status) {
    case 1: // 初始化
      return '';
    case 2: // 运行中
      return 'warning';
    case 3: // 已完成
      return 'success';
    case 4: // 已停止
      return 'exception';
    case 5: // 部分完成
      return '';
    default:
      return '';
  }
};

const handleStop = (row: any) => {
  ElMessageBox.confirm(`确定要停止任务 ID: ${row.taskId} 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await taskApi.stop(row.taskId);
        ElMessage.success('任务已停止');
        fetchData();
      } catch (error) {
        console.error('Failed to stop task:', error);
        ElMessage.error('停止任务失败');
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除任务 ID: ${row.taskId} 吗?`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await taskApi.delete(row.taskId);
        ElMessage.success('删除成功');
        fetchData();
      } catch (error) {
        console.error('Failed to delete task:', error);
        ElMessage.error('删除任务失败');
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

// Pagination Handlers
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  pagination.currentPage = 1; // Go to first page when size changes
  fetchData();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  fetchData();
};
</script>

<style scoped>
.task-list-container {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card {
  background: #ffffff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-count {
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
}

/* 状态卡片特定样式 */
.init-stat .stat-icon {
  background-color: rgba(144, 147, 153, 0.1);
}

.running-stat .stat-icon {
  background-color: rgba(230, 162, 60, 0.1);
}

.completed-stat .stat-icon {
  background-color: rgba(103, 194, 58, 0.1);
}

.partial-stat .stat-icon {
  background-color: rgba(64, 158, 255, 0.1);
}

.stopped-stat .stat-icon {
  background-color: rgba(144, 147, 153, 0.1);
}

.error-stat .stat-icon {
  background-color: rgba(245, 108, 108, 0.1);
}

/* 响应式布局 */
@media (max-width: 1400px) {
  .stats-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
}

.table-card {
  background: #ffffff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: var(--el-color-primary);
}

.table-actions .el-button {
  margin-left: 12px;
  transition: all 0.3s ease;
}

.table-actions .el-button:hover {
  transform: scale(1.05);
}

.subtask-container {
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  max-height: 600px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #909399 #f4f4f5;
}

.subtask-container::-webkit-scrollbar {
  width: 6px;
}

.subtask-container::-webkit-scrollbar-track {
  background: #f4f4f5;
  border-radius: 3px;
}

.subtask-container::-webkit-scrollbar-thumb {
  background: #909399;
  border-radius: 3px;
}

.subtask-container .el-table {
  margin-bottom: 0;
  border-radius: 8px;
  overflow: hidden;
}

.subtask-stats-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.subtask-stat-card {
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.subtask-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.subtask-stat-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.subtask-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.subtask-stat-info {
  flex: 1;
}

.subtask-stat-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}

.subtask-stat-count {
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
}

/* 子任务状态卡片特定样式 */
.subtask-init-stat {
  border-left: 3px solid #909399;
}
.subtask-init-stat .subtask-stat-icon {
  background-color: rgba(144, 147, 153, 0.1);
}
.subtask-init-stat .subtask-stat-count {
  color: #909399;
}

.subtask-warning-stat {
  border-left: 3px solid #E6A23C;
}
.subtask-warning-stat .subtask-stat-icon {
  background-color: rgba(230, 162, 60, 0.1);
}
.subtask-warning-stat .subtask-stat-count {
  color: #E6A23C;
}

.subtask-success-stat {
  border-left: 3px solid #67C23A;
}
.subtask-success-stat .subtask-stat-icon {
  background-color: rgba(103, 194, 58, 0.1);
}
.subtask-success-stat .subtask-stat-count {
  color: #67C23A;
}

.subtask-danger-stat {
  border-left: 3px solid #909399;
}
.subtask-danger-stat .subtask-stat-icon {
  background-color: rgba(144, 147, 153, 0.1);
}
.subtask-danger-stat .subtask-stat-count {
  color: #909399;
}

.subtask-error-stat {
  border-left: 3px solid #F56C6C;
}
.subtask-error-stat .subtask-stat-icon {
  background-color: rgba(245, 108, 108, 0.1);
}
.subtask-error-stat .subtask-stat-count {
  color: #F56C6C;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .subtask-stats-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .subtask-stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .subtask-stats-container {
    grid-template-columns: 1fr;
  }
}

.el-table .el-table__expanded-cell {
  padding: 0; /* Remove default padding for expanded cell */
}

.el-table th {
  background-color: #f5f7fa !important; /* Lighter header for sub-table */
  font-weight: 500;
  color: #5f6773;
}

.el-table td, .el-table th.is-leaf {
  border-bottom: 1px solid #eef1f6; /* Softer cell borders */
}

.subtask-container .el-divider__text {
  font-size: 15px;
  font-weight: 500;
  color: #5f6773;
  background-color: #f7f8fc; /* Match container background */
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Adjust form item margins */
.el-form--inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 18px;
}

/* Add slight margin between action icons in the table */
.el-table .el-button + .el-button {
  margin-left: 8px;
}
</style>
