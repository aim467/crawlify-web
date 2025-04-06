<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
    <div class="mb-8 text-center">
      <img :src="logoUrl" alt="系统Logo" class="w-16 h-16 mx-auto mb-4 object-cover">
      <h1 class="text-2xl font-bold text-gray-800">爬虫管理平台</h1>
    </div>
    <div class="w-96 bg-white rounded-lg shadow-lg p-8">
      <el-form :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="loginForm.username" placeholder="请输入用户名" class="!rounded-button">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" class="!rounded-button">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-button type="primary" class="w-full !rounded-button" @click="handleLogin">登录</el-button>
      </el-form>
    </div>
    <div class="mt-8 text-gray-500 text-sm">© 2024 爬虫管理平台 版权所有</div>
  </div>
</template>

<script lang="ts" setup>
import { ref} from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['login']);
const router = useRouter();

const logoUrl = 'https://ai-public.mastergo.com/ai/img_res/de1e878e5cb64a628cbf9769892cac4b.jpg';
const loginForm = ref({
  username: '',
  password: ''
});

const handleLogin = () => {
  router.push('/');
};
</script>

<style scoped>
:deep(.el-input__wrapper) {
  box-shadow: none !important;
}
</style>