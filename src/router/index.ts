import { createRouter, createWebHistory } from 'vue-router'
import WebsiteList from '../components/WebsiteList.vue'
import TaskList from '../components/TaskList.vue'
import WebsiteLinkList from '../components/LinkList.vue'
import WebsiteConfig from '../views/WebsiteConfig.vue'
import TemplateManagement from '../views/TemplateManagement.vue'
import { useAuthStore } from '../store/auth'; // 导入 Pinia store
import Login  from "../views/Login.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      name: 'home',
      component: WebsiteList,
      meta: { requiresAuth: true }
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TaskList,
      meta: { requiresAuth: true }
    },
    {
      path: '/website-links',
      name: 'website-links',
      component: WebsiteLinkList,
      meta: { requiresAuth: true }
    },
    {
      path: '/website-config',
      name: 'website-config',
      component: WebsiteConfig,
      meta: { requiresAuth: true }
    },
    {
      path: '/template-management',
      name: 'template-management',
      component: TemplateManagement,
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // 在守卫内部获取 store 实例
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // 如果目标路由需要认证且用户未认证，则重定向到登录页
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    // 如果用户已认证且尝试访问登录页，则重定向到首页
    next('/');
  } else {
    // 其他情况正常放行
    next();
  }
});



export default router