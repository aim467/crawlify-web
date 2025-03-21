<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Task } from '../types/task'
import { taskApi, type TaskQuery } from '../api/task'

const tasks = ref<Task[]>([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')

const query = ref<TaskQuery>({
  page: 1,
  size: 10
})

const form = ref<Partial<Task>>({
  name: '',
  websiteId: undefined,
  status: ''
})

const fetchData = async () => {
  try {
    loading.value = true
    const { data } = await taskApi.list(query.value)
    tasks.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取任务列表失败')
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
    websiteId: undefined,
    status: ''
  }
  dialogTitle.value = '新增任务'
  dialogVisible.value = true
}

const handleEdit = async (row: Task) => {
  const { data } = await taskApi.getById(row.id)
  form.value = { ...data }
  dialogTitle.value = '编辑任务'
  dialogVisible.value = true
}

const handleDelete = (row: Task) => {
  ElMessageBox.confirm('确认删除该任务？', '提示', {
    type: 'warning'
  })
    .then(async () => {
      await taskApi.delete(row.id)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

const handleSubmit = async () => {
  try {
    if (form.value.id) {
      await taskApi.update(form.value as Task)
      ElMessage.success('更新成功')
    } else {
      await taskApi.create(form.value as Omit<Task, 'id' | 'createdTime' | 'updatedTime'>)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    '完成': 'success',
    '进行中': 'warning',
    '失败': 'danger',
    '等待中': 'info'
  }
  return statusMap[status] || 'info'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="task-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>任务列表</h2>
          <div class="header-buttons">
            <el-button type="primary" @click="$router.push('/')" class="website-btn">网站管理</el-button>
            <el-button type="success" @click="handleAdd" class="add-btn">新增任务</el-button>
          </div>
        </div>
      </template>
      <el-table v-loading="loading" :data="tasks" style="width: 100%" class="data-table">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="任务名称" />
        <el-table-column prop="websiteId" label="网站ID" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light" class="status-tag">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column prop="updatedTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)" class="edit-btn">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)" class="delete-btn">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" class="task-dialog" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="网站ID">
          <el-input v-model="form.websiteId" type="number" placeholder="请输入网站ID" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态" class="status-select">
            <el-option label="完成" value="完成" />
            <el-option label="进行中" value="进行中" />
            <el-option label="失败" value="失败" />
            <el-option label="等待中" value="等待中" />
          </el-select>
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
.task-list {
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

.website-btn, .add-btn {
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

.task-dialog :deep(.el-input__wrapper) {
  padding: 1px 15px;
  height: 42px;
}

.status-tag {
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
}

.status-select {
  width: 100%;
}
</style>