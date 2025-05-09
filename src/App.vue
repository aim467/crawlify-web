<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 页面标题
const pageTitle = computed(() => {
  // 根据当前路由设置页面标题
  return '爬虫管理平台'
})

// 用户头像
const userAvatar = 'https://ai-public.mastergo.com/ai/img_res/e15c52610672e56b8bdc79a1d44e5625.jpg'

// 登出处理
const handleLogout = () => {
  localStorage.removeItem('isAuthenticated')
  router.push('/login')
}
</script>

<template>
  <router-view v-slot="{ Component }">
    <template v-if="$route.path === '/login'">
      <component :is="Component" />
    </template>
    <template v-else>
      <div class="layout">
        <Sidebar class="sidebar" />
        <div class="main-container">
          <Header :page-title="pageTitle" :user-avatar="userAvatar" @logout="handleLogout" class="header" />
          <div class="main-content">
            <component :is="Component" />
          </div>
        </div>
      </div>
    </template>
  </router-view>
</template>

<style>
#app {
  width: 100%;
  height: 100vh;
}

.layout {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 220px;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #e5e7eb;
}

.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.header {
  height: 64px;
  line-height: 64px;
  padding: 0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

.main-content {
  flex: 1;
  /* margin: 20px; */
  background-color: #ffffff;
  overflow-y: auto;
}

/* 全局弹窗样式 */
:root {
  --el-dialog-padding-primary: 24px;
  --el-dialog-bg-color: #ffffff;
  --el-dialog-header-bg: linear-gradient(to right, #f8f9fa, #f0f2f5);
  --el-dialog-title-color: #1a1a1a;
  --el-dialog-border-radius: 8px;
  --el-dialog-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  --el-dialog-header-height: 56px;
}

/* 弹窗容器 */
.el-overlay {
  backdrop-filter: blur(2px);
  transition: backdrop-filter 0.3s ease;
}

.el-dialog {
  border-radius: var(--el-dialog-border-radius) !important;
  overflow: hidden !important;
  box-shadow: var(--el-dialog-shadow) !important;
  border: none !important;
  transition: transform 0.3s ease, opacity 0.3s ease !important;
}

/* 不同尺寸的弹窗样式 */
.el-dialog.is-small {
  max-width: 400px !important;
}

.el-dialog.is-large {
  min-width: 800px !important;
}

.el-dialog.is-fullscreen {
  width: 95vw !important;
  height: 90vh !important;
  margin: 5vh auto !important;
  display: flex !important;
  flex-direction: column !important;
}

.el-dialog.is-fullscreen .el-dialog__body {
  flex: 1 !important;
  max-height: none !important;
}

/* 内容阴影效果 */
.el-dialog__body {
  position: relative !important;
}

.el-dialog__body::after {
  content: "" !important;
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 20px !important;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.8), transparent) !important;
  pointer-events: none !important;
  opacity: 0 !important;
  transition: opacity 0.3s ease !important;
}

.el-dialog__body:not(:hover)::after {
  opacity: 0 !important;
}

.el-dialog__body:hover::after {
  opacity: 1 !important;
}

/* 弹窗头部 */
.el-dialog__header {
  background: var(--el-dialog-header-bg) !important;
  margin: 0 !important;
  padding: 0 var(--el-dialog-padding-primary) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
  position: relative !important;
  height: var(--el-dialog-header-height) !important;
  display: flex !important;
  align-items: center !important;
}

/* 弹窗标题 */
.el-dialog__title {
  font-weight: 600 !important;
  color: var(--el-dialog-title-color) !important;
  font-size: 16px !important;
  letter-spacing: 0.3px !important;
  line-height: var(--el-dialog-header-height) !important;
  height: var(--el-dialog-header-height) !important;
  display: inline-block !important;
  vertical-align: middle !important;
  margin-right: 30px !important; /* 为关闭按钮留出空间 */
}

/* 弹窗内容区域 */
.el-dialog__body {
  padding: var(--el-dialog-padding-primary) !important;
  background-color: var(--el-dialog-bg-color) !important;
  color: #333 !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  max-height: calc(80vh - var(--el-dialog-header-height) - 60px) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: thin !important;
}

/* 自定义滚动条样式 */
.el-dialog__body::-webkit-scrollbar {
  width: 6px !important;
  height: 6px !important;
}

.el-dialog__body::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3) !important;
  border-radius: 6px !important;
}

.el-dialog__body::-webkit-scrollbar-thumb:hover {
  background-color: rgba(144, 147, 153, 0.5) !important;
}

.el-dialog__body::-webkit-scrollbar-track {
  background-color: transparent !important;
}

/* 弹窗底部 */
.el-dialog__footer {
  padding: 12px var(--el-dialog-padding-primary) !important;
  background-color: var(--el-dialog-bg-color) !important;
  border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
}

/* 关闭按钮 */
.el-dialog__headerbtn {
  top: 50% !important;
  transform: translateY(-50%) !important;
  right: 20px !important;
  font-size: 18px !important;
  transition: all 0.2s ease !important;
  height: 32px !important;
  width: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.el-dialog__headerbtn:hover {
  transform: translateY(-50%) rotate(90deg) !important;
}

.el-dialog__headerbtn .el-dialog__close {
  color: #909399 !important;
  font-size: 16px !important;
  transition: all 0.2s ease !important;
}

.el-dialog__headerbtn:hover .el-dialog__close {
  color: var(--el-color-primary) !important;
}

/* 添加关闭按钮的背景效果 */
.el-dialog__headerbtn::before {
  content: "" !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
  border-radius: 50% !important;
  transform: scale(0) !important;
  transition: transform 0.2s ease !important;
  z-index: -1 !important;
}

.el-dialog__headerbtn:hover::before {
  transform: scale(1) !important;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 12px !important;
}

/* 弹窗动画效果 */
.el-overlay-dialog {
  animation: fadeIn 0.3s ease-out forwards;
}

.el-dialog {
  animation: dialogZoomIn 0.3s ease-out forwards;
  transform-origin: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes dialogZoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 弹窗关闭动画 */
.dialog-fade-leave-active {
  animation: dialogZoomOut 0.2s ease-in forwards !important;
}

@keyframes dialogZoomOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* 弹窗内表单元素样式优化 */
.el-dialog .el-form-item {
  margin-bottom: 20px !important;
}

.el-dialog .el-input__wrapper,
.el-dialog .el-textarea__wrapper {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) inset !important;
  border-radius: 4px !important;
  transition: box-shadow 0.2s ease-in-out !important;
}

.el-dialog .el-input__wrapper:hover,
.el-dialog .el-textarea__wrapper:hover {
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset !important;
}

.el-dialog .el-input__wrapper.is-focus,
.el-dialog .el-textarea__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
}

.el-dialog .el-button {
  border-radius: 4px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

.el-dialog .el-button:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.el-dialog .el-button--primary {
  background: linear-gradient(to right, var(--el-color-primary), var(--el-color-primary-light-3)) !important;
  border: none !important;
}

.el-dialog .el-button--primary:hover {
  background: linear-gradient(to right, var(--el-color-primary-dark-2), var(--el-color-primary)) !important;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .el-dialog {
    width: 90% !important;
    margin: 5vh auto !important;
  }

  :root {
    --el-dialog-padding-primary: 16px;
  }

  .el-dialog .el-form-item {
    margin-bottom: 16px !important;
  }
}
</style>
