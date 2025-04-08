<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
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
  width: 200px;
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
</style>
