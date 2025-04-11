<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = ref(route.path)
const logoUrl = 'https://ai-public.mastergo.com/ai/img_res/de1e878e5cb64a628cbf9769892cac4b.jpg';

const handleSelect = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="sidebar-container">
    <div class="logo-container">
      <img :src="logoUrl" alt="Logo" class="logo-image">
    </div>
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      @select="handleSelect"
    >
    <el-menu-item index="/">
      <el-icon><Monitor /></el-icon>
      <span>网站配置</span>
    </el-menu-item>
    <el-menu-item index="/tasks">
      <el-icon><List /></el-icon>
      <span>任务管理</span>
    </el-menu-item>
    <el-menu-item index="/website-links">
      <el-icon><Link /></el-icon>
      <span>链接管理</span>
    </el-menu-item>
  </el-menu>
  </div>
</template>

<style scoped>
.sidebar-container {
  height: 100%;
  background-color: #1e293b;
  border-right: 1px solid #2d3748;
}

.logo-container {
  padding: 16px;
  background-color: #111827;
  border-bottom: 1px solid #2d3748;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-image {
  height: 32px;
  width: auto;
}

.sidebar-menu {
  border-right: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: #1e293b;
  height: calc(100% - 65px);
}

.el-menu-item {
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: #e2e8f0;
}

.el-menu-item:hover {
  background-color: #2d3748 !important;
  transform: translateX(4px);
  color: #60a5fa;
}

.el-menu-item.is-active {
  background: linear-gradient(45deg, #1976d2, #2196f3);
  color: #ffffff;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.25);
}

.el-menu-item .el-icon {
  margin-right: 12px;
  font-size: 18px;
}
</style>