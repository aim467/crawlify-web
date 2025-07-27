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
      <el-form-item label="基础URL" prop="columnUrl" class="url-input">
        <el-input v-model="form.columnUrl" placeholder="输入目标网页的基础URL，例如：https://example.com/list" />
      </el-form-item>
      <el-form-item label="请求头" prop="requestHead">
        <el-input v-model="form.requestHead" type="textarea" :rows="8" placeholder="请求头信息，JSON格式，可包含User-Agent、Cookie等" />
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
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 32px;
}

.form-group h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.config-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.config-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.config-form :deep(.el-input__wrapper),
.config-form :deep(.el-textarea__inner) {
  border-radius: 6px;
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
  padding: 0 8px;
}

/* 文本域样式优化 */
.config-form :deep(.el-textarea) {
  width: 100%;
}

.config-form :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
}

/* URL输入框特殊样式 */
.config-form .url-input :deep(.el-input__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}
</style> 