<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { WebsiteLink } from '../api/websiteLink'
import { websiteLinkApi, type WebsiteLinkQuery } from '../api/websiteLink'
import { debounce } from 'lodash-es'

const route = useRoute()
const websiteId = Number(route.params.id)
const links = ref<WebsiteLink[]>([])
const total = ref(0)
const loading = ref(false)
const searchKeyword = ref('')

const query = ref<WebsiteLinkQuery>({
  page: 1,
  size: 10,
  websiteId,
  url: ''
})

const fetchData = async () => {
  if (loading.value) return
  
  try {
    loading.value = true
    query.value.websiteId = websiteId
    query.value.url = searchKeyword.value
    console.log('获取链接列表:', query.value)
    const { data } = await websiteLinkApi.list(query.value)
    links.value = data.records
    total.value = data.total
  } catch (error) {
    console.error('获取链接列表失败:', error)
    ElMessage.error('获取链接列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(() => {
  query.value.page = 1
  fetchData()
}, 300)

const handleSizeChange = (val: number) => {
  query.value.size = val
  query.value.page = 1
  fetchData()
}

const handleCurrentChange = (val: number) => {
  query.value.page = val
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="website-link-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>链接列表</h2>
          <div class="header-buttons">
            <!-- 刷新按钮 -->
            <el-button type="primary" icon="el-icon-refresh" @click="fetchData" class="refresh-btn">搜索</el-button>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索链接"
              clearable
              @input="handleSearch"
              @clear="handleSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="$router.push('/')" class="website-btn">返回网站列表</el-button>
          </div>
        </div>
      </template>
      <el-table v-loading="loading" :data="links" style="width: 100%" class="data-table">
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="url" label="链接地址">
          <template #default="{ row }">
            <a :href="row.url" target="_blank" rel="noopener noreferrer">{{ row.url }}</a>
          </template>   
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.website-link-list {
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.box-card {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
  background-color: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.box-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f2f5;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
  font-weight: 600;
  position: relative;
  padding-left: 20px;
}

.card-header h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 22px;
  background: linear-gradient(45deg, #409eff, #67c23a);
  border-radius: 2px;
}

.pagination {
  margin: 0;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
  padding: 16px;
  border-top: 1px solid #f0f2f5;
}

:deep(.el-table) {
  border-radius: 0;
  margin: 0;
  box-shadow: none;
  flex: 1;
}

:deep(.el-table th) {
  background-color: #f8fafc !important;
  font-weight: 600;
  color: #475569;
  height: 48px;
  font-size: 14px;
  padding: 8px 16px;
}

:deep(.el-table td) {
  padding: 12px 16px;
  color: #334155;
  font-size: 14px;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f0f7ff !important;
  transform: translateY(-1px);
}

:deep(.el-button) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  font-weight: 500;
  height: 40px;
  padding: 0 20px;
}

:deep(.el-button:not(.el-button--link):hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.header-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 320px;
}

.website-btn {
  background: linear-gradient(45deg, #3b82f6, #60a5fa);
  border: none;
  color: #fff;
}

.refresh-btn {
  background: linear-gradient(45deg, #22c55e, #4ade80);
  border: none;
  color: #fff;
}

:deep(.el-pagination) {
  --el-pagination-button-width: 40px;
  --el-pagination-button-height: 40px;
  --el-pagination-button-margin: 0 8px;
  --el-pagination-button-bg-color: #fff;
  --el-pagination-button-color: #475569;
  --el-pagination-button-disabled-color: #94a3b8;
  --el-pagination-button-disabled-bg-color: #f8fafc;
  --el-pagination-hover-color: #3b82f6;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-pagination .el-pager li:not(.is-disabled).is-active) {
  background-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
</style>