<template>
  <el-header class="header-container">
    <div class="user-section">
      <el-dropdown trigger="click">
        <div class="user-info">
          <el-avatar :size="36" :src="userAvatar" class="user-avatar" />
          <span class="user-name">管理员</span>
          <el-icon class="dropdown-icon"><arrow-down /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="custom-dropdown">
            <el-dropdown-item @click="handleLogout">
              <el-icon><switch-button /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script lang="ts" setup>
import request from '../utils/request';
import { useAuthStore } from '../store/auth';
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue';

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
.header-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
  background: linear-gradient(to right, #ffffff, #f8f9fa);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 32px;
  width: 32px;
  margin-right: 12px;
  transition: transform 0.3s ease;
}

.logo-image:hover {
  transform: scale(1.1);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  background: linear-gradient(120deg, #409EFF, #67C23A);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  transition: all 0.3s ease;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 24px;
  transition: all 0.3s ease;
  background-color: rgba(64, 158, 255, 0.05);
}

.user-info:hover {
  background-color: rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.user-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-name {
  margin: 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

.custom-dropdown :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 10px 20px;
}

.custom-dropdown :deep(.el-dropdown-menu__item i) {
  margin-right: 8px;
  font-size: 16px;
}

.custom-dropdown :deep(.el-dropdown-menu__item:hover) {
  background-color: #f0f9eb;
  color: #67C23A;
}
</style>