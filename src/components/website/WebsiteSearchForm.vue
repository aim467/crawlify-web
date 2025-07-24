<template>
  <el-card shadow="never" class="search-card">
    <el-form 
      ref="searchFormRef" 
      :model="searchForm" 
      inline 
      label-position="left" 
      label-width="auto"
      class="search-form"
    >
      <div class="form-row">
        <el-form-item label="网站名称:" prop="name">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入网站名称" 
            clearable 
            style="width: 220px" 
          />
        </el-form-item>
        <el-form-item label="基础URL:" prop="baseUrl">
          <el-input 
            v-model="searchForm.baseUrl" 
            placeholder="请输入基础URL" 
            clearable 
            style="width: 220px" 
          />
        </el-form-item>
        <el-form-item label="域名:" prop="domain">
          <el-input 
            v-model="searchForm.domain" 
            placeholder="请输入域名" 
            clearable 
            style="width: 220px" 
          />
        </el-form-item>
        <el-form-item label="字符编码:" prop="charset">
          <el-input 
            v-model="searchForm.charset" 
            placeholder="请输入字符编码" 
            clearable 
            style="width: 220px" 
          />
        </el-form-item>
      </div>
      <div class="form-row">
        <el-form-item label="超时时间:" prop="timeOut">
          <el-input-number 
            v-model="searchForm.timeOut" 
            :min="1" 
            :max="60" 
            placeholder="请输入超时时间(秒)" 
            clearable
            style="width: 220px" 
          />
        </el-form-item>
        <el-form-item label="重试次数:" prop="retryTimes">
          <el-input-number 
            v-model="searchForm.retryTimes" 
            :min="0" 
            :max="10" 
            placeholder="请输入重试次数" 
            clearable
            style="width: 220px" 
          />
        </el-form-item>
        <el-form-item label="循环重试次数:" prop="cycleRetryTimes">
          <el-input-number 
            v-model="searchForm.cycleRetryTimes" 
            :min="0" 
            :max="10" 
            placeholder="请输入循环重试次数" 
            clearable
            style="width: 220px" 
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" icon="search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';
import type { SearchForm } from '../../composables/useWebsiteList';

interface Props {
  searchForm: SearchForm;
}

interface Emits {
  (e: 'search'): void;
  (e: 'reset'): void;
} 

defineProps<Props>();
const emit = defineEmits<Emits>();

const searchFormRef = ref<FormInstance>();

const handleSearch = () => {
  emit('search');
};

const handleReset = () => {
  emit('reset');
};

defineExpose({
  searchFormRef
});
</script>

<style scoped>
.search-card {
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.search-form .form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.search-form .form-row:last-child {
  margin-bottom: 0;
}

.el-form--inline .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}

.el-input-number {
  width: 100%;
}
</style> 