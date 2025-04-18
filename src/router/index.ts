import { createRouter, createWebHistory } from 'vue-router'
import WebsiteList from '../components/WebsiteList.vue'
import TaskList from '../components/TaskList.vue'
import WebsiteLinkList from '../components/LinkList.vue'
import Login from '../views/Login.vue'
import Demo from '../views/demo.vue'
import WebsiteConfig from '../views/WebsiteConfig.vue'

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
      path: '/demo',
      name: 'demo',
      component: Demo
    },
    {
      path: '/website-config',
      name: 'website-config',
      component: WebsiteConfig,
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  // if (to.meta.requiresAuth && !isAuthenticated) {
  //   next('/login')
  // } else if (to.path === '/login' && isAuthenticated) {
  //   next('/')
  // } else {
  // }
  next()
})



export default router