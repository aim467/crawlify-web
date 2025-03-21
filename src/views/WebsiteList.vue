<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Website } from '../types/website'
import { websiteApi, type WebsiteQuery } from '../api/website'
import { taskApi } from '../api/task'

const websites = ref<Website[]>([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')

const query = ref<WebsiteQuery>({
  page: 1,
  size: 10
})

const form = ref<Partial<Website>>({
  name: '',
  baseUrl: '',
  domain: ''
})

const fetchData = async () => {
  try {
    loading.value = true
    const { data } = await websiteApi.list(query.value)
    websites.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取网站列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  query.value.size = val
  query.value.page = 1
  fetchData()
}

const handleCurrentChange = (val: number) => {
  query.value.page = val
  fetchData()
}

const handleAdd = () => {
  form.value = {
    name: '',
    baseUrl: '',
    domain: ''
  }
  dialogTitle.value = '新增网站'
  dialogVisible.value = true
}

const handleEdit = async (row: Website) => {
  const { data } = await websiteApi.getById(row.id)
  form.value = { ...data }
  dialogTitle.value = '编辑网站'
  dialogVisible.value = true
}

const handleDelete = (row: Website) => {
  ElMessageBox.confirm('确认删除该网站？', '提示', {
    type: 'warning'
  })
    .then(async () => {
      await websiteApi.delete(row.id)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

const handleStartTask = async (row: Website) => {
  try {
    await taskApi.run({ websiteId: row.id })
    ElMessage.success('任务启动成功')
  } catch (error) {
    ElMessage.error('任务启动失败')
  }
}

const extractDomain = (url: string) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`)
    return urlObj.hostname
  } catch {
    return ''
  }
}

watch(() => form.value.baseUrl, (newUrl) => {
  if (newUrl) {
    form.value.domain = extractDomain(newUrl)
  }
})

const handleSubmit = async () => {
  try {
    if (form.value.id) {
      await websiteApi.update(form.value as Website)
      ElMessage.success('更新成功')
    } else {
      await websiteApi.create(form.value as Omit<Website, 'id'>)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="website-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>网站列表</h2>
          <div class="header-buttons">
            <el-button type="primary" @click="$router.push('/tasks')" class="task-btn">任务管理</el-button>
            <el-button type="success" @click="handleAdd" class="add-btn">新增网站</el-button>
          </div>
        </div>
      </template>
      <el-table v-loading="loading" :data="websites" style="width: 100%" class="data-table">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="baseUrl" label="基础URL" />
        <el-table-column prop="domain" label="域名" />
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)" class="edit-btn">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)" class="delete-btn">删除</el-button>
            <el-button type="success" link @click="handleStartTask(row)" class="start-task-btn">启动任务</el-button>
            <el-button type="info" link @click="$router.push(`/website-links/${row.id}`)" class="view-links-btn">查看链接</el-button>
          </template>
        </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" class="website-dialog" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="网站名称">
          <el-input v-model="form.name" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="基础URL">
          <el-input v-model="form.baseUrl" placeholder="请输入基础URL" />
        </el-form-item>
        <el-form-item label="域名">
          <el-input v-model="form.domain" placeholder="请输入域名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.website-list {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f7fa;
}

.box-card {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
  background-color: #fff;
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
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

:deep(.el-button--link) {
  padding: 4px 8px;
  font-weight: 500;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #f0f2f5;
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #f0f2f5;
}

:deep(.el-input) {
  transition: all 0.3s ease;
  border-radius: 6px;
}

:deep(.el-input:hover) {
  transform: translateY(-1px);
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s ease;
  border-radius: 6px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

:deep(.el-button) {
  transition: all 0.3s ease;
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-button:not(.el-button--link):hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.header-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.task-btn, .add-btn {
  padding: 10px 20px;
  font-weight: 500;
}

.add-btn {
  background: linear-gradient(45deg, #67c23a, #85ce61);
  border: none;
}

.edit-btn:hover {
  color: #409eff;
  transform: scale(1.05);
}

.delete-btn:hover {
  color: #f56c6c;
  transform: scale(1.05);
}

.start-task-btn:hover {
  color: #67c23a;
  transform: scale(1.05);
}

:deep(.el-pagination) {
  --el-pagination-button-width: 36px;
  --el-pagination-button-height: 36px;
  --el-pagination-button-margin: 0 8px;
  --el-pagination-button-bg-color: #fff;
  --el-pagination-button-color: #606266;
  --el-pagination-button-disabled-color: #c0c4cc;
  --el-pagination-button-disabled-bg-color: #fff;
  --el-pagination-hover-color: #409eff;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-pagination .el-pager li:not(.is-disabled).is-active) {
  background-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.website-dialog :deep(.el-input__wrapper) {
  padding: 1px 15px;
  height: 42px;
}
</style>