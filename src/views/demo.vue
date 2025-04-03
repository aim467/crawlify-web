<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->
<template>
    <div class="min-h-screen bg-gray-50">
        <!-- 登录页面 -->
        <div v-if="!isLoggedIn"
            class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div class="mb-8 text-center">
                <img :src="logoUrl" alt="系统Logo" class="w-16 h-16 mx-auto mb-4 object-cover">
                <h1 class="text-2xl font-bold text-gray-800">爬虫管理平台</h1>
            </div>
            <div class="w-96 bg-white rounded-lg shadow-lg p-8">
                <el-form :model="loginForm" @submit.prevent="handleLogin">
                    <el-form-item>
                        <el-input v-model="loginForm.username" placeholder="请输入用户名" class="!rounded-button">
                            <template #prefix>
                                <el-icon>
                                    <User />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"
                            class="!rounded-button">
                            <template #prefix>
                                <el-icon>
                                    <Lock />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-button type="primary" class="w-full !rounded-button" @click="handleLogin">
                        登录
                    </el-button>
                </el-form>
            </div>
            <div class="mt-8 text-gray-500 text-sm">
                © 2024 爬虫管理平台 版权所有
            </div>
        </div>
        <!-- 主应用布局 -->
        <template v-else>
            <el-container class="h-screen">
                <!-- 侧边栏 -->
                <el-aside width="200px" class="bg-white border-r border-gray-200">
                    <div class="p-4 border-b border-gray-200">
                        <img :src="logoUrl" alt="Logo" class="h-8 mx-auto">
                    </div>
                    <el-menu :default-active="activeMenu" class="h-[calc(100%-4rem)]" @select="handleMenuSelect">
                        <el-menu-item index="websites">
                            <el-icon>
                                <Monitor />
                            </el-icon>
                            <span>网站管理</span>
                        </el-menu-item>
                        <el-menu-item index="tasks">
                            <el-icon>
                                <List />
                            </el-icon>
                            <span>任务管理</span>
                        </el-menu-item>
                        <el-menu-item index="links">
                            <el-icon>
                                <Link />
                            </el-icon>
                            <span>链接管理</span>
                        </el-menu-item>
                    </el-menu>
                </el-aside>
                <el-container>
                    <!-- 顶部导航 -->
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
                    <!-- 主内容区 -->
                    <el-main class="bg-gray-50">
                        <!-- 网站管理 -->
                        <div v-if="activeMenu === 'websites'">
                            <div class="mb-4 flex justify-between">
                                <el-button type="primary" class="!rounded-button" @click="showWebsiteDialog = true">
                                    <el-icon class="mr-1">
                                        <Plus />
                                    </el-icon>新增网站
                                </el-button>
                                <el-input v-model="websiteSearch" placeholder="搜索网站名称" class="w-64 !rounded-button">
                                    <template #prefix>
                                        <el-icon>
                                            <Search />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </div>
                            <el-table :data="websiteList" border class="w-full">
                                <el-table-column label="网站名称" prop="name" />
                                <el-table-column label="网站URL" prop="url" />
                                <el-table-column label="状态" width="120">
                                    <template #default="{ row }">
                                        <el-tag :type="row.status === '运行中' ? 'success' : 'info'">
                                            {{ row.status }}
                                        </el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="250">
                                    <template #default="{ row }">
                                        <el-button-group>
                                            <el-button type="primary" size="small" @click="handleEditWebsite(row)">
                                                编辑
                                            </el-button>
                                            <el-button type="success" size="small" @click="handleStartCrawl(row)">
                                                启动采集
                                            </el-button>
                                            <el-button type="danger" size="small" @click="handleDeleteWebsite(row)">
                                                删除
                                            </el-button>
                                        </el-button-group>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <!-- 任务管理 -->
                        <div v-if="activeMenu === 'tasks'">
                            <div class="grid grid-cols-3 gap-4 mb-6">
                                <el-card v-for="stat in taskStats" :key="stat.title" :class="stat.bgClass">
                                    <div class="flex items-center">
                                        <el-icon :size="40" class="mr-4">
                                            <component :is="stat.icon" />
                                        </el-icon>
                                        <div>
                                            <div class="text-sm text-gray-600">{{ stat.title }}</div>
                                            <div class="text-2xl font-bold">{{ stat.count }}</div>
                                        </div>
                                    </div>
                                </el-card>
                            </div>
                            <el-table :data="taskList" border class="w-full">
                                <el-table-column label="任务ID" prop="id" width="120" />
                                <el-table-column label="关联网站" prop="website" />
                                <el-table-column label="开始时间" prop="startTime" width="180" />
                                <el-table-column label="运行状态" width="120">
                                    <template #default="{ row }">
                                        <el-tag :type="row.status === '运行中' ? 'success' : 'danger'">
                                            {{ row.status }}
                                        </el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column label="采集数量" prop="count" width="120" />
                                <el-table-column label="操作" width="200">
                                    <template #default="{ row }">
                                        <el-button-group>
                                            <el-button type="danger" size="small" :disabled="row.status !== '运行中'"
                                                @click="handleStopTask(row)">
                                                停止
                                            </el-button>
                                            <el-button type="primary" size="small" @click="handleViewTaskDetail(row)">
                                                查看详情
                                            </el-button>
                                        </el-button-group>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <!-- 链接管理 -->
                        <div v-if="activeMenu === 'links'">
                            <div class="bg-white p-4 rounded-lg mb-4">
                                <el-form :inline="true" :model="linkFilter">
                                    <el-form-item label="网站">
                                        <el-select v-model="linkFilter.website" placeholder="选择网站" class="w-48">
                                            <el-option v-for="site in websiteOptions" :key="site.value"
                                                :label="site.label" :value="site.value" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="采集时间">
                                        <el-date-picker v-model="linkFilter.dateRange" type="daterange"
                                            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
                                    </el-form-item>
                                    <el-form-item label="状态">
                                        <el-select v-model="linkFilter.status" placeholder="选择状态" class="w-32">
                                            <el-option label="全部" value="" />
                                            <el-option label="正常" value="normal" />
                                            <el-option label="异常" value="error" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-button type="primary" @click="handleSearchLinks">
                                            搜索
                                        </el-button>
                                    </el-form-item>
                                </el-form>
                            </div>
                            <div class="flex justify-end mb-4">
                                <el-button type="success" @click="handleExportLinks">
                                    <el-icon class="mr-1">
                                        <Download />
                                    </el-icon>导出数据
                                </el-button>
                            </div>
                            <el-table :data="linkList" border class="w-full">
                                <el-table-column label="链接URL" prop="url" />
                                <el-table-column label="所属网站" prop="website" width="180" />
                                <el-table-column label="采集时间" prop="crawlTime" width="180" />
                                <el-table-column label="状态" width="120">
                                    <template #default="{ row }">
                                        <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
                                            {{ row.status }}
                                        </el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="120">
                                    <template #default="{ row }">
                                        <el-button type="primary" size="small" @click="handleViewLinkDetail(row)">
                                            查看详情
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <!-- 分页 -->
                        <div class="flex justify-end mt-4">
                            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                                :total="total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next"
                                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                        </div>
                    </el-main>
                </el-container>
            </el-container>
        </template>
        <!-- 网站表单对话框 -->
        <el-dialog v-model="showWebsiteDialog" :title="editingWebsite ? '编辑网站' : '新增网站'" width="500px">
            <el-form :model="websiteForm" label-width="80px">
                <el-form-item label="网站名称">
                    <el-input v-model="websiteForm.name" />
                </el-form-item>
                <el-form-item label="网站URL">
                    <el-input v-model="websiteForm.url" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showWebsiteDialog = false">取消</el-button>
                <el-button type="primary" @click="handleSaveWebsite">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
import {
    User,
    Lock,
    Monitor,
    List,
    Link,
    Plus,
    Search,
    Download
} from '@element-plus/icons-vue';
// 登录相关
const isLoggedIn = ref(false);
const loginForm = ref({
    username: '',
    password: ''
});
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
// 网站管理相关
const websiteSearch = ref('');
const showWebsiteDialog = ref(false);
const editingWebsite = ref(false);
const websiteForm = ref({
    name: '',
    url: ''
});
const websiteList = ref([
    { name: '新浪科技', url: 'https://tech.sina.com.cn', status: '运行中' },
    { name: '腾讯科技', url: 'https://tech.qq.com', status: '已停止' },
    { name: '36氪', url: 'https://36kr.com', status: '运行中' },
    { name: '钛媒体', url: 'https://www.tmtpost.com', status: '已停止' }
]);
// 任务管理相关
const taskStats = ref([
    { title: '运行中任务', count: 8, icon: 'Monitor', bgClass: 'bg-green-50' },
    { title: '已完成任务', count: 126, icon: 'List', bgClass: 'bg-blue-50' },
    { title: '异常任务', count: 3, icon: 'Warning', bgClass: 'bg-red-50' }
]);
const taskList = ref([
    { id: 'T2024001', website: '新浪科技', startTime: '2024-01-20 10:30:00', status: '运行中', count: 1562 },
    { id: 'T2024002', website: '腾讯科技', startTime: '2024-01-20 09:15:00', status: '已完成', count: 2341 },
    { id: 'T2024003', website: '36氪', startTime: '2024-01-20 11:00:00', status: '运行中', count: 856 }
]);
// 链接管理相关
const linkFilter = ref({
    website: '',
    dateRange: [],
    status: ''
});
const websiteOptions = ref([
    { label: '新浪科技', value: 'sina' },
    { label: '腾讯科技', value: 'qq' },
    { label: '36氪', value: '36kr' }
]);
const linkList = ref([
    { url: 'https://tech.sina.com.cn/article/123456', website: '新浪科技', crawlTime: '2024-01-20 10:35:22', status: '正常' },
    { url: 'https://tech.qq.com/article/789012', website: '腾讯科技', crawlTime: '2024-01-20 10:36:15', status: '正常' },
    { url: 'https://36kr.com/article/345678', website: '36氪', crawlTime: '2024-01-20 10:37:01', status: '异常' }
]);
// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);
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
const handleEditWebsite = (row: any) => {
    editingWebsite.value = true;
    websiteForm.value = { ...row };
    showWebsiteDialog.value = true;
};
const handleStartCrawl = (row: any) => {
    // 实现启动采集逻辑
};
const handleDeleteWebsite = (row: any) => {
    // 实现删除网站逻辑
};
const handleSaveWebsite = () => {
    showWebsiteDialog.value = false;
    // 实现保存网站逻辑
};
const handleStopTask = (row: any) => {
    // 实现停止任务逻辑
};
const handleViewTaskDetail = (row: any) => {
    // 实现查看任务详情逻辑
};
const handleSearchLinks = () => {
    // 实现链接搜索逻辑
};
const handleExportLinks = () => {
    // 实现导出链接逻辑
};
const handleViewLinkDetail = (row: any) => {
    // 实现查看链接详情逻辑
};
const handleSizeChange = (val: number) => {
    pageSize.value = val;
    // 重新加载数据
};
const handleCurrentChange = (val: number) => {
    currentPage.value = val;
    // 重新加载数据
};
</script>
<style scoped>
.el-aside {
    transition: width 0.3s;
}

.el-main {
    padding: 20px;
}

.el-header {
    height: 64px;
    line-height: 64px;
}

:deep(.el-input__wrapper) {
    box-shadow: none !important;
}

:deep(.el-table) {
    --el-table-border-color: #e5e7eb;
    --el-table-header-bg-color: #f9fafb;
}

:deep(.el-button-group .el-button) {
    margin-left: -1px;
}

:deep(.el-card) {
    border: none;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.bg-green-50 {
    background-color: #f0fdf4;
}

.bg-blue-50 {
    background-color: #eff6ff;
}

.bg-red-50 {
    background-color: #fef2f2;
}
</style>
