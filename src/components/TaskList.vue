<template>
  <div class="task-list-container">
    <!-- Filter/Search Form -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto">
        <el-form-item label="任务状态:" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择任务状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="运行中" value="运行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="异常" value="异常" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联网站:" prop="websiteId">
          <el-select v-model="searchForm.websiteId" placeholder="请选择关联网站" clearable>
            <el-option label="全部" value="" />
            <!-- 这里可以动态加载网站列表 -->
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Stats Cards -->
    <div class="stats-container">
      <el-card v-for="stat in taskStats" :key="stat.title" class="stat-card" :class="stat.className" shadow="hover">
        <div class="stat-content">
          <el-icon :size="40" class="stat-icon">
            <component :is="stat.icon" />
          </el-icon>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-count">{{ stat.count }}</div>
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
          <el-button type="primary" :icon="Plus" @click="handleAddTask">新建任务</el-button>
          <el-button :icon="Refresh" circle @click="handleTableRefresh" />
          <el-button :icon="Setting" circle @click="handleTableSettings" />
        </div>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="taskId" label="任务ID" min-width="280" align="center" />
        <el-table-column prop="websiteId" label="关联网站ID" width="120" align="center" />
        <el-table-column label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="运行状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="停止" placement="top" v-if="row.status === 1">
              <el-button link type="danger" :icon="VideoPlay" @click="handleStop(row)" />
            </el-tooltip>
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" :icon="View" @click="handleViewDetail(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

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
import { taskApi } from '../api/task';
import type { Task } from '../types/task';
import {
  Search,
  Refresh,
  Plus,
  Setting,
  Delete,
  View,
  VideoPlay
} from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- State ---
const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  status: '',
  websiteId: '',
});

const loading = ref(false);
const tableData = ref<any[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pages: 0
});

// Task statistics
const taskStats = ref([
  { title: '运行中任务', count: 0, icon: 'VideoPlay', className: 'running-stat', color: '#67C23A' },
  { title: '已完成任务', count: 0, icon: 'Check', className: 'completed-stat', color: '#409EFF' },
  { title: '异常任务', count: 0, icon: 'Warning', className: 'error-stat', color: '#F56C6C' }
]);

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchData();
  updateTaskStats();
});

// --- Methods ---
const fetchData = async () => {
  try {
    loading.value = true;
    const response = await taskApi.list({
      page: pagination.currentPage,
      size: pagination.pageSize,
      // Add any additional query parameters here
    });
    
    // Handle the API response format
    const data = response.data;
    tableData.value = data.records;
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
  const runningTasks = tableData.value.filter(task => task.status === 1).length;
  const completedTasks = tableData.value.filter(task => task.status === 2).length;
  const errorTasks = tableData.value.filter(task => task.status === 3).length;
  
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
      return '运行中';
    case 2:
      return '已完成';
    case 3:
      return '异常';
    default:
      return '未知状态';
  }
};

// Get status tag type based on status number
const getStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'success';
    case 2:
      return 'info';
    case 3:
      return 'danger';
    default:
      return 'info';
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

const handleAddTask = () => {
  ElMessage.info('新建任务功能待实现');
  // Implement task creation logic here
};

const handleTableRefresh = () => {
  fetchData();
};

const handleTableSettings = () => {
  ElMessage.info('表格设置功能待实现');
};

const handleStop = (row: any) => {
  ElMessageBox.confirm(`确定要停止任务 ID: ${row.taskId} 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('任务已停止');
      // Implement actual stop logic here
      fetchData();
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

const handleViewDetail = (row: any) => {
  ElMessage.info(`查看任务详情: ${row.taskId}`);
  // Implement view detail logic here
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
  margin-bottom: 12px;
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