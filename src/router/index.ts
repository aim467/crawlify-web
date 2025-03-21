import { createRouter, createWebHistory } from 'vue-router'
import WebsiteList from '../views/WebsiteList.vue'
import TaskList from '../views/TaskList.vue'
import WebsiteLinkList from '../views/WebsiteLinkList.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WebsiteList
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TaskList
    },
    {
      path: '/website-links/:id',
      name: 'website-links',
      component: WebsiteLinkList
    }
  ]
})

export default router