<template>
  <div class="link-list-container">
    <div class="website-sidebar">
      <el-card shadow="never" class="sidebar-card">
        <div class="sidebar-header">
          <h3>网站列表</h3>
        </div>
        <el-table 
          :data="websiteList" 
          highlight-current-row
          @current-change="handleWebsiteSelect"
          style="width: 100%">
          <el-table-column prop="name" label="网站名称" />
        </el-table>
        <div class="pagination-container">
          <el-pagination
            small
            layout="prev, pager, next"
            :total="websiteTotal"
            :page-size="websitePageSize"
            v-model:current-page="websiteCurrentPage"
            @current-change="handleWebsitePageChange"
          />
        </div>
      </el-card>
    </div>

    <div class="content-area">
      <el-card shadow="never" class="content-card">
        <div class="table-header">
          <div class="table-title">
            {{ selectedWebsite ? `${selectedWebsite.name} 的链接` : '请选择网站' }}
          </div>
          <div class="table-actions">
            <el-button :icon="Refresh" circle @click="handleTableRefresh" />
          </div>
        </div>

        <el-card shadow="never" class="search-card">
          <el-form :model="searchForm" inline label-position="left" label-width="auto">
            <el-form-item label="时间范围:">
              <el-date-picker
                v-model="searchForm.timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="链接URL:">
              <el-input v-model="searchForm.url" placeholder="请输入链接URL" clearable />
            </el-form-item>
            <el-form-item label="链接类型:">
              <el-select v-model="searchForm.extLink" placeholder="请选择链接类型" clearable>
                <el-option label="内链" :value="false" />
                <el-option label="外链" :value="true" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleReset">重置</el-button>
              <el-button type="primary" @click="handleSearch">查询</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-table :data="linkList" border style="width: 100%">
          <el-table-column label="链接URL" prop="url">
            <template #default="{ row }">
              <el-tooltip :content="row.url" placement="top" :show-after="100">
                <a :href="row.url" target="_blank" rel="noopener noreferrer" class="table-link">{{ row.url }}</a>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="所属网站" prop="website" width="180" />
          <el-table-column label="采集时间" prop="crawlTime" width="180" />
          <el-table-column label="更新时间" prop="updatedAt" width="180" />
          <el-table-column prop="extLink" label="外链" width="100">
            <template #default="{ row }">
              <span :class="['link-type', row.extLink ? 'external-link' : 'internal-link']">
                <!-- true=外链 false=内链  -->
                {{ row.extLink? '外链' : '内链'  }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { websiteApi } from '../api/website';
import { websiteLinkApi } from '../api/websiteLink';

interface WebsiteBasic {
  id: number;
  name: string;
}

interface WebsiteLink {
  url: string;
  website: string;
  crawlTime: string;
  extLink: boolean;
  urlType: '内链' | '外链';
}

const emit = defineEmits(['export', 'viewDetail', 'sizeChange', 'currentChange']);

// Website data and methods
const selectedWebsite = ref<WebsiteBasic | null>(null);
const websiteList = ref<WebsiteBasic[]>([]);
const websiteCurrentPage = ref(1);
const websitePageSize = ref(10);
const websiteTotal = ref(0);
const linkList = ref<WebsiteLink[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const loadWebsites = async () => {
  try {
    const { data } = await websiteApi.list({
      page: websiteCurrentPage.value,
      size: websitePageSize.value
    });
    websiteList.value = data.records;
    websiteTotal.value = data.total;
  } catch (error) {
    console.error('Failed to load websites:', error);
  }
};

const handleWebsitePageChange = async (page: number) => {
  websiteCurrentPage.value = page;
  await loadWebsites();
};

onMounted(async () => {
  await loadWebsites();
  if (websiteList.value.length > 0) {
    handleWebsiteSelect(websiteList.value[0]);
  }
});
// Other component methods
const searchForm = ref({
  timeRange: [],
  url: '',
  extLink: null as boolean | null
});

const handleReset = () => {
  searchForm.value = {
    timeRange: [],
    url: '',
    extLink: null
  };
  loadLinks();
};

const handleSearch = () => {
  loadLinks();
};

const loadLinks = async () => {
  if (!selectedWebsite.value) return;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      websiteId: selectedWebsite.value.id,
      url: searchForm.value.url,
      extLink: searchForm.value.extLink,
      startTime: searchForm.value.timeRange[0],
      endTime: searchForm.value.timeRange[1]
    };
    const response = await websiteLinkApi.list(params);
    linkList.value = response.data.records.map(link => ({
      url: link.url,
      website: selectedWebsite.value!.name,
      crawlTime: link.createdAt,
      extLink: link.extLink,
      updatedAt: link.updatedAt,
      urlType: link.extLink ? '外链' : '内链'
    }));
    total.value = response.data.total;
  } catch (error) {
    console.error('Failed to load links:', error);
  }
};

const handleWebsiteSelect = async (website: WebsiteBasic | null) => {
  selectedWebsite.value = website;
  if (website) {
    currentPage.value = 1;
    await loadLinks();
  } else {
    linkList.value = [];
    total.value = 0;
  }
};

const handleTableRefresh = () => {
  loadLinks();
};

const handleSizeChange = async (val: number) => {
  pageSize.value = val;
  await loadLinks();
  emit('sizeChange', val);
};

const handleCurrentChange = async (val: number) => {
  currentPage.value = val;
  await loadLinks();
  emit('currentChange', val);
};
</script>

<style scoped>
.link-list-container {
  padding: 12px;
  background: #f0f2f5;
  height: 100%;
  display: flex;
}

.content-area {
  flex: 1;
  overflow: auto;
  margin-left: 12px;
}

.website-sidebar {
  width: 280px;
}

.sidebar-card,
.content-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 12px;
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
  margin: 0;
  padding: 0 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 16px;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0 16px 16px;
}

:deep(.el-table) {
  --el-table-border-color: #dcdfe6;
  --el-table-header-bg-color: #f8fafc;
  border-radius: 6px;
  overflow: hidden;
}

:deep(.el-table th) {
  font-weight: bold;
  color: #1e293b;
  background-color: #f8fafc;
}

:deep(.el-table td) {
  color: #475569;
}

:deep(.el-card) {
  border: none;
  border-radius: 6px;
}

:deep(.el-button) {
  border-radius: 4px;
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-button + .el-button) {
  margin-left: 8px;
}

.table-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-link:hover {
  color: #2563eb;
}

.link-type {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.external-link {
  color: #ef4444;
  background-color: #fee2e2;
}

.internal-link {
  color: #22c55e;
  background-color: #dcfce7;
}
</style>
