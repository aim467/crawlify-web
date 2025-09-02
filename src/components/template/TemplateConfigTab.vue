<template>
  <div class="template-config-tab">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto">
        <el-form-item label="配置名称:" prop="configName">
          <el-input
            v-model="searchForm.configName"
            placeholder="请输入配置名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button
            type="primary"
            icon="Search"
            @click="handleSearch"
            :loading="loading"
          >
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <!-- 表格操作头部 -->
      <div class="table-header">
        <div class="table-title">
          模板配置列表
        </div>
        <div class="table-actions">
          <el-button type="primary" icon="Plus" @click="handleAdd">新增模板</el-button>
          <el-button icon="Refresh" circle @click="handleRefresh" />
        </div>
      </div>

      <!-- 表格 -->
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading" 
        border 
        :height="tableHeight"
      >
        <el-table-column prop="configId" label="配置ID" width="200" align="center" fixed />
        <el-table-column prop="configName" label="配置名称" min-width="180" fixed />
        <el-table-column prop="columnUrl" label="基础URL" min-width="250" show-overflow-tooltip />
        <el-table-column prop="requestType" label="请求类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRequestTypeTag(row.requestType)">
              {{ row.requestType || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resultType" label="结果类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getResultTypeTag(row.resultType)">
              {{ row.resultType || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pageStart" label="起始页" width="100" align="center" />
        <el-table-column prop="pageLen" label="最大页数" width="100" align="center" />
        <el-table-column prop="useScript" label="使用脚本" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.useScript === 1 ? 'success' : 'info'" size="small">
              {{ row.useScript === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEdit(row)" />
            </el-tooltip>
            <el-tooltip content="代码编辑" placement="top">
              <el-button link type="warning" icon="DocumentCopy" @click="handleCodeEdit(row)" />
            </el-tooltip>
            <el-tooltip content="复制" placement="top">
              <el-button link type="success" icon="CopyDocument" @click="handleCopy(row)" />
            </el-tooltip>
            <el-tooltip content="查看" placement="top">
              <el-button link type="info" icon="View" @click="handleView(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDelete(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination 
          :current-page="pagination.currentPage" 
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" 
          :total="pagination.total" 
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange" 
          @current-change="handlePageCurrentChange" 
        />
      </div>
    </el-card>

    <!-- 配置表单抽屉 -->
    <TemplateConfigForm
      v-model:visible="templateFormDialog.dialogVisible.value"
      v-model:form-data="templateFormDialog.form"
      :is-edit-mode="templateFormDialog.isEditMode.value"
      :loading="templateFormDialog.submitLoading.value"
      :request-headers-text="requestHeadersText"
      @submit="submitTemplateForm"
      @update:request-headers-text="requestHeadersText = $event"
      @parse-headers="parseRequestHeaders"
      @remove-header="removeHeader"
      @add-field-rule="addFieldRule"
      @remove-field-rule="removeFieldRule"
    />

    <!-- 查看模板内容弹窗 -->
    <TemplateViewDialog
      v-model:visible="viewDialogVisible"
      :template-data="viewTemplate"
    />

    <!-- 代码编辑抽屉 -->
    <CodeEditorDrawer
      v-model:visible="codeEditorVisible"
      v-model:content="codeContent"
      :template-data="currentTemplate"
      :loading="saveCodeLoading"
      @save="saveCode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useTemplateConfig } from '../../composables/useTemplateConfig';
import { getRequestTypeTag, getResultTypeTag, generateTemplateCode } from '../../utils/templateUtils';
import { templateConfigApi } from '../../api/templateConfig';
import type { TemplateConfig } from '../../types/templateConfig';
import TemplateConfigForm from './TemplateConfigForm.vue';
import TemplateViewDialog from './TemplateViewDialog.vue';
import CodeEditorDrawer from './CodeEditorDrawer.vue';
import { parseCommand } from '../../utils/commandParser';

// Props
interface Props {
  tableHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  tableHeight: 450
});

// Emits
const emit = defineEmits<{
  codeEdit: [template: TemplateConfig];
}>();

// 使用模板配置逻辑
const {
  loading,
  tableData,
  searchForm,
  searchFormRef,
  pagination,
  templateFormDialog,
  requestHeadersText,
  viewDialogVisible,
  viewTemplate,
  fetchData,
  handleSearch,
  handleReset,
  handleRefresh,
  handleAdd,
  handleEdit,
  handleCopy,
  handleView,
  handleDelete,
  parseRequestHeaders,
  removeHeader,
  addFieldRule,
  removeFieldRule,
  submitTemplateForm,
  handlePageSizeChange,
  handlePageCurrentChange,
} = useTemplateConfig();

// 代码编辑器相关
const codeEditorVisible = ref(false);
const saveCodeLoading = ref(false);
const codeContent = ref('');
const currentTemplate = ref<TemplateConfig | null>(null);

// 代码编辑相关函数
const handleCodeEdit = async (row: TemplateConfig) => {
  try {
    loading.value = true;
    
    // 获取模板配置基础信息
    const { data: templateData } = await templateConfigApi.getById(row.configId!);
    currentTemplate.value = templateData;
    
    try {
      // 尝试获取已保存的脚本内容
      const { data: scriptContent } = await templateConfigApi.getScript(row.configId!);
      codeContent.value = (scriptContent && typeof scriptContent === 'string' ? scriptContent : '') || generateTemplateCode(templateData);
    } catch (scriptError) {
      // 如果没有保存的脚本，则生成基于模板配置的示例代码
      console.log('未找到已保存的脚本，生成示例代码');
      codeContent.value = generateTemplateCode(templateData);
    }
    
    codeEditorVisible.value = true;
    
  } catch (error) {
    ElMessage.error('获取模板配置失败');
  } finally {
    loading.value = false;
  }
};

// 保存代码
const saveCode = async () => {
  if (!currentTemplate.value) {
    ElMessage.error('模板信息不存在');
    return;
  }
  
  if (!codeContent.value.trim()) {
    ElMessage.warning('请输入脚本内容');
    return;
  }

  try {
    saveCodeLoading.value = true;
    
    // 调用保存脚本接口
    await templateConfigApi.saveScript({
      configId: currentTemplate.value.configId!,
      configName: currentTemplate.value.configName,
      scriptContent: codeContent.value
    });
    
    ElMessage.success('脚本保存成功');
    codeEditorVisible.value = false;
  } catch (error) {
    console.error('保存脚本失败:', error);
    ElMessage.error(`脚本保存失败: ${(error as Error).message || '未知错误'}`);
  } finally {
    saveCodeLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchData();
});

// 暴露给父组件的方法
defineExpose({
  refresh: fetchData,
});
</script>

<style scoped>
.template-config-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-card {
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.el-form--inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 18px;
}

.table-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.table-actions .el-button {
  margin-left: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.el-table .el-button+.el-button {
  margin-left: 8px;
}
</style>
