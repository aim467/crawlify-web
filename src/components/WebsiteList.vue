<template>
  <div class="website-list-container">
    <!-- Filter/Search Form -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto">
        <el-form-item label="网站名称:" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入网站名称" clearable />
        </el-form-item>
        <el-form-item label="基础URL:" prop="baseUrl">
          <el-input v-model="searchForm.baseUrl" placeholder="请输入基础URL" clearable />
        </el-form-item>
        <el-form-item label="域名:" prop="domain">
          <el-input v-model="searchForm.domain" placeholder="请输入域名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Section -->
    <el-card shadow="never" class="table-card">
      <!-- Table Actions Header -->
      <div class="table-header">
        <div class="table-title">
          网站列表
        </div>
        <div class="table-actions">
          <el-button type="primary" :icon="Plus" @click="handleAddWebsite">新增网站</el-button>
          <el-button :icon="Refresh" circle @click="handleTableRefresh" />
          <!-- Placeholder for potential column settings -->
          <!-- <el-button :icon="Operation" circle /> -->
          <el-button :icon="Setting" circle @click="handleTableSettings" />
        </div>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="网站名称" min-width="150" />
        <el-table-column prop="baseUrl" label="基础URL" min-width="200" />
        <el-table-column prop="domain" label="域名" min-width="180" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
               <el-button link type="primary" :icon="Edit" @click="handleEdit(row)" />
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

    <!-- Add/Edit Website Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑网站' : '新增网站'"
      width="500px"
    >
      <el-form
        :model="websiteForm"
        ref="websiteFormRef"
        label-width="100px"
        :rules="formRules"
      >
        <el-form-item label="网站名称:" prop="name">
          <el-input v-model="websiteForm.name" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="基础URL:" prop="baseUrl">
          <el-input v-model="websiteForm.baseUrl" placeholder="请输入基础URL" />
        </el-form-item>
        <el-form-item label="域名:" prop="domain">
          <el-input v-model="websiteForm.domain" placeholder="请输入域名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWebsiteForm">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormRules } from 'element-plus';
import type { Website } from '../types/website';
import { websiteApi } from '../api/website';
import {
  Search,
  Refresh,
  Plus,
  Setting,
  InfoFilled,
  Edit,
  Delete,
  RefreshLeft, // Assuming the first icon in actions is reset password
  // Operation // Icon for potential column settings
} from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus'; // For delete confirmation
import { onMounted, watch } from 'vue';

onMounted(() => {
  fetchData();

  // Watch baseUrl changes and extract domain
  watch(
    () => websiteForm.baseUrl,
    (newUrl) => {
      if (newUrl && !isDomainAutoFilled.value) {
        try {
          const urlObj = new URL(newUrl);
          websiteForm.domain = urlObj.hostname.replace(/^www\./, '');
          isDomainAutoFilled.value = true;
        } catch {
          websiteForm.domain = '';
          isDomainAutoFilled.value = false;
        }
      }
    }
  );

  // Watch domain changes to reset auto-fill flag
  watch(
    () => websiteForm.domain,
    (newDomain) => {
      if (newDomain !== websiteForm.domain) {
        isDomainAutoFilled.value = false;
      }
    }
  );
});

// --- State ---

const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  name: '',
  baseUrl: '',
  domain: '',
});
const loading = ref(false); // For table loading state
const dialogVisible = ref(false);
const isEditMode = ref(false);
const websiteFormRef = ref<FormInstance>();
const currentWebsiteId = ref<number | null>(null);
const websiteForm = reactive({
  name: '',
  baseUrl: '',
  domain: '',
});

const isDomainAutoFilled = ref(false);

const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入网站名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  baseUrl: [
    { required: true, message: '请输入基础URL', trigger: 'blur' },
    { pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      message: '请输入有效的URL', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请输入域名', trigger: 'blur' },
    { pattern: /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/,
      message: '请输入有效的域名', trigger: 'blur' }
  ]
});

// Table data
// Table data
const tableData = ref<Website[]>([
  {
    id: 1,
    name: '示例网站',
    baseUrl: 'https://example.com',
    domain: 'example.com',
  },
  // Add more sample data rows if needed
]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 1, // Total items based on the image
});

// --- Methods ---
const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await websiteApi.list({
      page: pagination.currentPage,
      size: pagination.pageSize,
      name: searchForm.name,
      baseUrl: searchForm.baseUrl,
      domain: searchForm.domain
    });
    tableData.value = data.records;
    pagination.total = data.total;
  } catch (error) {
    console.error('Failed to fetch websites:', error);
    ElMessage.error('获取网站列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  console.log('Search clicked', searchForm);
  pagination.currentPage = 1; // Reset to first page on search
  fetchData(); // Call API or filter local data
};

const handleReset = () => {
  searchFormRef.value?.resetFields();
  // Reset status specifically if not handled by resetFields or if you want a different default
  pagination.currentPage = 1;
  fetchData(); // Fetch data with default filters
};
const handleAddWebsite = () => {
  isEditMode.value = false;
  currentWebsiteId.value = null;
  websiteForm.name = '';
  websiteForm.baseUrl = '';
  websiteForm.domain = '';
  isDomainAutoFilled.value = false;
  dialogVisible.value = true;
};

const handleTableRefresh = () => {
  console.log('Table Refresh clicked');
  fetchData(); // Re-fetch data
};

const handleTableSettings = () => {
  console.log('Table Settings clicked');
   ElMessage.info('打开表格设置');
  // Logic for table settings (e.g., show/hide columns)
};

const handleEdit = async (row: Website) => {
  try {
    isEditMode.value = true;
    currentWebsiteId.value = row.id;
    loading.value = true;
    
    const { data } = await websiteApi.getById(row.id);
    console.log(data);
    websiteForm.name = data.name;
    websiteForm.baseUrl = data.baseUrl;
    websiteForm.domain = data.domain;
    
    dialogVisible.value = true;
  } catch (error) {
    console.error('Failed to fetch website details:', error);
    ElMessage.error('获取网站详情失败');
  } finally {
    loading.value = false;
  }
};

const submitWebsiteForm = async () => {
  try {
    await websiteFormRef.value?.validate();
    
    if (isEditMode.value && currentWebsiteId.value) {
      await websiteApi.update({
        id: currentWebsiteId.value,
        ...websiteForm
      });
      ElMessage.success('网站更新成功');
    } else {
      await websiteApi.create(websiteForm);
      ElMessage.success('网站创建成功');
    }
    
    dialogVisible.value = false;
    fetchData();
  } catch (error) {
    console.error('Failed to submit website form:', error);
    ElMessage.error('操作失败');
  }
};

const handleDelete = (row: Website) => {
  ElMessageBox.confirm(`确定要删除网站 '${row.name}' 吗?`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await websiteApi.delete(row.id);
        ElMessage({ type: 'success', message: '删除成功' });
        fetchData();
      } catch (error) {
        console.error('Failed to delete website:', error);
        ElMessage.error('删除网站失败');
      }
    })
    .catch(() => {
      ElMessage({ type: 'info', message: '已取消删除' });
    });
};

// Pagination Handlers
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
  pagination.pageSize = val;
  pagination.currentPage = 1; // Go to first page when size changes
  fetchData();
};

const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`);
  pagination.currentPage = val;
  fetchData();
};



</script>

<style scoped>
.website-list-container {
  padding: 12px;
  background: #f0f2f5;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-card {
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

/* Adjust form item margins if needed */
.el-form--inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 18px; /* Adjust vertical spacing for inline form */
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
  margin-bottom: 15px; /* Space between header and table */
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.info-icon {
  margin-left: 8px;
  color: #909399; /* Adjust color as needed */
  cursor: help;
}


.table-actions .el-button {
  margin-left: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end; /* Align pagination to the right */
  margin-top: 20px;
}

/* Add slight margin between action icons in the table */
.el-table .el-button + .el-button {
    margin-left: 8px;
}

/* Ensure selects don't overflow excessively */
.el-select {
    min-width: 180px;
}
</style>