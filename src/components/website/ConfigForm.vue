<template>
  <el-form :model="form" ref="formRef" label-width="120px" :rules="rules" class="config-form">
    <!-- 基础配置 -->
    <div class="form-group">
      <h3>基础配置</h3>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="配置名称" prop="configName">
            <el-input v-model="form.configName" placeholder="请输入配置名称" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="请求类型" prop="requestType">
            <el-select v-model="form.requestType" placeholder="选择请求方式" style="width: 100%">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="父页面链接" prop="parentLink" class="url-input">
        <el-input v-model="form.parentLink" placeholder="请输入父页面链接" />
      </el-form-item>
      <el-form-item label="基础URL" prop="columnUrl" class="url-input">
        <el-input v-model="form.columnUrl" placeholder="输入目标网页的基础URL，例如：https://example.com/list" />
      </el-form-item>
      <el-form-item label="请求头" prop="requestHeadStr">
        <el-input v-model="form.requestHeadStr" type="textarea" :rows="8" placeholder="请求头信息，JSON格式，可包含User-Agent、Cookie等" />
      </el-form-item>
      <el-form-item label="请求体" prop="requestBody">
        <el-input v-model="form.requestBody" type="textarea" :rows="6" placeholder="POST请求时的请求体模板，可包含占位符<pageNum>" />
      </el-form-item>
    </div>

    <!-- 分页配置 -->
    <div class="form-group">
      <h3>分页配置</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="起始页码" prop="pageStart">
            <el-input-number v-model="form.pageStart" :min="0" placeholder="请输入起始页码" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="最大页数" prop="pageLen">
            <el-input-number v-model="form.pageLen" :min="1" placeholder="请输入最大页数" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="下一页URL" prop="nextPage" class="url-input">
        <el-input v-model="form.nextPage" placeholder="下一页的URL模板，使用<pageNum>作为页码占位符，例如：page=<pageNum>" />
      </el-form-item>
    </div>

    <!-- 数据提取 -->
    <div class="form-group">
      <h3>数据提取</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="结果类型" prop="resultType">
            <el-select v-model="form.resultType" placeholder="选择返回数据的格式类型" style="width: 100%">
              <el-option label="JSON" value="json" />
              <el-option label="XML" value="xml" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="列表规则" prop="resultListRule" class="url-input">
            <el-input v-model="form.resultListRule" placeholder="数据提取规则，JSON使用JSONPath，XML使用XPath表达式" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="详情链接" prop="detailUrlRule" class="url-input">
        <el-input v-model="form.detailUrlRule" placeholder="提取详情页URL的规则，支持JSONPath或XPath表达式" />
      </el-form-item>
      <el-form-item label="结果清洗" prop="resultClean">
        <el-input v-model="form.resultClean" type="textarea" :rows="4" placeholder="使用正则表达式清洗和格式化提取到的数据" />
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';
import type { DynamicConfig } from '@/types/dynamicConfig';
import { CONFIG_FORM_RULES } from '@/constants/configFormConstants';

interface Props {
  form: DynamicConfig;
}

defineProps<Props>();

const formRef = ref<FormInstance>();
const rules = CONFIG_FORM_RULES;

// 暴露验证方法给父组件
defineExpose({
  validate: (callback?: (valid: boolean) => void) => {
    if (!formRef.value) return Promise.reject('Form instance not found');
    return formRef.value.validate(callback);
  },
  resetFields: () => formRef.value?.resetFields()
});
</script>

<style scoped>
.config-form {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background: transparent;
  position: relative;
  z-index: 2;
}

.form-group {
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 20px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.form-group:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.form-group h3 {
  margin: 0 0 24px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  padding: 0 0 12px 0;
  border-bottom: 2px solid transparent;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: flex;
  align-items: center;
}

.form-group h3::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-right: 12px;
  flex-shrink: 0;
}

.form-group h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, transparent 100%);
  border-radius: 1px;
}

.config-form :deep(.el-form-item) {
  margin-bottom: 24px !important;
}

.config-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.config-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
}

.config-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.config-form :deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.config-form :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.config-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
}

.config-form :deep(.el-textarea__inner:hover) {
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.config-form :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.config-form :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

/* 小尺寸字段优化 */
.config-form :deep(.el-col-8 .el-input__wrapper),
.config-form :deep(.el-col-8 .el-select__wrapper) {
  text-align: center;
}

.config-form :deep(.el-input-number) {
  width: 100%;
}

.config-form :deep(.el-input-number .el-input__wrapper) {
  padding: 0 12px;
  border-radius: 8px;
}

.config-form :deep(.el-input-number .el-input__inner) {
  text-align: center;
  font-weight: 500;
}

/* URL输入框特殊样式 */
.config-form .url-input :deep(.el-input__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #475569;
}

.config-form .url-input :deep(.el-input__wrapper) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.config-form .url-input :deep(.el-input__wrapper:focus-within) {
  background: #ffffff;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .form-group {
    margin-bottom: 16px;
    padding: 20px;
    border-radius: 8px;
  }
  
  .form-group h3 {
    font-size: 15px;
    margin-bottom: 20px;
  }
  
  .config-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

/* 滚动条优化 */
.config-form::-webkit-scrollbar {
  width: 6px;
}

.config-form::-webkit-scrollbar-track {
  background: transparent;
}

.config-form::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.config-form::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

:deep(.el-form-item__label) {
  align-items: center;
}
</style>