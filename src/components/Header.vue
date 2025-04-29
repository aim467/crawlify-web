<template>
  <el-header class="bg-white border-b border-gray-200 flex items-center justify-between px-6">
    <h2 class="text-lg font-medium">{{ pageTitle }}</h2>
    <div class="flex items-center space-x-4">
      <el-dropdown>
        <span class="flex items-center cursor-pointer">
          <el-avatar :size="32" :src="userAvatar" />
          <span class="ml-2">管理员</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script lang="ts" setup>
import request from '../utils/request';
import { useAuthStore } from '../store/auth';

const props = defineProps<{
  pageTitle: string;
  userAvatar: string;
}>();

const emit = defineEmits(['logout']);
const authStore = useAuthStore();

const handleLogout = async () => {
  try {
    await request.post('/logout');
    authStore.clearToken();
    emit('logout');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};
</script>

<style scoped>
.el-header {
  height: 64px;
  line-height: 64px;
}
</style>