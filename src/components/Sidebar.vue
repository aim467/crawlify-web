<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = ref(route.path)
import logoUrl from '../assets/logo.ico'

const handleSelect = (path: string) => {
  router.push(path)
}

// 添加Logo动画效果
const logoHovered = ref(false)
const toggleLogoHover = (isHovered: boolean) => {
  logoHovered.value = isHovered
}
</script>

<template>
  <div class="sidebar-container">
    <div 
      class="logo-container" 
      @mouseenter="toggleLogoHover(true)" 
      @mouseleave="toggleLogoHover(false)"
    >
      <div class="logo-wrapper" :class="{ 'logo-hovered': logoHovered }">
        <img :src="logoUrl" alt="Logo" class="logo-image">
      </div>
      <h1 class="logo-title">爬虫管理平台</h1>
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
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #1a2234 0%, #1e293b 100%);
  border-right: 1px solid #2d3748;
  z-index: 1000;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
}

.logo-container {
  padding: 20px 16px;
  background: linear-gradient(90deg, #1e293b, #2d3748);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 14px;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.logo-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #60a5fa, transparent);
}

.logo-wrapper {
  position: relative;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  transition: all 0.4s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.logo-hovered {
  transform: rotate(10deg) scale(1.1);
  box-shadow: 0 6px 12px rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.2);
}

.logo-image {
  height: 32px;
  width: auto;
  transition: all 0.3s ease;
}

.logo-title {
  color: #e2e8f0;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(90deg, #e2e8f0, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.sidebar-menu {
  border-right: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: transparent;
  height: calc(100vh - 81px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
  padding-top: 10px;
}

.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: #2d3748;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background-color: #4a5568;
  border-radius: 3px;
}

.el-menu-item {
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin: 6px 12px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: #e2e8f0;
  position: relative;
  overflow: hidden;
  height: 50px;
}

.el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: transparent;
  transition: all 0.3s ease;
}

.el-menu-item:hover {
  background-color: rgba(45, 55, 72, 0.7) !important;
  transform: translateX(4px);
  color: #60a5fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-menu-item:hover::before {
  background: #60a5fa;
}

.el-menu-item.is-active {
  background: linear-gradient(45deg, rgba(25, 118, 210, 0.8), rgba(33, 150, 243, 0.8));
  color: #ffffff;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.35);
}

.el-menu-item.is-active::before {
  background: #ffffff;
}

.el-menu-item .el-icon {
  margin-right: 14px;
  font-size: 20px;
  transition: all 0.3s ease;
}

.el-menu-item:hover .el-icon {
  transform: scale(1.1);
}

.el-menu-item span {
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}
</style>