<template>
  <el-dialog 
    v-model="internalVisible" 
    title="查看模板配置详情" 
    width="1200px"
    class="template-view-dialog"
  >
    <div class="template-view-container">
      <!-- 基础信息卡片 -->
      <el-card shadow="never" class="view-info-card">
        <template #header>
          <div class="card-header">
            <i class="el-icon-info-filled"></i>
            <span>基础信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="配置ID" label-align="right">
            <el-tag type="info">{{ templateData.configId }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="配置名称" label-align="right">
            <span class="config-name">{{ templateData.configName }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="基础URL" label-align="right" :span="2">
            <a :href="templateData.columnUrl" target="_blank" class="url-link">
              {{ templateData.columnUrl }}
            </a>
          </el-descriptions-item>
          <el-descriptions-item label="请求类型" label-align="right">
            <el-tag :type="getRequestTypeTag(templateData.requestType)" size="default">
              {{ templateData.requestType || '未知' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="结果类型" label-align="right">
            <el-tag :type="getResultTypeTag(templateData.resultType)" size="default">
              {{ templateData.resultType || '未知' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分页配置" label-align="right">
            <span class="pagination-info">
              起始页: <strong>{{ templateData.pageStart }}</strong> | 
              最大页数: <strong>{{ templateData.pageLen }}</strong>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="下一页URL" label-align="right">
            <span class="next-page-url">{{ templateData.nextPage || '无' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="使用脚本" label-align="right">
            <el-tag :type="templateData.useScript === 1 ? 'success' : 'info'" size="default">
              {{ templateData.useScript === 1 ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" label-align="right">
            <span class="time-info">{{ templateData.createdAt }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" label-align="right">
            <span class="time-info">{{ templateData.updatedAt }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <!-- 请求配置卡片 -->
      <el-card shadow="never" class="view-info-card" v-if="templateData.requestBody || (templateData.requestHead && Object.keys(templateData.requestHead).length > 0)">
        <template #header>
          <div class="card-header">
            <i class="el-icon-connection"></i>
            <span>请求配置</span>
          </div>
        </template>
        
        <div v-if="templateData.requestHead && Object.keys(templateData.requestHead).length > 0" class="config-section">
          <h5 class="section-title">请求头配置</h5>
          <div class="headers-preview-enhanced">
            <el-tag 
              v-for="(value, key) in templateData.requestHead" 
              :key="key" 
              class="header-tag-enhanced"
              size="default"
            >
              <strong>{{ key }}</strong>: {{ value }}
            </el-tag>
          </div>
        </div>

        <div v-if="templateData.requestBody" class="config-section">
          <h5 class="section-title">请求体模板</h5>
          <el-input 
            :model-value="templateData.requestBody" 
            type="textarea" 
            :rows="6"
            readonly
            class="code-display-enhanced"
          />
        </div>
      </el-card>

      <!-- 结果处理配置卡片 -->
      <el-card shadow="never" class="view-info-card" v-if="templateData.resultListRule || templateData.resultClean">
        <template #header>
          <div class="card-header">
            <i class="el-icon-document"></i>
            <span>结果处理配置</span>
          </div>
        </template>
        
        <div v-if="templateData.resultClean" class="config-section">
          <h5 class="section-title">结果清洗正则</h5>
          <el-input 
            :model-value="templateData.resultClean" 
            readonly
            class="code-display-enhanced"
          />
        </div>

        <div v-if="templateData.resultListRule" class="config-section">
          <h5 class="section-title">列表获取表达式</h5>
          <el-input 
            :model-value="templateData.resultListRule" 
            readonly
            class="code-display-enhanced"
          />
        </div>
      </el-card>

      <!-- 字段提取规则卡片 -->
      <el-card shadow="never" class="view-info-card" v-if="templateData.fieldRules && templateData.fieldRules.length > 0">
        <template #header>
          <div class="card-header">
            <i class="el-icon-menu"></i>
            <span>字段提取规则</span>
            <el-tag type="info" size="small" style="margin-left: auto;">
              共 {{ templateData.fieldRules.length }} 条规则
            </el-tag>
          </div>
        </template>
        
        <el-table :data="templateData.fieldRules" border stripe class="rules-table">
          <el-table-column prop="name" label="字段名称" width="150" align="center">
            <template #default="{ row }">
              <el-tag type="primary" size="small">{{ row.name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="desc" label="字段描述" min-width="200" />
          <el-table-column prop="rule" label="提取规则" min-width="250" show-overflow-tooltip>
            <template #default="{ row }">
              <code class="rule-code">{{ row.rule }}</code>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TemplateConfig } from '../../types/templateConfig';
import { getRequestTypeTag, getResultTypeTag } from '../../utils/templateUtils';

// Props
interface Props {
  visible: boolean;
  templateData: TemplateConfig;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean];
}>();

// Computed
const internalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});
</script>

<style scoped>
/* 查看详情样式 */
.template-view-dialog :deep(.el-dialog__body) {
  padding: 20px;
  background: #f8fafc;
}

.template-view-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 查看详情卡片样式 */
.view-info-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.view-info-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  font-size: 15px;
}

.card-header i {
  margin-right: 8px;
  color: #6366f1;
  font-size: 16px;
}

.view-info-card :deep(.el-card__body) {
  padding: 20px;
}

/* 基础信息样式 */
.config-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}

.url-link {
  color: #3b82f6;
  text-decoration: none;
  word-break: break-all;
  transition: color 0.3s ease;
}

.url-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
}

.pagination-info strong {
  color: #374151;
  font-weight: 600;
}

.next-page-url {
  color: #6b7280;
  font-size: 14px;
  word-break: break-all;
}

.time-info {
  color: #6b7280;
  font-size: 13px;
  font-family: 'Monaco', monospace;
}

/* 配置区域样式 */
.config-section {
  margin-bottom: 20px;
}

.config-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 2px;
  margin-right: 8px;
  flex-shrink: 0;
}

/* 请求头样式优化 */
.headers-preview-enhanced {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.header-tag-enhanced {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  max-width: 100%;
  word-break: break-all;
}

.header-tag-enhanced strong {
  color: #1f2937;
}

/* 代码显示样式优化 */
.code-display-enhanced :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  padding: 16px;
}

/* 规则表格样式 */
.rules-table {
  border-radius: 8px;
  overflow: hidden;
}

.rules-table :deep(.el-table__header) {
  background: #f8fafc;
}

.rules-table :deep(.el-table th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

.rule-code {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  border: 1px solid #e2e8f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .template-view-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 20px auto;
  }
  
  .view-info-card :deep(.el-descriptions) {
    font-size: 13px;
  }
  
  .view-info-card :deep(.el-card__body) {
    padding: 15px;
  }
  
  .config-section {
    margin-bottom: 15px;
  }
}
</style>
