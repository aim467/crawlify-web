<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { StagewiseToolbar } from '@stagewise/toolbar-vue'
import VuePlugin from '@stagewise-plugins/vue'

const router = useRouter()

// Stagewise configuration
const stagewise_config = {
  plugins: [VuePlugin]
}

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

// 防止弹窗闪烁
onMounted(() => {
  // 添加loading类
  document.documentElement.classList.add('loading')

  // 页面完全加载后移除loading类
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.documentElement.classList.remove('loading')
    }, 100) // 短暂延迟确保所有资源都已加载
  })

  // 如果页面已经加载完成，立即移除loading类
  if (document.readyState === 'complete') {
    setTimeout(() => {
      document.documentElement.classList.remove('loading')
    }, 100)
  }
})
</script>

<template>
  <StagewiseToolbar :config="stagewise_config" />
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

/* 防止弹窗闪烁的全局修复 */
.v-modal {
  opacity: 0;
  transition: opacity 0.3s ease !important;
}

/* 确保弹窗在初始加载时不可见，直到完全准备好 */
.el-dialog__wrapper {
  opacity: 0;
  visibility: hidden; /* 使用visibility而不是display:none，以便过渡效果能正常工作 */
  transition: opacity 0.3s ease, visibility 0.3s ease !important;
}

.el-dialog__wrapper.dialog-fade-enter-active,
.el-dialog__wrapper.dialog-fade-leave-active,
.el-dialog__wrapper.dialog-fade-enter-to {
  opacity: 1;
  visibility: visible;
}

/* 添加全局样式，防止页面加载时弹窗闪烁 */
html.loading .el-dialog__wrapper,
html.loading .v-modal {
  display: none !important;
}

.layout {
  display: flex;
  height: 100%;
}

.main-container {
  flex: 1;
  margin-left: 240px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f8fafc;
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
  transition: backdrop-filter 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

/* 防止初始渲染时闪烁 */
.el-overlay-dialog:not(.dialog-fade-enter-active):not(.dialog-fade-leave-active) {
  animation: none !important;
  transition: none !important;
}

.el-dialog {
  border-radius: var(--el-dialog-border-radius) !important;
  overflow: hidden !important;
  box-shadow: var(--el-dialog-shadow) !important;
  border: none !important;
  transform: translateZ(0) !important; /* 启用GPU加速 */
  -webkit-font-smoothing: antialiased !important; /* 平滑字体 */
  -moz-osx-font-smoothing: grayscale !important;
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
  /* 添加平滑过渡效果，防止闪烁 */
  opacity: 1 !important; /* 默认可见，由特定选择器控制隐藏 */
  transition: opacity 0.2s ease !important;
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

/* 弹窗动画效果 - 使用transition代替animation避免闪烁 */
.el-overlay {
  transition: opacity 0.3s ease, backdrop-filter 0.3s ease !important;
}

.el-dialog {
  transform-origin: center !important;
  transition: transform 0.3s ease, opacity 0.3s ease !important;
  opacity: 1 !important;
  transform: scale(1) !important;
  will-change: transform, opacity !important; /* 优化性能 */
  backface-visibility: hidden !important; /* 防止闪烁 */
  -webkit-backface-visibility: hidden !important;
}

/* 弹窗进入和离开的过渡效果 */
.dialog-fade-enter-from .el-overlay,
.dialog-fade-leave-to .el-overlay {
  opacity: 0 !important;
}

.dialog-fade-enter-from .el-dialog,
.dialog-fade-leave-to .el-dialog {
  opacity: 0 !important;
  transform: scale(0.95) !important;
}

/* 确保过渡期间不会有闪烁 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease !important;
  pointer-events: none !important; /* 过渡期间禁止交互 */
}

/* 确保弹窗内容在过渡期间不会闪烁 */
.el-dialog__wrapper {
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: opacity 0.3s ease !important;
}

/* 防止内容闪烁 */
.dialog-fade-enter-from .el-dialog__body {
  opacity: 0 !important;
}

.dialog-fade-enter-active .el-dialog__body {
  transition-delay: 0.15s !important; /* 延迟显示内容，等弹窗动画完成 */
}

/* 确保弹窗在打开前不可见 - 使用visibility而不是display:none */
.el-dialog__wrapper:not(.dialog-fade-enter-active):not(.dialog-fade-leave-active):not(.dialog-fade-enter-to) {
  visibility: hidden !important;
  opacity: 0 !important;
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

/* ========== El-Drawer 全局样式美化 ========== */
:deep(.el-drawer) {
  border-radius: 8px 0 0 8px !important;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.08) !important;
  border: none !important;
  background-color: #ffffff !important;
  overflow: hidden !important;
  transform: translateZ(0) !important; /* 启用GPU加速 */
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}

/* 右侧抽屉样式 */
:deep(.el-drawer.rtl) {
  border-radius: 0 8px 8px 0 !important;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08) !important;
}

/* 抽屉遮罩层 */
:deep(.el-overlay) {
  backdrop-filter: blur(3px) !important;
  background-color: rgba(0, 0, 0, 0.4) !important;
  transition: backdrop-filter 0.3s ease, background-color 0.3s ease !important;
}

/* 抽屉头部 */
:deep(.el-drawer__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  margin: 0 !important;
  padding: 0 20px !important;
  border-bottom: none !important;
  height: 56px !important;
  display: flex !important;
  align-items: center !important;
  position: relative !important;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.15) !important;
}

/* 抽屉标题 */
:deep(.el-drawer__title) {
  font-weight: 600 !important;
  color: #ffffff !important;
  font-size: 16px !important;
  letter-spacing: 0.3px !important;
  line-height: 1.3 !important;
  margin: 0 !important;
  flex: 1 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
  position: relative !important;
}

/* 抽屉标题装饰 */
:deep(.el-drawer__title::before) {
  content: '' !important;
  position: absolute !important;
  left: -12px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 3px !important;
  height: 18px !important;
  background: rgba(255, 255, 255, 0.8) !important;
  border-radius: 2px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

/* 抽屉内容区域 */
:deep(.el-drawer__body) {
  padding: 0 !important;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%) !important;
  color: #333 !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  height: calc(100% - 56px) !important;
  scrollbar-width: thin !important;
  position: relative !important;
}

/* 抽屉内容区域顶部装饰 */
:deep(.el-drawer__body::before) {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 4px !important;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, transparent 100%) !important;
  z-index: 1 !important;
}

/* 自定义滚动条样式 */
:deep(.el-drawer__body::-webkit-scrollbar) {
  width: 6px !important;
  height: 6px !important;
}

:deep(.el-drawer__body::-webkit-scrollbar-thumb) {
  background-color: rgba(144, 147, 153, 0.3) !important;
  border-radius: 6px !important;
  transition: background-color 0.2s ease !important;
}

:deep(.el-drawer__body::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(144, 147, 153, 0.5) !important;
}

:deep(.el-drawer__body::-webkit-scrollbar-track) {
  background-color: transparent !important;
}

/* 关闭按钮 */
:deep(.el-drawer__close-btn) {
  position: absolute !important;
  top: 50% !important;
  right: 20px !important;
  transform: translateY(-50%) !important;
  width: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  background-color: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  z-index: 10 !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-drawer__close-btn:hover) {
  background-color: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-50%) scale(1.1) rotate(90deg) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

:deep(.el-drawer__close-btn .el-icon) {
  color: #ffffff !important;
  font-size: 18px !important;
  transition: all 0.3s ease !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2)) !important;
}

:deep(.el-drawer__close-btn:hover .el-icon) {
  color: #ffffff !important;
  transform: scale(1.1) !important;
}

/* 抽屉动画效果 */
:deep(.el-drawer.ltr) {
  transform: translateX(0) !important;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

:deep(.el-drawer.rtl) {
  transform: translateX(0) !important;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

/* 抽屉进入和离开动画 */
:deep(.el-drawer-fade-enter-from .el-drawer.ltr) {
  transform: translateX(-100%) !important;
}

:deep(.el-drawer-fade-enter-from .el-drawer.rtl) {
  transform: translateX(100%) !important;
}

:deep(.el-drawer-fade-leave-to .el-drawer.ltr) {
  transform: translateX(-100%) !important;
}

:deep(.el-drawer-fade-leave-to .el-drawer.rtl) {
  transform: translateX(100%) !important;
}

/* 抽屉内表单元素样式优化 */
:deep(.el-drawer .el-form-item) {
  margin-bottom: 20px !important;
}

:deep(.el-drawer .el-form-item__label) {
  font-weight: 500 !important;
  color: #333 !important;
}

:deep(.el-drawer .el-input__wrapper),
:deep(.el-drawer .el-textarea__wrapper),
:deep(.el-drawer .el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) inset !important;
  border-radius: 6px !important;
  transition: box-shadow 0.2s ease-in-out !important;
  background-color: #fafafa !important;
}

:deep(.el-drawer .el-input__wrapper:hover),
:deep(.el-drawer .el-textarea__wrapper:hover),
:deep(.el-drawer .el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset !important;
  background-color: #ffffff !important;
}

:deep(.el-drawer .el-input__wrapper.is-focus),
:deep(.el-drawer .el-textarea__wrapper.is-focus),
:deep(.el-drawer .el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
  background-color: #ffffff !important;
}

/* 抽屉内按钮样式 */
:deep(.el-drawer .el-button) {
  border-radius: 6px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  letter-spacing: 0.3px !important;
}

:deep(.el-drawer .el-button:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}

:deep(.el-drawer .el-button--primary) {
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3)) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3) !important;
}

:deep(.el-drawer .el-button--primary:hover) {
  background: linear-gradient(135deg, var(--el-color-primary-dark-2), var(--el-color-primary)) !important;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4) !important;
}

:deep(.el-drawer .el-button--default) {
  background-color: #ffffff !important;
  border: 1px solid #e4e7ed !important;
  color: #606266 !important;
}

:deep(.el-drawer .el-button--default:hover) {
  background-color: #f5f7fa !important;
  border-color: var(--el-color-primary-light-5) !important;
  color: var(--el-color-primary) !important;
}

/* 抽屉底部操作区域样式 */
:deep(.el-drawer .drawer-footer) {
  position: sticky !important;
  bottom: 0 !important;
  background: linear-gradient(to top, #ffffff 0%, rgba(248, 250, 252, 0.95) 100%) !important;
  padding: 20px 24px !important;
  margin-top: 24px !important;
  border-top: 1px solid rgba(102, 126, 234, 0.1) !important;
  display: flex !important;
  justify-content: flex-end !important;
  gap: 12px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 -2px 12px rgba(102, 126, 234, 0.08) !important;
}

/* 抽屉底部装饰线 */
:deep(.el-drawer .drawer-footer::before) {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 24px !important;
  right: 24px !important;
  height: 2px !important;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, transparent 100%) !important;
  border-radius: 1px !important;
}

/* 抽屉内分割线样式 */
:deep(.el-drawer .el-divider) {
  margin: 24px 0 !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
}

:deep(.el-drawer .el-divider--horizontal) {
  border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
}

/* 抽屉内卡片样式 */
:deep(.el-drawer .el-card) {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  margin-bottom: 16px !important;
}

:deep(.el-drawer .el-card__header) {
  background-color: #fafafa !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
  padding: 16px 20px !important;
}

:deep(.el-drawer .el-card__body) {
  padding: 20px !important;
}

/* 抽屉内表格样式 */
:deep(.el-drawer .el-table) {
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}

:deep(.el-drawer .el-table th.el-table__cell) {
  background-color: #fafafa !important;
  color: #333 !important;
  font-weight: 600 !important;
}

/* 不同尺寸的抽屉 */
:deep(.el-drawer.drawer-small) {
  width: 350px !important;
}

:deep(.el-drawer.drawer-medium) {
  width: 500px !important;
}

:deep(.el-drawer.drawer-large) {
  width: 700px !important;
}

:deep(.el-drawer.drawer-extra-large) {
  width: 900px !important;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  :deep(.el-drawer) {
    width: 85vw !important;
    border-radius: 0 !important;
  }

  :deep(.el-drawer.rtl) {
    border-radius: 0 !important;
  }

  :deep(.el-drawer__body) {
    padding: 16px !important;
  }

  :deep(.el-drawer .el-form-item) {
    margin-bottom: 16px !important;
  }

  :deep(.el-drawer .drawer-footer) {
    padding: 12px 0 !important;
    margin-top: 16px !important;
  }
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
