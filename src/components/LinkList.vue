<template>
  <div>
    <div class="bg-white p-4 rounded-lg mb-4">
      <el-form :inline="true" :model="linkFilter">
        <el-form-item label="网站">
          <el-select v-model="linkFilter.website" placeholder="选择网站" class="w-48">
            <el-option v-for="site in websiteOptions" :key="site.value" :label="site.label" :value="site.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="采集时间">
          <el-date-picker v-model="linkFilter.dateRange" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="linkFilter.status" placeholder="选择状态" class="w-32">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="异常" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="flex justify-end mb-4">
      <el-button type="success" @click="handleExport">
        <el-icon class="mr-1"><Download /></el-icon>导出数据
      </el-button>
    </div>
    <el-table :data="linkList" border class="w-full">
      <el-table-column label="链接URL" prop="url" />
      <el-table-column label="所属网站" prop="website" width="180" />
      <el-table-column label="采集时间" prop="crawlTime" width="180" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewDetail(row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="flex justify-end mt-4">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Download } from '@element-plus/icons-vue';

const emit = defineEmits(['search', 'export', 'viewDetail', 'sizeChange', 'currentChange']);

const linkFilter = ref({
  website: '',
  dateRange: [],
  status: ''
});

const websiteOptions = ref([
  { label: '新浪科技', value: 'sina' },
  { label: '腾讯科技', value: 'qq' },
  { label: '36氪', value: '36kr' }
]);

const linkList = ref([
  { url: 'https://tech.sina.com.cn/article/123456', website: '新浪科技', crawlTime: '2024-01-20 10:35:22', status: '正常' },
  { url: 'https://tech.qq.com/article/789012', website: '腾讯科技', crawlTime: '2024-01-20 10:36:15', status: '正常' },
  { url: 'https://36kr.com/article/345678', website: '36氪', crawlTime: '2024-01-20 10:37:01', status: '异常' }
]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);

const handleSearch = () => {
  emit('search', linkFilter.value);
};

const handleExport = () => {
  emit('export');
};

const handleViewDetail = (row: any) => {
  emit('viewDetail', row);
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  emit('sizeChange', val);
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  emit('currentChange', val);
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

:deep(.el-input__wrapper) {
  box-shadow: none !important;
}
</style>