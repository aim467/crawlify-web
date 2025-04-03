<template>
  <div>
    <div class="grid grid-cols-3 gap-4 mb-6">
      <el-card v-for="stat in taskStats" :key="stat.title" :class="stat.bgClass">
        <div class="flex items-center">
          <el-icon :size="40" class="mr-4">
            <component :is="stat.icon" />
          </el-icon>
          <div>
            <div class="text-sm text-gray-600">{{ stat.title }}</div>
            <div class="text-2xl font-bold">{{ stat.count }}</div>
          </div>
        </div>
      </el-card>
    </div>
    <el-table :data="taskList" border class="w-full">
      <el-table-column label="任务ID" prop="id" width="120" />
      <el-table-column label="关联网站" prop="website" />
      <el-table-column label="开始时间" prop="startTime" width="180" />
      <el-table-column label="运行状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === '运行中' ? 'success' : 'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="采集数量" prop="count" width="120" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="danger" size="small" :disabled="row.status !== '运行中'" @click="handleStop(row)">
              停止
            </el-button>
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits(['stop', 'viewDetail']);

const taskStats = ref([
  { title: '运行中任务', count: 8, icon: 'Monitor', bgClass: 'bg-green-50' },
  { title: '已完成任务', count: 126, icon: 'List', bgClass: 'bg-blue-50' },
  { title: '异常任务', count: 3, icon: 'Warning', bgClass: 'bg-red-50' }
]);

const taskList = ref([
  { id: 'T2024001', website: '新浪科技', startTime: '2024-01-20 10:30:00', status: '运行中', count: 1562 },
  { id: 'T2024002', website: '腾讯科技', startTime: '2024-01-20 09:15:00', status: '已完成', count: 2341 },
  { id: 'T2024003', website: '36氪', startTime: '2024-01-20 11:00:00', status: '运行中', count: 856 }
]);

const handleStop = (row: any) => {
  emit('stop', row);
};

const handleViewDetail = (row: any) => {
  emit('viewDetail', row);
};
</script>

<style scoped>
:deep(.el-table) {
  --el-table-border-color: #e5e7eb;
  --el-table-header-bg-color: #f9fafb;
}

:deep(.el-button-group .el-button) {
  margin-left: -1px;
}

:deep(.el-card) {
  border: none;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-red-50 {
  background-color: #fef2f2;
}
</style>