<template>
  <el-drawer
    v-model="internalVisible"
    :title="isEditMode ? '编辑模板配置' : '新增模板配置'"
    direction="rtl"
    :size="drawerSize"
    :close-on-click-modal="false"
    class="template-drawer"
    destroy-on-close
  >
    <div class="drawer-content">
      <!-- 导入命令区域 -->
      <div class="import-section" v-if="!isEditMode">
        <h3>快速导入</h3>
        <p class="section-desc">支持 curl 或 fetch 命令一键导入配置</p>
        <el-input
          v-model="importCommand"
          type="textarea"
          :rows="4"
          placeholder="请输入curl或fetch命令，例如: curl -X GET 'https://example.com/api' -H 'Content-Type: application/json'"
          class="import-input"
        />
        <el-button type="primary" class="import-btn" @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入配置
        </el-button>
      </div>

      <!-- 表单区域 -->
      <div class="form-content">
        <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
          <!-- 基础配置区域 -->
          <el-card shadow="never" class="form-section-card">
            <template #header>
              <div class="section-header">
                <i class="el-icon-setting"></i>
                <span>基础配置</span>
              </div>
            </template>
            
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="配置名称" prop="configName">
                  <el-input 
                    v-model="formData.configName" 
                    placeholder="请输入配置名称" 
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="基础URL" prop="columnUrl">
                  <el-input 
                    v-model="formData.columnUrl" 
                    placeholder="请输入基础URL，例如：https://api.example.com/data"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="请求类型" prop="requestType">
                  <el-select v-model="formData.requestType" placeholder="请选择请求类型" style="width: 100%">
                    <el-option 
                      v-for="item in REQUEST_TYPES" 
                      :key="item.value" 
                      :label="item.label" 
                      :value="item.value" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="起始页码" prop="pageStart">
                  <el-input-number 
                    v-model="formData.pageStart" 
                    :min="0" 
                    :max="999"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最大页数" prop="pageLen">
                  <el-input-number 
                    v-model="formData.pageLen" 
                    :min="1" 
                    :max="9999"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="14">
                <el-form-item label="下一页URL模板" prop="nextPage">
                  <el-input 
                    v-model="formData.nextPage" 
                    placeholder="包含 &lt;pageNum&gt; 占位符的URL模板，例如：https://api.example.com/data?page=&lt;pageNum&gt;"
                  />
                  <div class="form-tip">
                    <i class="el-icon-info"></i>
                    使用 &lt;pageNum&gt; 作为页码占位符，主要用于GET请求的分页
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="父页面链接" prop="parentLink">
                  <el-input 
                    v-model="formData.parentLink" 
                    placeholder="请输入父页面链接"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row>
              <el-col :span="12">
                <el-form-item label="是否使用脚本" prop="useScript">
                  <el-select v-model="formData.useScript" placeholder="请选择是否使用脚本">
                    <el-option label="否" :value="0" />
                    <el-option label="是" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <!-- 请求配置区域 -->
          <el-card shadow="never" class="form-section-card">
            <template #header>
              <div class="section-header">
                <i class="el-icon-connection"></i>
                <span>请求配置</span>
              </div>
            </template>

            <el-form-item label="请求体模板" prop="requestBody">
              <el-input 
                v-model="formData.requestBody" 
                type="textarea" 
                :rows="4"
                placeholder="POST请求时的请求体模板，可包含 &lt;pageNum&gt; 占位符"
              />
              <div class="form-tip">
                <i class="el-icon-info"></i>
                仅在POST请求时需要填写，支持JSON格式
              </div>
            </el-form-item>

            <el-form-item label="请求头配置" prop="requestHead">
              <div class="request-headers-container">
                <div class="headers-input-area">
                  <el-input 
                    :model-value="requestHeadersText" 
                    type="textarea" 
                    :rows="6"
                    placeholder='请输入JSON格式的请求头配置，例如：&#10;{&#10;  "Content-Type": "application/json",&#10;  "Authorization": "Bearer your-token",&#10;  "User-Agent": "Mozilla/5.0..."&#10;}'
                    @input="$emit('update:request-headers-text', $event)"
                    @blur="$emit('parse-headers')"
                  />
                </div>
                <div class="headers-preview" v-if="Object.keys(formData.requestHead || {}).length > 0">
                  <div class="preview-title">当前配置预览：</div>
                  <el-tag 
                    v-for="(value, key) in formData.requestHead" 
                    :key="key" 
                    closable 
                    @close="$emit('remove-header', key)"
                    class="header-tag"
                  >
                    {{ key }}: {{ value }}
                  </el-tag>
                </div>
              </div>
            </el-form-item>
          </el-card>

          <!-- 结果处理配置区域 -->
          <el-card shadow="never" class="form-section-card">
            <template #header>
              <div class="section-header">
                <i class="el-icon-document"></i>
                <span>结果处理配置</span>
              </div>
            </template>

            <el-row :gutter="24">
              <el-col :span="6">
                <el-form-item label="结果类型" prop="resultType">
                  <el-select v-model="formData.resultType" placeholder="请选择结果类型" style="width: 100%">
                    <el-option 
                      v-for="item in RESULT_TYPES" 
                      :key="item.value" 
                      :label="item.label" 
                      :value="item.value" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="18">
                <el-form-item label="结果清洗正则" prop="resultClean">
                  <el-input 
                    v-model="formData.resultClean" 
                    placeholder="用于清洗结果的正则表达式，例如：^.*?({.*}).*$ 用于提取JSON部分"
                  />
                  <div class="form-tip">
                    <i class="el-icon-info"></i>
                    可选字段，用于从响应中提取有效的数据部分
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="列表获取表达式" prop="resultListRule">
              <el-input 
                v-model="formData.resultListRule" 
                placeholder="用于从结果中提取列表的表达式，如JSONPath: $.data.list 或 XPath: //item"
              />
              <div class="form-tip">
                <i class="el-icon-info"></i>
                JSON类型使用JSONPath语法（如：$.data.list），XML类型使用XPath语法（如：//item）
              </div>
            </el-form-item>
          </el-card>

          <!-- 字段规则配置区域 -->
          <el-card shadow="never" class="form-section-card">
            <template #header>
              <div class="section-header">
                <i class="el-icon-menu"></i>
                <span>字段提取规则配置</span>
                <el-button 
                  type="primary" 
                  size="small" 
                  icon="Plus" 
                  @click="$emit('add-field-rule')"
                  style="margin-left: auto;"
                >
                  添加字段规则
                </el-button>
              </div>
            </template>

            <div class="field-rules-container">
              <div 
                v-for="(rule, index) in formData.fieldRules" 
                :key="index" 
                class="field-rule-item"
              >
                <div class="field-rule-header">
                  <span class="rule-index">字段规则 #{{ index + 1 }}</span>
                  <el-button 
                    type="danger" 
                    size="small" 
                    icon="Delete" 
                    circle 
                    @click="$emit('remove-field-rule', index)"
                  />
                </div>
                <el-row :gutter="24">
                  <el-col :span="6">
                    <el-form-item :prop="`fieldRules.${index}.name`" label="字段名称">
                      <el-input 
                        v-model="rule.name" 
                        placeholder="如：title, price, url"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :prop="`fieldRules.${index}.desc`" label="字段描述">
                      <el-input 
                        v-model="rule.desc" 
                        placeholder="如：文章标题, 商品价格, 详情链接"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                    <el-form-item :prop="`fieldRules.${index}.rule`" label="提取规则">
                      <el-input 
                        v-model="rule.rule" 
                        placeholder="如：$.title, //h1/text(), .title"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
              
              <div v-if="!formData.fieldRules || formData.fieldRules.length === 0" class="empty-field-rules">
                <el-empty 
                  description="暂无字段规则配置" 
                  :image-size="80"
                >
                  <el-button type="primary" @click="$emit('add-field-rule')">添加第一个字段规则</el-button>
                </el-empty>
              </div>
            </div>
          </el-card>
        </el-form>
      </div>
      
      <!-- 抽屉底部操作栏 -->
      <div class="drawer-footer">
        <el-button @click="internalVisible = false" size="large">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
          {{ isEditMode ? '更新' : '创建' }}
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import type { TemplateConfig } from '../../types/templateConfig';
import { REQUEST_TYPES, RESULT_TYPES } from '../../types/templateConfig';
import { templateConfigFormRules } from '../../utils/formValidators';
import { parseCommand } from '../../utils/commandParser';

// Props
interface Props {
  visible: boolean;
  formData: TemplateConfig;
  isEditMode: boolean;
  loading: boolean;
  requestHeadersText: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean];
  'update:form-data': [formData: TemplateConfig];
  'update:request-headers-text': [text: string];
  submit: [];
  'parse-headers': [];
  'remove-header': [key: string];
  'add-field-rule': [];
  'remove-field-rule': [index: number];
}>();

// Refs
const formRef = ref<FormInstance>();
const importCommand = ref('');

// Computed
const internalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const formRules = templateConfigFormRules;

// 响应式抽屉大小
const drawerSize = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 768) return '95%';      // 手机端
    if (width < 1200) return '85%';     // 平板端
    if (width < 1600) return '75%';     // 小桌面
    return '65%';                       // 大桌面
  }
  return '80%';
});

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    emit('submit');
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

// 导入命令
const handleImport = async () => {
  if (!importCommand.value.trim()) {
    ElMessage.warning('请输入curl或fetch命令');
    return;
  }

  try {
    const result = parseCommand(importCommand.value);
    
    // 更新表单字段
    const updatedForm = {
      ...props.formData,
      columnUrl: result.url,
      nextPage: result.url,
      requestType: result.method,
      requestBody: typeof result.body === 'string' 
        ? result.body 
        : JSON.stringify(result.body, null, 2)
    };

    // 处理请求头
    if (result.headers && Object.keys(result.headers).length > 0) {
      updatedForm.requestHead = result.headers;
      emit('update:request-headers-text', JSON.stringify(result.headers, null, 2));
    } else {
      updatedForm.requestHead = {};
      emit('update:request-headers-text', '');
    }

    emit('update:form-data', updatedForm);
    ElMessage.success('导入成功');
  } catch (error) {
    ElMessage.error(`导入失败: ${(error as Error).message}`);
  }
};

// Watch for form data changes
watch(() => props.formData, (newData) => {
  // Form data is managed by parent component
}, { deep: true });
</script>

<style scoped>
/* 抽屉表单样式 */
.template-drawer :deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  margin-bottom: 0;
}

.template-drawer :deep(.el-drawer__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.template-drawer :deep(.el-drawer__close-btn) {
  color: white;
  font-size: 20px;
}

.template-drawer :deep(.el-drawer__close-btn):hover {
  color: rgba(255, 255, 255, 0.8);
}

/* 导入区域 */
.import-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
  padding: 24px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.15);
  position: relative;
  z-index: 2;
}

.import-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, transparent 100%);
  border-radius: 0 0 2px 2px;
}

.import-section h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  position: relative;
  display: flex;
  align-items: center;
}

.import-section h3::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-right: 10px;
  flex-shrink: 0;
}

.section-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.import-input {
  margin-bottom: 12px;
}

.import-input :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  border-radius: 6px;
}

.import-btn {
  border-radius: 6px;
  font-weight: 500;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.template-drawer .form-content .el-form {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.drawer-footer {
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  padding: 20px;
  margin: 0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.form-section-card {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.form-section-card :deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 15px 20px;
}

.form-section-card :deep(.el-card__body) {
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.section-header i {
  margin-right: 8px;
  color: #409eff;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
}

.form-tip i {
  margin-right: 4px;
}

/* 请求头配置样式 */
.request-headers-container {
  width: 100%;
}

.headers-input-area {
  margin-bottom: 15px;
}

.headers-preview {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
}

.preview-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.header-tag {
  margin: 4px 8px 4px 0;
  max-width: 300px;
}

/* 字段规则配置样式 */
.field-rules-container {
  min-height: 100px;
}

.field-rule-item {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.field-rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.rule-index {
  font-weight: 600;
  color: #409eff;
}

.empty-field-rules {
  text-align: center;
  padding: 20px;
}

/* 抽屉滚动条样式 */
.template-drawer .el-form::-webkit-scrollbar {
  width: 8px;
}

.template-drawer .el-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.template-drawer .el-form::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.template-drawer .el-form::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .template-drawer :deep(.el-drawer__header) {
    padding: 15px;
  }
  
  .template-drawer :deep(.el-drawer__body) {
    padding: 15px;
  }
  
  .drawer-footer {
    padding: 15px;
    margin: 0 -15px -15px;
  }
  
  .template-drawer .el-row {
    margin: 0 !important;
  }
  
  .template-drawer .el-col {
    padding: 0 8px !important;
  }
  
  .form-section-card :deep(.el-card__body) {
    padding: 15px;
  }
  
  .template-drawer :deep(.el-form-item__label) {
    font-size: 13px;
  }
}
</style>
