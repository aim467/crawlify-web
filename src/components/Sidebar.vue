<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = ref(route.path)

const handleSelect = (path: string) => {
  router.push(path)
}
</script>

<template>
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
</template>

<style scoped>
.sidebar-menu {
  /* height: 100%; */
  border-right: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.el-menu-item {
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.el-menu-item:hover {
  background-color: #f0f7ff !important;
  transform: translateX(4px);
}

.el-menu-item.is-active {
  background: linear-gradient(45deg, #409eff1a, #67c23a1a);
  color: #409eff;
  font-weight: 500;
}

.el-menu-item .el-icon {
  margin-right: 12px;
  font-size: 18px;
}
</style>