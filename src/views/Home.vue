<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 登录页面 -->
    <Login v-if="!isLoggedIn" @login="handleLogin" />
    <!-- 主应用布局 -->
    <template v-else>
      <el-container class="h-screen">
        <Sidebar :active-menu="activeMenu" :logo-url="logoUrl" @menu-select="handleMenuSelect" />
        <el-container>
          <Header :page-title="pageTitle" :user-avatar="userAvatar" @logout="handleLogout" />
          <el-main class="bg-gray-50">
            <!-- 网站管理 -->
            <WebsiteList v-if="activeMenu === 'websites'" 
              @save="handleSaveWebsite"
              @delete="handleDeleteWebsite"
              @start-crawl="handleStartCrawl" />
            <!-- 任务管理 -->
            <TaskList v-if="activeMenu === 'tasks'"
              @stop="handleStopTask"
              @view-detail="handleViewTaskDetail" />
            <!-- 链接管理 -->
            <LinkList v-if="activeMenu === 'links'"
              @search="handleSearchLinks"
              @export="handleExportLinks"
              @view-detail="handleViewLinkDetail"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </el-main>
        </el-container>
      </el-container>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import Login from '../components/Login.vue';
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
import WebsiteList from '../components/WebsiteList.vue';
import TaskList from '../components/TaskList.vue';
import LinkList from '../components/LinkList.vue';

// 登录相关
const isLoggedIn = ref(false);

// 系统资源
const logoUrl = 'https://ai-public.mastergo.com/ai/img_res/de1e878e5cb64a628cbf9769892cac4b.jpg';
const userAvatar = 'https://ai-public.mastergo.com/ai/img_res/e15c52610672e56b8bdc79a1d44e5625.jpg';

// 导航相关
const activeMenu = ref('websites');
const pageTitle = computed(() => {
  const titles = {
    websites: '网站管理',
    tasks: '任务管理',
    links: '链接管理'
  };
  return titles[activeMenu.value as keyof typeof titles];
});

// 方法定义
const handleLogin = () => {
  isLoggedIn.value = true;
};

const handleLogout = () => {
  isLoggedIn.value = false;
};

const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};

const handleSaveWebsite = (website: any) => {
  // 实现保存网站逻辑
};

const handleDeleteWebsite = (website: any) => {
  // 实现删除网站逻辑
};

const handleStartCrawl = (website: any) => {
  // 实现启动采集逻辑
};

const handleStopTask = (task: any) => {
  // 实现停止任务逻辑
};

const handleViewTaskDetail = (task: any) => {
  // 实现查看任务详情逻辑
};

const handleSearchLinks = (filter: any) => {
  // 实现链接搜索逻辑
};

const handleExportLinks = () => {
  // 实现导出链接逻辑
};

const handleViewLinkDetail = (link: any) => {
  // 实现查看链接详情逻辑
};

const handleSizeChange = (size: number) => {
  // 实现分页大小变化逻辑
};

const handleCurrentChange = (page: number) => {
  // 实现当前页变化逻辑
};
</script>

<style scoped>
.el-main {
  padding: 20px;
}
</style>