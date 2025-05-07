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
            <el-option label="部分完成" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="网站名称:" prop="websiteName">
          <el-input v-model="searchForm.websiteName" placeholder="请输入网站名称" clearable />
        </el-form-item>
        
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- Task Statistics Cards -->
    <div class="stats-container">
      <el-card v-for="(stat, index) in taskStats" :key="index" shadow="hover" :class="['stat-card', stat.className]">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="36" :color="stat.color">
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
          <el-button :icon="Refresh" circle @click="handleTableRefresh" />
          <el-button :icon="Setting" circle @click="handleTableSettings" />
        </div>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
        <el-table-column label="操作" width="80" align="center" fixed="left">
          <template #default="{ row }">
            <el-tooltip content="查看子任务" placement="top">
              <el-button link type="primary" :icon="View" @click="handleViewSubTasks(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="taskId" label="任务ID" min-width="280" align="center" />
        <el-table-column prop="websiteName" label="关联网站" width="120" align="center" />
        <el-table-column label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
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
              <el-button link type="danger" :icon="VideoPlay" @click="handleStop(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row)" />
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
              <el-card shadow="hover" class="subtask-stat-card">
                <div class="subtask-stat-content">
                  <div class="subtask-stat-title">子任务总数</div>
                  <div class="subtask-stat-count">{{ currentTask.subTasks.length }}</div>
                </div>
              </el-card>
              <el-card shadow="hover" class="subtask-stat-card success-stat">
                <div class="subtask-stat-content">
                  <div class="subtask-stat-title">已完成</div>
                  <div class="subtask-stat-count">{{ currentTask.subTasks.filter(task => task.status === 3).length }}</div>
                </div>
              </el-card>
              <el-card shadow="hover" class="subtask-stat-card warning-stat">
                <div class="subtask-stat-content">
                  <div class="subtask-stat-title">运行中</div>
                  <div class="subtask-stat-count">{{ currentTask.subTasks.filter(task => task.status === 2).length }}</div>
                </div>
              </el-card>
              <el-card shadow="hover" class="subtask-stat-card danger-stat">
                <div class="subtask-stat-content">
                  <div class="subtask-stat-title">已停止</div>
                  <div class="subtask-stat-count">{{ currentTask.subTasks.filter(task => task.status === 4).length }}</div>
                </div>
              </el-card>
            </div>
            
            <!-- 子任务进度图表 -->
            <div class="subtask-charts-container">
              <el-card shadow="hover" class="chart-card">
                <template #header>
                  <div class="chart-header">子任务状态分布</div>
                </template>
                <div class="chart-content">
                  <el-progress type="dashboard" :percentage="getSubtaskCompletionRate(currentTask.subTasks)" :color="getProgressColor" :stroke-width="10">
                    <template #default="{ percentage }">
                      <span class="progress-value">{{ percentage.toFixed(0) }}%</span>
                      <span class="progress-label">完成率</span>
                    </template>
                  </el-progress>
                </div>
              </el-card>
              
              <el-card shadow="hover" class="chart-card timeline-card">
                <template #header>
                  <div class="chart-header">最近更新的子任务</div>
                </template>
                <div class="timeline-content">
                  <el-timeline>
                    <el-timeline-item
                      v-for="(subTask, index) in getRecentSubTasks(currentTask.subTasks)"
                      :key="index"
                      :type="getStatusType(subTask.status)"
                      :timestamp="formatDateTime(subTask.updatedAt || subTask.createdAt)"
                      :hollow="subTask.status !== 3"
                    >
                      <div class="timeline-task-info">
                        <div class="timeline-task-url">{{ subTask.nodeId }}</div>
                        <div class="timeline-task-status">
                          <el-tag size="small" :type="getStatusType(subTask.status)">
                            {{ getStatusText(subTask.status) }}
                          </el-tag>
                        </div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </el-card>
            </div>
            
            <!-- 子任务表格 -->
            <el-divider content-position="center">详细子任务列表</el-divider>
            <el-table :data="currentTask.subTasks" border style="width: 100%">
              <el-table-column prop="nodeId" label="子任务ID" min-width="280" align="center" />
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

// 子任务弹窗相关
const subTaskDialogVisible = ref(false);
const currentTask = ref<Task | null>(null);

import type { SubTask } from '@/api/task';
import { taskApi } from '@/api/task';
import { websiteApi } from '@/api/website';
import {
  Search,
  Refresh,
  Setting,
  Delete,
  View,
  VideoPlay,
  Check,
  Warning
} from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- State ---
const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  status: null,
  websiteName: '',
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

// Task statistics
const taskStats = ref([
  { title: '运行中任务', count: 0, icon: VideoPlay, className: 'completed-stat', color: '#409EFF' },
  { title: '已完成任务', count: 0, icon: Check, className: 'running-stat', color: '#67C23A' },
  { title: '异常任务', count: 0, icon: Warning, className: 'error-stat', color: '#F56C6C' }
]);

// --- Lifecycle Hooks ---
onMounted(() => {
  loadWebsiteOptions();
  fetchData();
  updateTaskStats();
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
    });
    
    // Handle the API response format
    const data = response.data;
    
    // 处理数据，确保websiteName字段存在
    // 后端可能已经返回了websiteName字段，如果没有，我们需要根据websiteId查找对应的网站名称
    const tasks = data.records;
    if (tasks && tasks.length > 0 && !tasks[0].websiteName) {
      // 如果没有websiteName字段，则需要根据websiteId查找对应的网站名称
      const websiteMap = new Map();
      
      // 从已加载的网站选项中获取网站名称
      websiteOptions.value.forEach(option => {
        websiteMap.set(option.value, option.label);
      });
      
      // 为每个任务添加websiteName字段
      tasks.forEach(task => {
        task.websiteName = websiteMap.get(task.websiteId) || `未知网站(ID:${task.websiteId})`;
      });
    }
    
    tableData.value = tasks;
    pagination.total = data.total;
    pagination.currentPage = data.current;
    pagination.pages = data.pages;
    pagination.pageSize = data.size;
    
    // Update task statistics after fetching data
    updateTaskStats();
  } catch (error) {
    console.error('Failed to fetch task list:', error);
    ElMessage.error('获取任务列表失败');
  } finally {
    loading.value = false;
  }
};

const updateTaskStats = () => {
  // Calculate stats based on the numeric status values
  const runningTasks = tableData.value.filter(task => task.status === 1 || task.status === 2).length;
  const completedTasks = tableData.value.filter(task => task.status === 3).length;
  const errorTasks = tableData.value.filter(task => task.status === 4 || task.status === 5).length;
  
  taskStats.value[0].count = runningTasks;
  taskStats.value[1].count = completedTasks;
  taskStats.value[2].count = errorTasks;
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
  padding: 12px;
  background: #f0f2f5;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  border: none;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  margin-right: 16px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-count {
  font-size: 24px;
  font-weight: bold;
}

.running-stat {
  background-color: #f0f9eb;
}

.completed-stat {
  background-color: #ecf5ff;
}

.error-stat {
  background-color: #fef0f0;
}

.table-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
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

.subtask-container {
  padding: 24px;
  background-color: #f7f8fc; /* Slightly lighter and cooler background */
  border-radius: 8px; /* Add rounded corners to the container */
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05); /* Inner shadow for depth */
  max-height: 400px; /* Or any other suitable max-height */
  overflow-y: auto;
}

.subtask-container .el-table {
  margin-bottom: 0;
}

/* 子任务统计卡片样式 */
.subtask-stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* Responsive columns */
  gap: 16px; /* Increased gap */
  margin-bottom: 24px;
}

.subtask-stat-card {
  border-radius: 10px; /* Slightly more rounded */
  transition: all 0.25s ease-in-out;
  border: 1px solid #e9eef3; /* Softer border */
  background-color: #fff;
}

.subtask-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.subtask-stat-content {
  text-align: center;
  padding: 16px 12px; /* Increased padding */
}

.subtask-stat-title {
  font-size: 13px; /* Slightly smaller for a cleaner look */
  color: #5f6773;
  margin-bottom: 6px;
  font-weight: 500;
}

.subtask-stat-count {
  font-size: 22px; /* Slightly smaller for balance */
  font-weight: 600; /* Bolder */
  color: #2c3e50;
}

.success-stat {
  /* background-color: #f0f9eb; */ /* Remove specific background, rely on card default */
  border-left: 4px solid #67C23A;
}

.success-stat .subtask-stat-count {
  color: #67C23A;
}

.warning-stat {
  /* background-color: #fdf6ec; */
  border-left: 4px solid #E6A23C;
}

.warning-stat .subtask-stat-count {
  color: #E6A23C;
}

.danger-stat {
  /* background-color: #fef0f0; */
  border-left: 4px solid #F56C6C;
}

.danger-stat .subtask-stat-count {
  color: #F56C6C;
}

/* 图表容器样式 */
.subtask-charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive columns */
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 10px;
  background-color: #fff;
  border: 1px solid #e9eef3;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.chart-header {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.chart-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 200px; /* Use min-height */
}

.progress-value {
  font-size: 26px;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
  color: #303133;
}

.progress-label {
  font-size: 13px;
  color: #767d86;
}

/* 时间轴样式 */
.timeline-content {
  padding: 16px;
  min-height: 200px; /* Use min-height */
  max-height: 240px; /* Add max-height for very long lists */
  overflow-y: auto;
}

.timeline-content .el-timeline-item__timestamp {
  font-size: 12px; /* Smaller timestamp */
}

.timeline-content .el-timeline-item__content {
  font-size: 13px; /* Adjust content font size */
}

.timeline-task-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.timeline-task-url {
  font-size: 13px;
  color: #303133;
  word-break: break-all;
  font-weight: 500;
  margin-bottom: 4px;
}

.timeline-task-status {
  display: flex;
  align-items: center;
  gap: 8px; /* Add gap between tag and progress */
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