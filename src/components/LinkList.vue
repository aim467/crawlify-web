<template>
  <div class="link-list-container">
    <div class="website-sidebar">
      <el-card shadow="never" class="sidebar-card">
        <div class="sidebar-header">
          <h3>网站列表</h3>
          <div class="search-input">
            <el-input
              v-model="websiteSearchKeyword"
              placeholder="搜索网站名称"
              clearable
              :prefix-icon="Search"
              @input="handleWebsiteSearch"
            />
          </div>
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
            <el-form-item label="内外链:">
              <el-select
                v-model="searchForm.extLink"
                placeholder="请选择内外链"
                clearable
                :filterable="false"
                :remote="false"
                :remote-method="null"
                style="width: 200px"
              >
                <el-option label="内链" :value="false" />
                <el-option label="外链" :value="true" />
              </el-select>
            </el-form-item>
            <el-form-item label="链接类型:">
              <el-select
                v-model="searchForm.urlType"
                placeholder="请选择链接类型"
                clearable
                style="width: 200px"
              >
                <el-option label="未知" :value="0" />
                <el-option label="网页" :value="1" />
                <el-option label="CSS" :value="2" />
                <el-option label="JavaScript" :value="3" />
                <el-option label="图片" :value="4" />
                <el-option label="文档" :value="5" />
                <el-option label="字体" :value="6" />
                <el-option label="视频" :value="7" />
                <el-option label="压缩包" :value="8" />
                <el-option label="数据" :value="9" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleReset">重置</el-button>
              <el-button type="primary" @click="handleSearch">查询</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-table :data="linkList" border style="width: 100%; flex: 0.9; overflow: auto">
          <el-table-column label="链接URL" prop="url">
            <template #default="{ row }">
              <el-tooltip :content="row.url" placement="top" :show-after="100">
                <div class="url-actions">
                  <span class="table-link">{{ row.url }}</span>
                  <div class="url-action-buttons">
                    <el-dropdown v-if="row.urlType === 1" trigger="click">
                      <el-button type="primary" size="small" :icon="View" circle></el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="openInNewTab(row.url)">
                            <el-icon><Link /></el-icon> 在新标签页打开
                          </el-dropdown-item>
                          <el-dropdown-item @click="previewInCurrentPage(row.url)">
                            <el-icon><View /></el-icon> 在当前页面预览
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <el-button 
                      v-else-if="row.urlType === 4" 
                      type="primary" 
                      size="small" 
                      :icon="View" 
                      circle
                      @click="previewImage(row.url)"
                    ></el-button>
                    <el-button 
                      v-else 
                      type="primary" 
                      size="small" 
                      :icon="Link" 
                      circle
                      @click="openInNewTab(row.url)"
                    ></el-button>
                  </div>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="linkTypeName" label="链接类型" width="120">
            <template #default="{ row }">
              <span :class="['link-type', `url-type-${row.urlType}`]">
                {{ row.linkTypeName }}
              </span>
            </template>
          </el-table-column>
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
          <el-table-column label="所属网站" prop="website" width="180" />
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
  
  <!-- 网页预览对话框 -->
  <el-dialog
    v-model="visiblePreview"
    title="网页预览"
    width="90%"
    :destroy-on-close="true"
    @close="closePreview"
    class="preview-dialog"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="preview-dialog-header">
        <h4 :id="titleId" :class="titleClass">{{ previewUrl }}</h4>
        <el-button class="open-new-tab" type="primary" link :icon="Link" @click="openInNewTab(previewUrl)">在新标签页打开</el-button>
      </div>
    </template>
    <div class="preview-container" v-loading="iframeLoading">
      <iframe 
        v-if="previewUrl" 
        :src="previewUrl" 
        style="width: 100%; height: 80vh; border: none;"
        @load="handleIframeLoad"
      ></iframe>
    </div>
  </el-dialog>
  
  <!-- 图片预览 -->
  <vue-easy-lightbox
    :visible="visibleLightbox"
    :imgs="previewImages"
    @hide="visibleLightbox = false"
  ></vue-easy-lightbox>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Refresh, View, Link, Search } from '@element-plus/icons-vue';
import { websiteApi } from '../api/website';
import { websiteLinkApi } from '../api/websiteLink';
import VueEasyLightbox from 'vue-easy-lightbox';

interface WebsiteBasic {
  id: number;
  name: string;
}

interface WebsiteLink {
  url: string;
  website: string;
  crawlTime: string;
  extLink: boolean;
  urlType: number;
  linkTypeName: string;
  updatedAt: string;
}

const emit = defineEmits(['export', 'viewDetail', 'sizeChange', 'currentChange']);

// Website data and methods
const selectedWebsite = ref<WebsiteBasic | null>(null);
const websiteList = ref<WebsiteBasic[]>([]);
const websiteSearchKeyword = ref('');
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
      size: websitePageSize.value,
      name: websiteSearchKeyword.value
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

const handleWebsiteSearch = () => {
  loadWebsites();
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
  extLink: undefined as boolean | undefined,
  urlType: undefined as number | undefined
});

const handleReset = () => {
  searchForm.value = {
    timeRange: [],
    url: '',
    extLink: undefined,
    urlType: undefined
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
      urlType: searchForm.value.urlType,
      startTime: searchForm.value.timeRange[0],
      endTime: searchForm.value.timeRange[1]
    };
    const response = await websiteLinkApi.list(params);
    linkList.value = response.data.records.map(link => {
      return {
        url: link.url,
        website: selectedWebsite.value!.name,
        crawlTime: link.createdAt,
        extLink: link.extLink,
        updatedAt: link.updatedAt,
        urlType: link.urlType,
        linkTypeName: getLinkTypeName(link.urlType)
      };
    });
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

const getLinkTypeName = (type: number): string => {
  const typeMap: Record<number, string> = {
    0: '未知',
    1: '网页',
    2: 'CSS',
    3: 'JavaScript',
    4: '图片',
    5: '文档',
    6: '字体',
    7: '视频',
    8: '压缩包',
    9: '数据'
  };
  return typeMap[type] || '未知';
};

// 预览相关功能
const visiblePreview = ref(false);
const previewUrl = ref('');
const previewImages = ref<string[]>([]);
const visibleLightbox = ref(false);
const iframeLoading = ref(true);

// 在新标签页打开链接
const openInNewTab = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

// 在当前页面预览网页
const previewInCurrentPage = (url: string) => {
  previewUrl.value = url;
  visiblePreview.value = true;
  iframeLoading.value = true;
};

// iframe加载完成
const handleIframeLoad = () => {
  iframeLoading.value = false;
};

// 预览图片
const previewImage = (url: string) => {
  previewImages.value = [url];
  visibleLightbox.value = true;
};

// 关闭预览
const closePreview = () => {
  visiblePreview.value = false;
  previewUrl.value = '';
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
  margin-left: 12px;
  height: 100%;
  overflow: hidden;
}

.content-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.content-card > :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
}

.content-card .el-table {
  flex: 1;
  overflow: auto;
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

.search-input {
  padding: 8px 16px 0;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e2e8f0;
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #94a3b8;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3b82f6;
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
  flex: 1;
}

.table-link:hover {
  color: #2563eb;
}

.url-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.url-action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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
.url-type-0 {
  color: #64748b;
  background-color: #f1f5f9;
}

.url-type-1 {
  color: #3b82f6;
  background-color: #dbeafe;
}

.url-type-2 {
  color: #8b5cf6;
  background-color: #ede9fe;
}

.url-type-3 {
  color: #ec4899;
  background-color: #fce7f3;
}

.url-type-4 {
  color: #f59e0b;
  background-color: #fef3c7;
}

.url-type-5 {
  color: #10b981;
  background-color: #d1fae5;
}

.url-type-6 {
  color: #14b8a6;
  background-color: #ccfbf1;
}

.url-type-7 {
  color: #f97316;
  background-color: #ffedd5;
}

.url-type-8 {
  color: #6366f1;
  background-color: #e0e7ff;
}

.url-type-9 {
  color: #06b6d4;
  background-color: #cffafe;
}


.preview-dialog {
  :deep(.el-dialog) {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 16px 20px;
    background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
    border-radius: 8px 8px 0 0;
    border-bottom: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-dialog__body) {
    padding: 0;
    flex: 1;
    overflow: hidden;
    background-color: #ffffff;
    border-radius: 0 0 8px 8px;
  }
}

.preview-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  h4 {
    margin: 0;
    font-size: 16px;
    color: #03101d;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-button) {
    color: #0b2444;
    transition: all 0.3s ease;
    &:hover {
      color: #4170b1;
      transform: scale(1.05);
    }
  }
}

.preview-container {
  position: relative;
  min-height: 200px;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
}
.open-new-tab {
  margin-right: 40px;
  background-color: white !important;
}
</style>
