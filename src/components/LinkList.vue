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
              prefix-icon="search"
              @input="handleWebsiteSearch"
              :loading="websiteLoading"
              @keyup.enter="handleWebsiteSearch"
            />
          </div>
        </div>
        
        <!-- 网站列表加载状态 -->
        <div v-if="websiteLoading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        
        <!-- 网站列表 -->
        <el-table 
          v-else
          :data="websiteList" 
          highlight-current-row
          @current-change="handleWebsiteSelect"
          style="width: 100%"
          :row-class-name="getWebsiteRowClass"
          @row-click="handleWebsiteRowClick"
        >
          <el-table-column prop="name" label="网站名称">
            <template #default="{ row }">
                             <div class="website-name">
                 <el-icon class="website-icon"><Link /></el-icon>
                 <span>{{ row.name }}</span>
               </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 空状态 -->
        <div v-if="!websiteLoading && websiteList.length === 0" class="empty-state">
          <el-empty description="暂无网站数据">
            <template #image>
              <el-icon class="empty-icon"><DataBoard /></el-icon>
            </template>
          </el-empty>
        </div>
        
        <div class="pagination-container">
          <el-pagination
            layout="prev, pager, next"
            :total="websiteTotal"
            :page-size="websitePageSize"
            v-model:current-page="websiteCurrentPage"
            @current-change="handleWebsitePageChange"
            :hide-on-single-page="true"
          />
        </div>
      </el-card>
    </div>

    <div class="content-area">
      <el-card shadow="never" class="content-card">
        <div class="table-header">
          <div class="table-title">
            <el-icon class="title-icon"><Link /></el-icon>
            {{ selectedWebsite ? `${selectedWebsite.name} 的链接` : '请选择网站' }}
            <span v-if="selectedWebsite" class="link-count">(共 {{ total }} 条)</span>
          </div>
          <div class="table-actions">
            <el-tooltip content="刷新数据" placement="top">
              <el-button 
                icon="refresh" 
                circle 
                @click="handleTableRefresh"
                :loading="linkLoading"
              />
            </el-tooltip>
            <el-tooltip content="导出数据" placement="top">
              <el-button 
                icon="download" 
                circle 
                @click="handleExport"
                :disabled="!selectedWebsite"
              />
            </el-tooltip>
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
                :shortcuts="dateShortcuts"
              />
            </el-form-item>
            <el-form-item label="链接URL:">
              <el-input 
                v-model="searchForm.url" 
                placeholder="请输入链接URL" 
                clearable 
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="内外链:">
              <el-select
                v-model="searchForm.extLink"
                placeholder="请选择内外链"
                clearable
                style="width: 200px"
              >
                                 <el-option label="内链" :value="false">
                   <template #default>
                     <el-icon><Link /></el-icon>
                     <span style="margin-left: 8px">内链</span>
                   </template>
                 </el-option>
                 <el-option label="外链" :value="true">
                   <template #default>
                     <el-icon><Link /></el-icon>
                     <span style="margin-left: 8px">外链</span>
                   </template>
                 </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="链接类型:">
              <el-select
                v-model="searchForm.urlType"
                placeholder="请选择链接类型"
                clearable
                style="width: 200px"
              >
                <el-option 
                  v-for="type in LINK_TYPE_OPTIONS" 
                  :key="type.value" 
                  :label="type.label" 
                  :value="type.value" 
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleReset" icon="Refresh">重置</el-button>
              <el-button type="primary" @click="handleSearch" icon="Search">查询</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 链接列表加载状态 -->
        <div v-if="linkLoading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>
        
        <!-- 链接列表 -->
        <el-table 
          v-else
          :data="linkList" 
          border 
          style="width: 100%; flex: 0.9; overflow: auto"
          v-loading="linkLoading"
          :row-class-name="getLinkRowClass"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="链接URL" prop="url" min-width="250">
            <template #default="{ row }">
              <el-tooltip :content="row.url" placement="top" :show-after="100">
                <div class="url-actions">
                  <span class="table-link">{{ row.url }}</span>
                  <div class="url-action-buttons">
                    <el-dropdown v-if="row.urlType === 1" trigger="click">
                      <el-button type="primary" size="small" icon="view" circle />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item icon="link" @click="openInNewTab(row.url)">
                            在新标签页打开
                          </el-dropdown-item>
                          <el-dropdown-item icon="view" @click="previewInCurrentPage(row.url)">
                            在当前页面预览
                          </el-dropdown-item>
                          <el-dropdown-item icon="copy" @click="copyUrl(row.url)">
                            复制链接
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <el-button 
                      v-else-if="row.urlType === 4" 
                      type="primary" 
                      size="small" 
                      icon="view" 
                      circle
                      @click="previewImage(row.url)"
                    />
                    <el-button 
                      v-else 
                      type="primary" 
                      size="small" 
                      icon="link" 
                      circle
                      @click="openInNewTab(row.url)"
                    />
                  </div>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="linkTypeName" label="链接类型" width="140">
            <template #default="{ row }">
              <span :class="['link-type', `url-type-${row.urlType}`]">
                {{ row.linkTypeName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="采集时间" prop="crawlTime" width="220">
            <template #default="{ row }">
              <el-tooltip :content="formatDateTime(row.crawlTime)" placement="top">
                <span>{{ formatDateTime(row.crawlTime) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" prop="updatedAt" width="220">
            <template #default="{ row }">
              <el-tooltip :content="formatDateTime(row.updatedAt)" placement="top">
                <span>{{ formatDateTime(row.updatedAt) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="extLink" label="外链" width="120">
            <template #default="{ row }">
                             <span :class="['link-type', row.extLink ? 'external-link' : 'internal-link']">
                 <el-icon :class="row.extLink ? 'external-icon' : 'internal-icon'">
                   <Link />
                 </el-icon>
                 {{ row.extLink ? '外链' : '内链' }}
               </span>
            </template>
          </el-table-column>
          <el-table-column label="所属网站" prop="website" width="180" />
        </el-table>

        <!-- 空状态 -->
        <div v-if="!linkLoading && linkList.length === 0 && selectedWebsite" class="empty-state">
          <el-empty description="暂无链接数据">
            <template #image>
              <el-icon class="empty-icon"><Link /></el-icon>
            </template>
          </el-empty>
        </div>

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
        <div class="preview-actions">
          <el-button class="open-new-tab" type="primary" link icon="link" @click="openInNewTab(previewUrl)">
            在新标签页打开
          </el-button>
          <el-button type="primary" link icon="copy" @click="copyUrl(previewUrl)">
            复制链接
          </el-button>
        </div>
      </div>
    </template>
    <div class="preview-container" v-loading="iframeLoading">
      <iframe 
        v-if="previewUrl" 
        :src="previewUrl" 
        style="width: 100%; height: 80vh; border: none;"
        @load="handleIframeLoad"
        @error="handleIframeError"
      />
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
import { ref, onMounted, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { websiteApi } from '../api/website';
import { websiteLinkApi } from '../api/websiteLink';
import VueEasyLightbox from 'vue-easy-lightbox';
import { debounce } from 'lodash-es';
import { LINK_TYPE_OPTIONS, LINK_TYPE_MAP } from '../constants/linkTypes';
import { formatDate, formatDateTime } from '../utils/dateUtils';

// 类型定义
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

// 响应式数据
const selectedWebsite = ref<WebsiteBasic | null>(null);
const websiteList = ref<WebsiteBasic[]>([]);
const websiteSearchKeyword = ref('');
const websiteCurrentPage = ref(1);
const websitePageSize = ref(10);
const websiteTotal = ref(0);
const websiteLoading = ref(false);
const linkList = ref<WebsiteLink[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const linkLoading = ref(false);
const selectedLinks = ref<WebsiteLink[]>([]);

const searchForm = ref({
  timeRange: [],
  url: '',
  extLink: undefined as boolean | undefined,
  urlType: undefined as number | undefined
});

// 预览相关
const visiblePreview = ref(false);
const previewUrl = ref('');
const previewImages = ref<string[]>([]);
const visibleLightbox = ref(false);
const iframeLoading = ref(true);

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

// 防抖搜索
const debouncedWebsiteSearch = debounce(async () => {
  await loadWebsites();
}, 300);

// 网站相关方法
const loadWebsites = async () => {
  websiteLoading.value = true;
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
    ElMessage.error('加载网站列表失败，请稍后重试');
  } finally {
    websiteLoading.value = false;
  }
};

const handleWebsitePageChange = async (page: number) => {
  websiteCurrentPage.value = page;
  await loadWebsites();
};

const handleWebsiteSearch = () => {
  debouncedWebsiteSearch();
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

const handleWebsiteRowClick = (row: WebsiteBasic) => {
  handleWebsiteSelect(row);
};

const getWebsiteRowClass = ({ row }: { row: WebsiteBasic }) => {
  return selectedWebsite.value?.id === row.id ? 'selected-website-row' : '';
};

// 链接相关方法
const loadLinks = async () => {
  if (!selectedWebsite.value) return;
  
  linkLoading.value = true;
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
    linkList.value = response.data.records.map(link => ({
      url: link.url,
      website: selectedWebsite.value!.name,
      crawlTime: link.createdAt,
      extLink: link.extLink,
      updatedAt: link.updatedAt,
      urlType: link.urlType,
      linkTypeName: getLinkTypeName(link.urlType)
    }));
    total.value = response.data.total;
  } catch (error) {
    console.error('Failed to load links:', error);
    ElMessage.error('加载链接列表失败，请稍后重试');
  } finally {
    linkLoading.value = false;
  }
};

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
  currentPage.value = 1;
  loadLinks();
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

const handleSelectionChange = (selection: WebsiteLink[]) => {
  selectedLinks.value = selection;
};

const getLinkRowClass = ({ row }: { row: WebsiteLink }) => {
  return row.extLink ? 'external-link-row' : 'internal-link-row';
};

const getLinkTypeName = (type: number): string => {
  return LINK_TYPE_MAP[type] || '未知';
};

// 预览相关方法
const openInNewTab = (url: string) => {
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    ElMessage.error('无法打开链接');
  }
};

const previewInCurrentPage = (url: string) => {
  previewUrl.value = url;
  visiblePreview.value = true;
  iframeLoading.value = true;
};

const handleIframeLoad = () => {
  iframeLoading.value = false;
};

const handleIframeError = () => {
  iframeLoading.value = false;
  ElMessage.warning('无法加载网页预览，请尝试在新标签页打开');
};

const previewImage = (url: string) => {
  previewImages.value = [url];
  visibleLightbox.value = true;
};

const closePreview = () => {
  visiblePreview.value = false;
  previewUrl.value = '';
  iframeLoading.value = true;
};

// 复制链接
const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    ElMessage.success('链接已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败，请手动复制');
  }
};

// 导出功能
const handleExport = async () => {
  if (!selectedWebsite.value) {
    ElMessage.warning('请先选择网站');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要导出 ${selectedWebsite.value.name} 的链接数据吗？`,
      '导出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    );
    
    ElMessage.info('正在导出数据，请稍候...');
    
    // 构建导出参数
    const exportParams = {
      websiteId: selectedWebsite.value.id,
      url: searchForm.value.url,
      extLink: searchForm.value.extLink,
      urlType: searchForm.value.urlType,
      startTime: searchForm.value.timeRange[0],
      endTime: searchForm.value.timeRange[1]
    };
    
    // 调用导出API
    const response = await websiteLinkApi.export(exportParams) as unknown as Blob;
    
    // 创建下载链接
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = `${selectedWebsite.value.name}_链接数据_${timestamp}.xlsx`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('Export failed:', error);
    if (error !== 'cancel') {
      ElMessage.error('导出失败，请稍后重试');
    }
  }
};

// 生命周期
onMounted(async () => {
  await loadWebsites();
  if (websiteList.value.length > 0) {
    await nextTick();
    handleWebsiteSelect(websiteList.value[0]);
  }
});
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

.loading-container {
  padding: 20px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
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
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 8px;
  color: #3b82f6;
}

.link-count {
  margin-left: 8px;
  font-size: 14px;
  color: #64748b;
}

.website-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.website-icon {
  color: #3b82f6;
}

.empty-icon {
  font-size: 48px;
  color: #94a3b8;
}

.selected-website-row {
  background-color: #f0f9ff !important;
}

.external-icon,
.internal-icon {
  margin-right: 4px;
  font-size: 12px;
}

.external-icon {
  color: #ef4444;
}

.internal-icon {
  color: #22c55e;
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
  --el-table-header-bg-color: #3b82f6;
  border-radius: 6px;
  overflow: hidden;
  background-color: #ffffff;
}

:deep(.el-table th) {
  font-weight: bold;
  color: white;
  background-color: var(--el-table-header-bg-color);
}

:deep(.el-table td) {
  color: #475569;
  padding: 12px 16px;
}

:deep(.el-table tr:hover) {
  background-color: #f0f9ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
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
    color: #ebf0f7;
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
  color: white !important;
  
  &:hover {
    color: #4170b1 !important;
    transform: scale(1.05);
  }
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.external-link-row {
  background-color: #fdf6f6; /* Light red background for external links */
}

.internal-link-row {
  background-color: #f0fdf4; /* Light green background for internal links */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .link-list-container {
    flex-direction: column;
  }
  
  .website-sidebar {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .content-area {
    margin-left: 0;
  }
  
  .search-card :deep(.el-form) {
    flex-direction: column;
  }
  
  .search-card :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
