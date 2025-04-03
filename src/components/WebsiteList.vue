<template>
  <div>
    <div class="mb-4 flex justify-between">
      <el-button type="primary" class="!rounded-button" @click="showDialog = true">
        <el-icon class="mr-1"><Plus /></el-icon>新增网站
      </el-button>
      <el-input v-model="websiteSearch" placeholder="搜索网站名称" class="w-64 !rounded-button">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    <el-table :data="websiteList" border class="w-full">
      <el-table-column label="网站名称" prop="name" />
      <el-table-column label="网站URL" prop="url" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === '运行中' ? 'success' : 'info'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" size="small" @click="handleStartCrawl(row)">启动采集</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 网站表单对话框 -->
    <el-dialog v-model="showDialog" :title="editingWebsite ? '编辑网站' : '新增网站'" width="500px">
      <el-form :model="websiteForm" label-width="80px">
        <el-form-item label="网站名称">
          <el-input v-model="websiteForm.name" />
        </el-form-item>
        <el-form-item label="网站URL">
          <el-input v-model="websiteForm.url" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Plus, Search } from '@element-plus/icons-vue';

const emit = defineEmits(['save', 'delete', 'startCrawl']);

const websiteSearch = ref('');
const showDialog = ref(false);
const editingWebsite = ref(false);
const websiteForm = ref({
  name: '',
  url: ''
});

const websiteList = ref([
  { name: '新浪科技', url: 'https://tech.sina.com.cn', status: '运行中' },
  { name: '腾讯科技', url: 'https://tech.qq.com', status: '已停止' },
  { name: '36氪', url: 'https://36kr.com', status: '运行中' },
  { name: '钛媒体', url: 'https://www.tmtpost.com', status: '已停止' }
]);

const handleEdit = (row: any) => {
  editingWebsite.value = true;
  websiteForm.value = { ...row };
  showDialog.value = true;
};

const handleStartCrawl = (row: any) => {
  emit('startCrawl', row);
};

const handleDelete = (row: any) => {
  emit('delete', row);
};

const handleSave = () => {
  emit('save', websiteForm.value);
  showDialog.value = false;
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